'use strict'
//const dedent = require('dedent')
const execSync = require('child_process').execSync
const fs = require('fs')

function getFileText(filename) {
  let t = fs.readFileSync(filename, 'utf8')
  return t
}

const cmdArgs = [
  `  
  rm -f test/data/test-data.out1.js
`,
  `
  node \
     lib/index.js \
     -i test/data/test-data.js \
     -o test/data/test-data.out1.js \
     -df test/data/test-defines.json \
`,
  `    
  diff test/data/test-data.out1.js test/data/test-data.out1.expect.js \
`,
  `  
  cat test/data/test-data.js \
    | node \
         lib/index.js \
         -dl '${getFileText("test/data/test-defines.json")}' \
         > test/data/test-data.out1.js \
`,
  `  
  diff test/data/test-data.out1.js test/data/test-data.out1.expect.js \
`,
  `
  node \
     lib/index.js \
     -i test/data/in.demo0.js \
     -o test/data/out.demo0.js \
     -df test/data/defines.demo0.json \
`,
  `    
  diff test/data/out.demo0.js test/data/exp.demo0.js \
`,

]
try {
  var c,so
  for (c of cmdArgs) {
    so = execSync(c, { encoding: 'utf-8' })
    //console.log('OK\n',so)
  }
  console.log("SUCCESS")
  process.exitCode=0
} catch (e) {
  console.log('command fail:\n', c)
  console.log('command output:\n', so)
  console.log('command error:\n', e)
  process.exitCode=1
}
