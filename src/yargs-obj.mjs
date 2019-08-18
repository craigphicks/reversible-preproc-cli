'use strict'
class YargsClass {
    constructor(yargs){
        this.yargs=yargs
    }
}

export default async function createYargsClass(targetArgv, cwd){
    //var process = { argv:targetArgv, env:targetEnv }
    var yargsModule = await import('../node_modules/yargs/yargs.js')
    var yargs = yargsModule.default(targetArgv, cwd)
    return new YargsClass(yargs)
}