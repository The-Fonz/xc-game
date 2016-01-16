## License
This open-source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 2, see `LICENSE.txt`.

## Folder structure
- `examples` contains HTML pages that visualize parts of the underlying algorithms, these visualizations can be used to tweak variables (e.g. cloud growth, thermal probability)
- `obj` contains all scenery and paraglider models
- `races` contains json setup files for different races
- `src` contains the source ES2015 code that gets transpiled with babel

## Installing dependencies and building
The NPM scripts in `package.json` are used to automate everything. No Grunt or Gulp. Keep it simple. Commands:
- `npm install` Install dependencies
- `npm run build` Transpile with babel, then resolve dependencies with browserify, save as `bundle.js`
- `npm run watch` Same as build but auto-rebuilds parts that change (superfast)
- `npm run serve` Start a simple auto-refreshing http file server at localhost:8080, nice for development
