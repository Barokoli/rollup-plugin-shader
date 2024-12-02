import mocha from 'rollup-plugin-mocha';

export default {
    input: 'test/test.spec.js',
    output: {
        file: 'tmp/test.cjs',
        format: 'cjs',
        sourcemap: true
    },
    plugins: [mocha()]
};
