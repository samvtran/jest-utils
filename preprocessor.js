// A working preprocessor that avoids webpack, resolves aliases for both webpack modules and jest.unmock, 
// and applies Facebook's inline-requires to test files with top-level requires
require('babel-register');
var babel = require('babel-core');
var webpack = require('path/to/webpack.config');
var path = require('path');
var webpackAliases = Object.keys(webpack.resolve.alias).map(function(key) {
    return { expose: key, src: webpack.resolve.root + '/' + webpack.resolve.alias[key] };
});
webpackAliases.push({
    expose: 'helpers', src: 'js/tests/utils/helpers.js'
}, {
    expose: 'fixtures', src: 'js/tests/utils/fixtures'
}, {
    expose: 'js', src: 'js/src'
});

var unmockAlias = require('./unmock-alias');

var basePlugins = [
    [unmockAlias, webpackAliases],
    ['module-alias', webpackAliases]
];

var inlineRequires = require('./inline-requires');
var jestPreset = require('babel-preset-jest');

module.exports = {
    process: function(src, filename) {
        if (filename.indexOf('node_modules') === -1) {
            if (babel.util.canCompile(filename)) {
                var plugins = filename.indexOf(path.join('/', 'js', 'tests')) !== -1 ? basePlugins.concat(inlineRequires) : basePlugins;
                src = babel.transform(src, {
                    auxiliaryCommentBefore: 'istanbul ignore next',
                    filename,
                    presets: [jestPreset],
                    plugins: plugins,
                    retainLines: true
                }).code;
            }

            //if (filename.indexOf('/js/tests/') !== -1) console.log(src);
        }

        return src;
    }
};
