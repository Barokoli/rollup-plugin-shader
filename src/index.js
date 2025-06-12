import {
    createFilter
} from 'rollup-pluginutils';

import {parse} from "./parser"

function glsl( {
	include = [ '**/*.glsl', '**/*.vs', '**/*.fs' ],
	exclude,
	removeComments = true,
    singeFuncMode = false
} = {} ) {

    const filter = createFilter( include, exclude );

    return {

        name: 'shader postprocessor',
        transform( code, id ) {

            if ( !filter( id ) ) return;

            this.addWatchFile(id);

			if ( removeComments ) {
				code = code.replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
    				.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
    				.replace( /\n{2,}/g, '\n' ) // # \n+ to \n
			}


            let transformed = ""
            if (!singeFuncMode) {
                const parsedMap = parse(code);

                for (const [name, content] of Object.entries(parsedMap)) {
                    transformed += "\n" + `export const ${name} = ${JSON.stringify(content)}`
                }
            } else {
                transformed += "\n" + `export default \`${code}\``
            }

            return {
                code: transformed,
                map: {
                    mappings: ''
                }
            };

        }

    };

}

export default glsl;
