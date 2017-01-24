export let testSimpleTask = {
    name: "Simple task",
    scenery: {
        url: "../obj/sceneries/grandcanyon/grandcanyon.json",
    },
    Engine: {
        paragliders: [
            {position: {x:2500, y:800, z:500}},
        ],
    },
    Task: {
    "traceLength": 600,
    // Padding around task view in world units
    "bboxPadding": 1000,
    "turnpoints": [
      // xyz coords
      {"name": "Mountain1", "type": "start", "coordinates": [2000,0,1500], "radius": 600},
      {"name": "Village2", "type": "turnpoint", "coordinates": [4000,0,3000], "radius": 500},
      {"name": "Pond3", "type": "finish", "coordinates": [2500,0,4500], "radius": 400},
    ],
  },
}

export let testShowHeightmap = {
    name: "show-heightmap",
    scenery: {
        url: "../obj/sceneries/grandcanyon/grandcanyon.json",
    },
    ThreeDeeView: {
        showheightmap: true,
        axishelper: 3000,
        flyaround: true,
        cameras: [{'type': 'free'}],
    },
}
