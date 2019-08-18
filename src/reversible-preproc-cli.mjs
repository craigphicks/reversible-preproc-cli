`use strict`

import ReversiblePreproc from 'reversible-preproc'
import yargs from 'yargs'
import split2 from 'split2'
import through2 from 'through2'
import fs from 'fs'
import events from 'events'
import { pipeline, finished } from 'stream'
import util from 'util'
import parseArgs from 'minimist'
import dedent from 'dedent'

var progArgs = process.argv.slice(2)
console.log('progArgs: ', progArgs)

// const ya=yargs
//     .command('pp', 'perform reversible pre proc on file', {
//         infile: {
//             description: 'input file',
//             alias: 'i',
//             type: 'string',
//         },
//         outfile: {
//             description: 'output file',
//             alias: 'o',
//             type: 'string',
//         },
//         defline: {
//             description: 'json to use as defines, passed as string',
//             alias: 'l',
//             type: 'string'
//         },
//         deffile: {
//             description: 'json to use as defines, read from file',
//             alias: 'f',
//             type: 'string'
//         }
//     })
//     .help()
//     .alias('help', 'h')

// const ya1 = ya.argv


function showHelp(){
let tpl = dedent`
The preprocessor has two inputs.  
The main input is the file to be transformed.  This file is embedded 
with conditonal statements to switch on or off sections of code.
The conditiona statements depend upon variables which are defined 
in the second input, which is JSON data.  This JSON data may be input 
through a file or directly on the command line.  We call this JSON
data the 'defines'.

To switch off a section of code it preceded with annotated comments '//!!'
E.g.
    A day in the park
becomes
    //!!A day in the park

For a given 'defines', the preprocessor is idempotent, which means
running it twice will have no effect on the second pass.

The processing is reversible in the sense that commented data is not removed,
and the state once reached with defines 'A' can always be reached again by 
re-applying defines 'A', no matter what defines were applied inbetween.

The special defines "*" removes all annoted comments regardless of the 
controlling conditional statements.  This is useful for producing 
a canonical state, even though that state may not be be valid script.


-i --infile <filename> 
    The file to be transformed.  If omitted stdin will be used.

-o --outfile <filename>
    The file to which to write the transformed data. If omitted 
stdout will be used.

-f --deffile <filename>
    The file containing the JSON variable properties.

-l --defline <inline JSON>
    To pass the JSON defines inline.  Due to the need to escape 
    quotations marks this option is only usefule for simple cases.

-t --testout
    Instead of outputting the transformed input, the output contains 
    one line for conditional statement with the form:
    <T or F>  <conditional statement>


NOTE: Only one, and exactly one, of the '--deffile' and '--defline'
options can/must be used.

Defines:
    Top level must be an object with properties (not an array),
    or the unique string "*".
    Example '---deffile' file data:
    {
        "DEBUG" : 2,
        "select":1,
        "configs": [{ 
                'A':0,
                'B':1
            },{
                'A':1,
                'B':0,
                'C':1
        }],
        "config": configs['select']
    }
    This data will be passed through 'JSON.parse()', which requires property
    names to be double quoted. 

    The unique string "*" is a special instruction to evaluate every conditional
    expression to TRUE.

    Using the "--defline" option has to deal with the OS interference with quotes
    which are usually removed by the OS.  So to pass the unique string "*" 
    would require
        --defline "\"*'\""

Conditional statements:
    All conditional statements have the form:
        //   if<<CONDITIONAL-STATEMENT>>
    which determines the on/off state of the code up to the corresponding line
        //   <<>>
    Conditional statements can be embedded to arbitrary level, 
    but not overlap:
        //   if<<CONDITIONAL-STATEMENT-A>>
        on/off determined by A
        //   if<<CONDITIONAL-STATEMENT-B>>
        on/off determined by B
        //   <<>>
        on/off determined by A
        //   <<>>

    Two types of conditional statements are implemented:
    -  psuedo javascript (which doesn't use eval)
    -  actual javascript (which does use eval)
    
    The 'psuedo javascript' allows briefer expression,
    but the 'atual javascript' is almighty.

Psuedo javascript conditionals:
    The 'pseudo javascript' uses the npm module 'jsep' to parse,
    and then an interpreter to execute the parsed data.  Example:
        // if<<DEBUG>1&&config.B>>
    which would evaluate to false using the above defines example.

    Round parantheses '(' and ')' are allowed for grouping logic.

    Square brackets '[' and ']' are allowed for property access as
    and alternative to '.' or where the identifier is a variable and 
    '.' can't be used.

    Allowed binary operators are
        '<=' '<'  '>' '>=' '==' '===' '!=' '!==' '&&' '||'
    Allowed unary operators are 
        '!'
    Predefined literals
        'null', 'undefined'

    Just like javascript nonexistant property may or may not result
    in an exception.  Exceptions will terminate processing.

    Two predefined functions are provided:
        'def(PROPERTY)' and 'ndef(PROPERTY)'
    'def()' and 'ndef()' return 'true' or 'false', regardless of the 
    property value.  They never throw.  Example usage:
        // if<< def(config.C) && config.C >>
    or 
        // if<< def(configs[2]) >> 
    which are respectively 'true' and 'false' given the above defines example.

Actual javascript conditionals:
    These have the form
        // if<<:(DEFINESVAR)=>{ ARBITRARY FUNCTION OF DEFINESVAR }
    For example
        // if<<:(D)=>{ D.debug && D.config.B > 1 }>>
    This function will be evaluated with eval, and the defines object 
    will be passed as the parameter.  
    In the special case where defines is "*", the function will not be 
    evaluated.

`    
    
    




}


