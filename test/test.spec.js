const rollup = require( 'rollup' );
const shader = require( '..' );


function bundle( input, pluginOptions = {}, generateOptions = {}, rollupOptions = {} ) {
    input = require.resolve( input );
    return rollup.rollup( Object.assign( {
        input: input,
        plugins: [ shader( pluginOptions ) ],
    }, rollupOptions ) ).then( bundle => {
        return bundle.generate( Object.assign( {
            format: 'es'
        }, generateOptions ) );
    } );
}

describe( 'import GLSL files', () => {
    it("import", async () => {

        let result, code;

        result = await bundle('../test/samples/advanced-fragment.glsl');
        code = result.output[0].code;
        console.log(code.split(/\\n/).join('\n'))
    })
})
