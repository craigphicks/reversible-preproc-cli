/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
`use strict`

import Rpp from 'reversible-preproc'
import fs from 'fs'
import { pipeline } from 'stream'
import util from 'util'
import parseArgs from 'minimist'
import dedent from 'dedent'

function _assert(cond, msg) {
  if (!cond) {
    console.log(msg)
    throw Error(msg)
  }
}

//console.log('process.argv: ')
//console.log(process.argv)

//--if def(packageJson.name) && def(packageJson.version)
/*--render
let package_version = "{{packageJson.name}} {{packageJson.version}}"
--end*/
//--else
let package_version = "reversible-preproc-cli ?.?.?"
//--endif
let reversible_preproc_cli_version = package_version
let reversible_preproc_version = Rpp.queryVersion()



const symInFile = Symbol("Infile")
const symOutFile = Symbol("Outfile")
const symDefFile = Symbol("Deffile")
const symDefLine = Symbol("Defline")
const symDefEnv = Symbol("Defenv")
const symVersion = Symbol("Version")
const symHelp = Symbol("Help")

const argvMm = parseArgs(process.argv)

const margv = new Map
margv.set('i', symInFile)
margv.set('o', symOutFile)
margv.set('df', symDefFile)
margv.set('dl', symDefLine)
margv.set('de', symDefEnv)
margv.set('v', symVersion)
margv.set('h', symHelp)
margv.set('infile', symInFile)
margv.set('outfile', symOutFile)
margv.set('deffile', symDefFile)
margv.set('defline', symDefLine)
margv.set('defenv', symDefEnv)
margv.set('version', symVersion)
margv.set('help', symHelp)

class ArgsRepeatOptionsParse {
  emptyOpt() {
    return {
      option: null,
      optargs: []
    }
  }
  constructor() {
    this.current = this.emptyOpt()
    this.opts = []
  }
  parse(argv) {
    for (let i = 2; i < argv.length; i++) {
      let res = /^-{1,2}([^-].*)$/.exec(argv[i])
      let key
      if (res) {
        key = margv.get(res[1])
      }
      // if not a key then it must be a value
      if (!key && !this.current.option)
        throw Error(`expecting - or -- option first`)
      if (!key) {
        this.current.optargs.push(argv[i])
      } else {
        if (this.current.option)
          this.opts.push(this.current)
        this.current = this.emptyOpt()
        this.current.option = key
      }
    }
    this.opts.push(this.current)
    this.current = this.emptyOpt()
  }
}


const arop = new ArgsRepeatOptionsParse()
arop.parse(process.argv)

//console.log(JSON.stringify(arop,null,2))

const argData = {
  readable: null,
  outfile: null,
  writable: null,
  defines: {}
}



var tmpDefs
for (let opt of arop.opts) {
  //
  switch (opt.option) {
    case symInFile:
      _assert(!argData.readable, 'infile specified more than once')
      if (opt.optargs.length)
        argData.readable = fs.createReadStream(opt.optargs[0])
      break
    case symOutFile:
      _assert(!argData.writable, 'outfile specified more than once')
      if (opt.optargs.length) {
        argData.outfile = opt.optargs[0]
        argData.writable = fs.createWriteStream(opt.optargs[0])
      }
      break
    case symDefFile:
    case symDefLine:
    case symDefEnv:
      {
        switch (opt.option) {
          case symDefFile:
            tmpDefs = JSON.parse(fs.readFileSync(opt.optargs.slice(-1)[0]))
            break
          case symDefLine:
            tmpDefs = JSON.parse(opt.optargs.slice(-1)[0])
            break
          case symDefEnv:
            tmpDefs = process.env
            break
        }
        if (opt.optargs.length === 0
          || (opt.optargs.length === 1 && opt.option !== symDefEnv)) {
          Rpp.forceAssignRHS(argData.defines, null, tmpDefs)
        } else {
          Rpp.forceAssignRHS(argData.defines, opt.optargs[0], tmpDefs)
        }
      }
      break
    case symVersion:
      process.stdout.write(
        dedent`
        ${reversible_preproc_cli_version}
        ${reversible_preproc_version}
        `
      )
      process.exit(0)
      break
    case symHelp:
      showHelp()
      break
    default:
      throw Error("programmer error")
  }
}

function showHelp() {
  process.stdout.write(helpTpl())
}

async function PreProc(rpp, readable, writable) {
  try {
    await util.promisify(pipeline)(
      readable,
      new Rpp.Transform(rpp),
      writable
    )
    return null
  } catch (err) {
    return err
  }
}

async function main() {
  let rpp = new Rpp.Core(argData.defines)

  if (!argData.readable) {
    argData.readable = process.stdin
  }
  if (!argData.writable) {
    argData.writable = process.stdout
  }
  let e = await PreProc(rpp, argData.readable, argData.writable)
  if (e) {
    console.log('FAILURE')
    console.log(e)
    if (argData.outfile) {
      console.log(`removing incomplete output file ${argData.outfile}`)
      fs.unlinkSync(argData.outfile)
    }
  } else {
    if (argData.outfile) {
      console.log(`wrote output file ${argData.outfile}`)
    }
  }
}
main()

function helpTpl() {
  return `
Command line arguments:

Options must be preceded by one or two '-' (short of long either ok)
Options must not be concatenated; to each its own hyphen(s). 
Some options can be repeated.

-i --infile <filename> 
    The file to be transformed.  If omitted stdin will be used.

-o --outfile <filename>
    The file to which to write the transformed data. If omitted 
stdout will be used.

-df --deffile [key] <filename>
    A file containing JSON data which will be assigned to the "defines"
    data passed to the reversible-preproc process.
    If the optional [key] is present, defines[key] is the receiver of assignment,
    otherwise defines top-level is the receiver.  
    Assignment is using the Object.assigns() operation unless the rhs is 
    not an "true" object (typeof !=== 'object || instanceof Array)
    Can be used multiple times, overwriting / merging with previous assignments,
    in the command line order

-dl --defline [key] <inline JSON>
    To pass the JSON defines inline.  Otherwise same as 'deffile'

-de --defenv [key] 
    Use process.env as the data to assign.  
    IMPORTANT: If [key] is not present the key 'env' will be automatically created for it,
    it will NOT be assigned to defines top-level.
    Otherwise same as 'deffile'

-v, --version
    Print version number and quit 

-h, --help
    Show this help and quit

For complete documentation with preprocessing grammer see 
    https://www.npmjs.com/package/reversible-preproc
and 
    https://www.npmjs.com/package/reversible-preproc-cli

`
}
