import babel from '@rollup/plugin-babel';

const pkg = require( './package.json' );

var external = Object.keys( pkg.dependencies );

export default {
    input: 'src/index.js',
    output: [
		{
            file: pkg.main,
            format: 'cjs',
            sourcemap: true
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }
    ],
    plugins: [ babel({
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env']
    }) ],
    external: external
};
