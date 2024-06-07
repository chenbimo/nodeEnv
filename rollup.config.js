import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
export default {
    input: 'extension.js',
    plugins: [
        //
        nodeResolve(),
        commonjs(),
        json()
    ],
    output: {
        file: 'dist/extension.cjs',
        format: 'cjs',
        strict: true,
        generatedCode: {
            constBindings: true
        }
    },
    treeshake: {
        moduleSideEffects: false
    }
};
