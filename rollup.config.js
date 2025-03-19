import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { rimrafSync } from "rimraf";


export default function config() {
  // Clean dist folder
  rimrafSync("dist")

  return defineConfig({
    input: "src/index.ts",
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      })
    ],
    output: {
      file: 'dist/index.js',
      format: "es",
      sourcemap: false,
    }
  })
}
