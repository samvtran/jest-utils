/**
 * Copyright (C) 2016 Sam Tran
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
