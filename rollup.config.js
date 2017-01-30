import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

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

let replaceConfig = {
    exclude: 'node_modules/**',
    ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
};

export default {
    entry: 'src/main.js',
    dest: 'build/bundle.js',
    format: 'iife',
    plugins: [
        resolve(resolveConfig),
        commonjs(),
        babel(babelConfig),
        replace(replaceConfig),
        uglify(),
    ],
};