// Karma configuration
// Generated on Tue Jul 11 2017 12:49:06 GMT+0800 (CST)

process.env.CHROME_BIN = require( 'puppeteer' ).executablePath();

const fs = require( 'fs' );
const crypto = require( 'crypto' );
const argv = require( 'optimist' ).argv;
const randomstring = require( 'randomstring' );
const resolve = require( 'rollup-plugin-node-resolve' );

// generate a list for testing md5 function
const list = [];
for( let i = 0; i < 1000; i += 1 ) {
    const str = randomstring.generate( ~~( Math.random() * 500 ) );
    list.push( {
        str,
        md5 : crypto.createHash( 'md5' ).update( str ).digest( 'hex' )
    } );
}

fs.writeFileSync( 'test/md5-cases.js', 'export default ' + JSON.stringify( list, null, 4 ), 'utf8', err => {
    if( err ) {
        console.log( 'Error', err );
    }
} );

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        // Most versions of PhantomJS do not suppport ES5 and ES6, so add es6-shim here to make sure all
        // test cases could be executed in PhantomJS
        frameworks: [ 'jasmine' ],


        // list of files / patterns to load in the browser
        files : ( () => {
            const files = [
                'test/main.js',
                { pattern : 'src/**/*.js', included : false, watched : false }
            ];

            if( argv.file || argv.files ) {
                argv.file && files.push( {
                    pattern : argv.file.trim(),
                    included : true,
                    watched : false
                } );

                argv.files && argv.files.split( ',' ).forEach( file => {
                    files.push( {
                        pattern : file.trim(),
                        included : true,
                        watched : false
                    } );
                } );
            } else {
                files.push( {
                    pattern : 'test/**/*.spec.js',
                    included : true,
                    watched : false
                } );
            }

            return files;
        } )(),

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/**/*.js' : [ 'rollup' ],
        },

        // 
        rollupPreprocessor : {
            plugins : [
                resolve( {
                    module : true,
                    jsnext : true
                } )
            ],
            output : {
                format : 'iife'
            }
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 7997,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [ 'ChromeHeadless' ], //PhantomJS

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    } );
};
