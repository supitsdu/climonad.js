import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"
import esbuild from "rollup-plugin-esbuild"
import { reportDetails } from "rollup-plugin-bundlens"
const external = ["node:path", "node:zlib", "node:util"]

export default [
	{
		input: ["src/main.ts"],
		plugins: [typescript(), reportDetails()],
		output: { dir: "build", format: "es", exports: "auto" },
		external,
	},
	{
		input: "build/main.js",
		plugins: [
			esbuild({ minify: true, target: "esnext", minifyIdentifiers: true, minifySyntax: true, minifyWhitespace: true }),
			reportDetails(),
		],
		output: [
			{ file: "dist/main.cjs", format: "cjs", exports: "auto" },
			{ file: "dist/main.mjs", format: "esm", exports: "auto" },
		],
		external,
	},
	{
		input: "build/src/main.d.ts",
		plugins: [dts(), reportDetails()],
		output: { file: "dist/main.d.ts", format: "esm", exports: "auto" },
		external,
	},
]
