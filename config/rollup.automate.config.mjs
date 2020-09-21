import resolve from "@rollup/plugin-node-resolve";
import commonJS from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default {
    input: "src/index.js",
    output: {
        file: "dist/bundle.min.js",
        format: "cjs",
    },
    plugins: [
        // Choose CJS entry points over ESM ones
        resolve({
            mainFields: ["main", "module"]
        }),

        // Support loading CJS modules since we're targeting node
        commonJS(),

        // Minify generated bundle
        // This will also minify bundled dependencies (regardless of whether that are minified already),
        // so we may need to remove this if the build step starts taking too long
        terser()
    ]
};