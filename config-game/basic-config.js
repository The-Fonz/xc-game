/**
 * Basic config to avoid repetition. Override to customize.
 * Namespaced to clearly indicate to which module config applies
 */

export const BASICCONFIG = {
    "Engine": {
        "paragliders": [],
        // Speed up simulation by this multiplication factor
        // Does NOT influence steering or camera movements,
        // just the engine speed (so pg, air, etc.)
        "timeMultiplier": 10,
        // Nested config-game because Engine instantiates Paraglider objects
        "Paraglider": {
            // Go this many times faster
            "speedMultiplier": 1,
            // Land when pg's centroid is this close to ground. Depends on 3D model
            "offsetY": 15,
            // Dimensionless
            "takeoffGradient": .5,
            // Take off if gradient enough and direction within this much rad
            "takeoffDirection": 1.3,
            // Horizontal and vertical bounds for walking speed
            "walkingHorizontalSpeed": 6,
            "walkingVerticalSpeed": 3,
            // Possibly limit the gradient that can be handled, but that would
            // require designing the map to contain paths that are not too steep
        },
    },
    "Dash": {
        // Vario indication for pos or neg, apart from the 0-level
        "varioLevels": 4,
        // Scaling vario indication
        "varioMaxClimbrate": 3,
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
    "Air": {
        // There is a constant pool of this many thermals in the scene
        "nthermals": 10,
        // Sample this many random positions for new thermal creation
        "nthermalsamples": 10,
        "Thermal": {
            // Min/max *sec* for uniform distribution
            // Influenced by timeMultiplier
            "lifeCycle": [400, 1800],
            // Min/max for uniform distribution
            "radius": [200, 400],
            // Min/max for uniform distribution
            "strength": [2,4],
            // Min/max for uniform distribution
            "cloudbase": [1100, 1200],
            // How far below cloudbase pg should stop climbing
            "cloudbaseClimbOffset": 200,
            "maxCloudWidth": 320,
            "maxCloudHeight": 180,
        },
    },
    "ThreeDeeView": {
        "clippingplane": 3000,
        "fog": {"hex": 0xFFFFFF, "near": 400, "far": 3000},
        "clearcolor": "#FFF",
        "cloudColor": "#DDE",
        // Order of cameras determines the cycle order and first one instantiated
        "cameras": [
            {'type': 'cloud', 'cloudbase': 1000},
            {'type': 'fixed', 'position': [2E3, 2E3, 2E3]},
            {'type': 'relative', 'initialRotation': [-1,-2,0]},
            {'type': 'free'},
        ],
        "ntrees": 5000,
        "assets": {
            "simplepg": "resources/assets/simplepg.json",
            "tree-evergreen": "resources/assets/tree-evergreen.json",
        },
    },
};
