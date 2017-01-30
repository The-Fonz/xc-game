export let salzburgSimple = {
    name: "Salzburg",
    slug: "salzburg-simple",
    thumbnail: "",
    scenery: {
        url: "resources/sceneries/salzburg/salzburg.json",
    },
    Engine: {
        timeMultiplier: 20,
        paragliders: [
            {position: {x: 1000 * 30, y: 3800, z: 200 * 30}},
        ],
    },
    Task: {
        "traceLength": 600,
// Padding around task view in world units
        "bboxPadding": 1000,
        "turnpoints": [
            // xyz coords
            {"name": "A", "type": "start", "coordinates": [1000 * 30, 0, 200 * 30], "radius": 1200},
            {"name": "B", "type": "turnpoint", "coordinates": [1700 * 30, 0, 300 * 30], "radius": 1500},
            {"name": "C", "type": "finish", "coordinates": [2000 * 30, 0, 500 * 30], "radius": 1400},
            {"name": "D", "type": "finish", "coordinates": [2500 * 30, 0, 250 * 30], "radius": 1300},
        ],
    },
    "ThreeDeeView": {
        "clippingplane": 10000,
        "fog": {"hex": 0xFFFFFF, "near": 400, "far": 10000},
        // Order of cameras determines the cycle order and first one instantiated
        "cameras": [
            {'type': 'cloud', 'cloudbase': 3800},
            {'type': 'fixed', 'position': [2E3, 2E3, 2E3]},
            {'type': 'relative', 'initialRotation': [-1,-2,0]},
            {'type': 'free'},
        ],
    },
    "Air": {
        // There is a constant pool of this many thermals in the scene
        "nthermals": 300,
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
            "cloudbase": [3800, 4000],
            // How far below cloudbase pg should stop climbing
            "cloudbaseClimbOffset": 200,
            "maxCloudWidth": 520,
            "maxCloudHeight": 180,
        },
    },
}