const argv = yargs
    .command('$0', 'perform reversible pre proc on file', {
        infile: {
            description: 'input file',
            alias: 'i',
            type: 'string',
        },
        outfile: {
            description: 'output file',
            alias: 'o',
            type: 'string',
        },
        defline: {
            description: 'json to use as defines, passed as string',
            alias: 'l',
            type: 'string'
        },
        deffile: {
            description: 'json to use as defines, read from file',
            alias: 'f',
            type: 'string'
        }
    })
    .help()
    .alias('help', 'h')
    .parserConfiguration({'no-process-value':true})
    .argv

// const argv1 = yargs
//     .command('$0', 'perform reversible pre proc on file', {
//         infile: {
//             description: 'input file',
//             alias: 'i',
//             type: 'string',
//         },
//         outfile: {
//             description: 'output file',
//             alias: 'o',
//             type: 'string',
//         },
//         defline: {
//             description: 'json to use as defines, passed as string',
//             alias: 'l',
//             type: 'string'
//         },
//         deffile: {
//             description: 'json to use as defines, read from file',
//             alias: 'f',
//             type: 'string'
//         }
//     })
//     .help()
//     .alias('help', 'h')
//     .parserConfiguration()
//     .argv

console.log("")

async function PreProc(rpp, readable, writable) {
    function makeThroughLineFunc(rpp) {
        return (line, enc, next) => {
            //console.log(line)
            let [err, outline] = rpp.line(line)
            //console.log(outline)
            next(err, outline + '\n')
        }
    }
    await events.once(
        readable
            .pipe(split2())
            .pipe(through2.obj(makeThroughLineFunc(rpp)))
            .pipe(writable),
    'finish')
}

function ownKey(o,k){ return Reflect.ownKeys(o).includes(k) }
function defined(x) { return x!==undefined }

if (argv._.includes('pp')) {
    console.log(argv)
    // set up streams
    let rawdata, readable, writable
    if (argv.deffile!==undefined){
        rawdata = fs.readFileSync(argv.deffile)
    } else if (argv.defline!==undefined){
        rawdata = argv.defline
    } else {
        throw Error('json define data not provided but is required')
    }
    let defJson = JSON.parse(rawdata)
    console.log("The defines input is:")
    console.log(JSON.stringify(defJson, 0, 2))
    let rpp = new ReversiblePreproc(defJson)

    if (argv.infile!==undefined){
        readable = fs.createReadStream(argv.infile)
    } else { // use stdin
        readable = process.stdin   // ???
    }
    if (argv.outfile!==undefined){
        writable = fs.createWriteStream(argv.outfile)
    } else { // use stdin
        writable = process.stdout   // ???
    }

    // fs.createReadStream(argv.infile)
    //     .pipe(split2())
    //     .on('data', function (line) {
    //         let [err, lineout] = rpp.line(line)
    //         if (err)
    //             console.log(err)
    //         console.log(lineout)            
    //     })

    PreProc(rpp, readable, writable)
}

