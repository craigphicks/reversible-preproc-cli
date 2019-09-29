'use strict'
const child_process = require('child_process')
const cmds = [
  'rm -f src/*.tmp',
  'node --experimental-modules ./src/reversible-preproc-cli.mjs '
  + '-df packageJson ./package.json ' 
  + '<  ./src/reversible-preproc-cli.mjs > ./src/reversible-preproc-cli.mjs.tmp',
  'mv ./src/reversible-preproc-cli.mjs ./src/reversible-preproc-cli.mjs.back.tmp',
  'mv ./src/reversible-preproc-cli.mjs.tmp ./src/reversible-preproc-cli.mjs',
  'rm -f lib/*',
  '$(npm bin)/rollup -c',
  'chmod +x rpp-cli',
]


try {
  var c, so
  for (c of cmds) {
    so = child_process.execSync(c, { encoding: 'utf-8' })
    //console.log('OK\n',so)
  }
  console.log("build SUCCESS")
  process.exitCode = 0
} catch (e) {
  console.log('command fail:\n', c)
  console.log('command output:\n', so)
  console.log('command error:\n', e)
  console.log("build FAIL")
  process.exitCode = 1
}
