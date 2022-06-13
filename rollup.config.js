import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import node from "rollup-plugin-node";
import nodeGlobals from "rollup-plugin-node-globals2";
import { defineConfig } from "rollup";

export default defineConfig({
	plugins: [
		typescript(),
		nodeResolve(),
		commonjs(),
		node(),
	],
});