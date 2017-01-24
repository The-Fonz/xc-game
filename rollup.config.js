import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

let babelConfig = {
    "exclude": 'node_modules/**',
    "presets": [
        ["es2015", {"modules": false}],
    ],
    "plugins": ["transform-flow-strip-types"]
};

let resolveConfig = {
    "jsnext": true,
    "main": true,
    "browser": true,
};

export default {
    entry: 'src/main.js',
    dest: 'build/static/bundle.js',
    format: 'iife',
    plugins: [
        resolve(resolveConfig),
        commonjs(),
        babel(babelConfig),
        uglify(),
    ],
};