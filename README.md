## License
This open-source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 2, see `LICENSE.txt`.

## Folder structure
`src` contains the source typescript code
`built` contains the output from the typescript compiler in the same folder structure as `src`
`test` contains unit tests for mocha written in pure js for testing code in `build`
`examples` contains HTML pages that grab code from the `built` folder visualize parts of the underlying algorithms, these visualizations can be used to tweak variables (e.g. cloud growth, thermal probability)
`public` contains what will be uploaded to the web (bundled, minified javascript, scenery data, and the main entry point web page)

## Installing dependencies and building
The NPM scripts in `package.json` are used to automate everything. No Grunt or Gulp. Keep it simple. Commands:
`npm install` Install dependencies
`npm build` Compile `src` to `built` folder
`npm test` Compile, then run mocha
