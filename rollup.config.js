import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default [ {
    input : 'src/index.js',
    plugins : [
        resolve( {
            module : true,
            jsnext : true
        } )
    ],
    output : [
        { file : 'dist/local-cache.cjs.js', format : 'cjs' },
        { file : 'dist/local-cache.js', format : 'umd', name : 'LocalCache' }
    ]
}, {
    input : 'src/index.js',
    plugins : [
        resolve( {
            module : true,
            jsnext : true
        } ),
        babel()
    ],
    output : [
        { file : 'dist/local-cache.bc.js', format : 'umd', name : 'LocalCache' }
    ]
} ];
