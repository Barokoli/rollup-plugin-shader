const rollup = require( 'rollup' );
const shader = require( '..' );
const fs = require('fs');
const path = require('path');


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

        result = await bundle('../test/samples/advanced-fragment-2.glsl', {singeFuncMode: false});
        code = result.output[0].code;
        console.log(code.split(/\\n/).join('\n'))

        const relativePath = './out/output.glsl';

        const dir = path.dirname(relativePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        fs.writeFileSync(relativePath, code.split(/\\n/).join('\n'), 'utf8');
        console.log(`Writing to ${relativePath}`)
    })
})
