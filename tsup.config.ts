import { defineConfig } from "tsup"

export default defineConfig((env) => {
    return {
        entry: {
            index: "./src/index.ts"
        },
        format: ["esm", "cjs"],
        splitting: true,
        cjsInterop: true,
        skipNodeModulesBundle: true,
        treeshake: true,
    }
})