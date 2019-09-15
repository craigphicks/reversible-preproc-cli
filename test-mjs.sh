#!/bin/bash

#PATH=$(npm bin):$PATH

rm -f test/data/test-data.out1.js

node --experimental-modules \
	 src/reversible-preproc-cli.mjs \
	 -i test/data/test-data.js \
	 -o test/data/test-data.out1.js \
	 -f test/data/test-defines.json \
	|| { echo " test 1 fail [1]" ; exit 1 ; }
	
diff test/data/test-data.out1.js test/data/test-data.out1.expect.js \
	|| { echo " test 1 fail [2]" ; exit 2 ; }

echo "test 1 pass"

cat test/data/test-data.js \
	| node --experimental-modules \
		   src/reversible-preproc-cli.mjs \
		   -l '{"Cond1":true,"Cond2":false}' \
		   > test/data/test-data.out2.js \
		|| { echo " test 2 fail [3]" ; exit 3 ; }

diff test/data/test-data.out2.js test/data/test-data.out2.expect.js \
	|| { echo " test 2 fail [4]" ; exit 4 ; }

echo "test 2 pass"
