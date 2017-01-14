# xc-game
Hey there, welcome to my pet project!

This readme describes the idea of the game and gives some instructions on playing and developing. Description of algorithms is in the code docs, accessible with `npm run serve:docs` (I'll put them online at some point too).

## Description
*xc-game* is a semi-realistic cross country and hike-and-fly paragliding game. It's designed to be in the right spot on the realistism-fun scale. In other words, I spend a lot of effort on gameplay to make it as much fun as possible. A big part of that is giving the player full control but still doing enough things . Also, coming up with realistic weather algorithms is an interesting challenge, as simulating an entire boundary layer is computationally infeasible and confusing for the user ("is this a thermal or just turbulence?"). So I spend a lot of time trying to figure out how to represent weather phenomena like thermals and wind, how they should behave, what parameters should be adjustable, and how to compute them in a computationally feasible way. So there are dozens of interesting challenges in this game, and then I haven't even started on the heuristics for AI players.

## Play it!
Install `node` and `npm`. Then:

- Install dependencies with `npm install`
- Build with `npm run build`
- Start a simple auto-refreshing http file server at `localhost:8080` with `npm run serve` and pick an example to choose from. At some point I'll put it on a website

The NPM commandline scripts in `package.json` are used to automate everything. No Grunt or Gulp. Keep it simple.

## Folder structure
- `./examples` contains examples used for testing rendering, algorithms etc.
- `./obj` contains all scenery and paraglider models
- `./terrainmaker` is the utility used to generate TINs (Triangular Irregular Network) from DEMs (Digital Elevation Model, grid of heights), giving the game its low-poly style
- `./src` contains the source ES2015 code that gets transpiled with babel
- `./build` Holds compiled js bundle and html, can be copied to server

## Development
Check out the docs with `npm run serve:docs`.

The game loop must run at least 30 times a second, hence the importance of keeping everything predictable. Golden rules:

- No object creation except at initialization. We don't want garbage collection to cause lag. If a function needs e.g. a `THREE.Vector3`, it should be cached for re-use.
- Events (like keyboard/mouse inputs) get stored (e.g. in a `KeyMap`) and only processed on the next game loop run. No other events and asynchronous methods are used (except promises for http requests).
- Config: some values that will probably never get changed can be hardcoded, others should end up in `BASICCONFIG` where they can be overridden. They should have sane default values. They should be namespaced by class name, and nested if the object is instantiated by another class.
- Only touch DOM when really needed to avoid slowdowns. If needed, let a function or class cache state (kind of like virtual DOM).
- As few dependencies as possible, to keep code size as small as possible.

## Reflections on architecture
The classes should not know too much about each other, to avoid problems when changing things. Ideally their interactions are clearly defined in terms of e.g. interfaces. Efficiency is often a factor though, because we must only instantiate objects once.
So let's not init clouds in the Engine constructor, but instead define a method called initClouds, that instantiates cloud meshes. Then another method takes care of updating.

Let's agree on this:
- No class--except the Game class--instantiates objects.
- Initialization is done using `.initThing` methods, updating using `.updateThing` methods.
- Every object that needs it has a `.meta` attribute where external methods can keep state info and a `.cache` attribute for internal state-keeping.
