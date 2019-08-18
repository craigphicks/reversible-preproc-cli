'use strict'

import createYargsClass from './yargs-obj.mjs'


(async function () {
    let myArgv = [
        ["goo", "--car", "CAR", "--caz", "CAZ"],
        ["goo", "--car", "BAR", "--caz", "BAZ"]
    ]
    //    let myArgv=["goo", "--car", "CAR", "--caz", "CAZ"]
    var yac = []
    yac[0] = await createYargsClass(myArgv[0], process.cwd())
    yac[1] = await createYargsClass(myArgv[1], process.cwd())
    //    console.log(yac.yargs)

    var argv=[]
    for (let i = 0; i < 2; i++) {
        argv[i] = yac[i].yargs.command("goo", "GOO", {
            car: {
                description: ' car arg ',
                alias: 'r',
                type: 'string'
            },
            caz: {
                description: ' caz arg ',
                alias: 'z',
                type: 'string'
            },
        })
            .argv
    }
    console.log("argv[0]=", JSON.stringify(argv[0],0,2))
    console.log("argv[1]=", JSON.stringify(argv[1],0,2))
})()

