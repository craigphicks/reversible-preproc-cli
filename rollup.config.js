// For maximum control, arrays of globs to include and exclude.

//import nodeResolve from "rollup-plugin-node-resolve"
//import commonjs from "rollup-plugin-commonjs"


export default [
	{
		input: "src/reversible-preproc-cli.mjs",
		output: {
			file: "lib/index.js",
			format: "cjs"
		}
//		plugins:[
//			nodeResolve({}),
//			commonjs({})
//		]
	}
]

