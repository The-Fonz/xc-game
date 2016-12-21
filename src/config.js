/**
 * Basic config to avoid repetition. Override to customize.
 * Namespaced to clearly indicate to which module config applies
 */

export const BASICCONFIG = {
  "Engine": {
    "paragliders": [],
    // Speed up simulation by this multiplication factor
    // Does NOT influence steering or camera movements,
    // just the pg speed
    "timeMultiplier": 30,
    // Nested config because Engine instantiates Paraglider objects
    "Paraglider": {
      // Land when pg's centroid is this close to ground. Depends on 3D model
      "offsetY": 15,
      // Dimensionless
      "takeoffGradient": .5,
      // Take off if gradient enough and direction within this much rad
      "takeoffDirection": 1,
      // Horizontal and vertical bounds for walking speed
      "walkingHorizontalSpeed": 3,
      "walkingVerticalSpeed": 2,
      // Possibly limit the gradient that can be handled, but that would
      // require designing the map to contain paths that are not too steep
    },
    "VarioTone": {
      "gain": .02,
      // Amount of time tone is 'on'
      // The below are lists in order of vertical speed [0, 1, 2, ...]
      "dutyCycles": [.3, .6, .6],
      // Tone height in Hz
      "tones": [800, 1300, 1400],
      // Duration of full on/off cycle in seconds
      "durations": [.5, .3, .2],
    },
  },
  "Air": {
  },
  "Task": {
  },
  "ThreeDeeView": {
    "clippingplane": 3000,
    "fog": {"hex": 0xFFFFFF, "near": 400, "far": 3000},
    "clearcolor": "white",
    // Different meshes to be used in this.Engine.paragliders
    "pgmeshes": {
      "simplepg": "../obj/pgmodels/simplepg.json",
    },
    // Order of cameras determines the cycle order and first one instantiated
    "cameras": [
      {'type': 'cloud', 'cloudbase': 1500},
      {'type': 'fixed', 'position': [2E3, 2E3, 2E3]},
      {'type': 'relative', 'initialRotation': [-1,-2,0]},
      {'type': 'free'},
    ],
  },
};
