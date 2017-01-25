export let testShowHeightmap = {
    name: "Show heightmap test",
    slug: "test-show-heightmap",
    pgmeshes: null,
    scenery: {
        url: "/resources/sceneries/grandcanyon/grandcanyon.json",
    },
    ThreeDeeView: {
        showheightmap: true,
        axishelper: 3000,
        flyaround: true,
        cameras: [{'type': 'free'}],
    },
}
