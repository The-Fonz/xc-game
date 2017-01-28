#
# Export to THREE.js JSON format, png, jpg (heightmaps)
#

import os
import json
import logging
import numpy as np
from scipy.misc import imsave
import matplotlib.pyplot as plt

from terrainmaker.modules.heightmap import delaunay_to_heightmap

logger = logging.getLogger(__name__)


def heightmap_to_png(heightmap, imgname):
    "Saves heightmap to png"
    imsave(imgname, heightmap)


def img_to_jpg(imgname):
    "Converts heightmap to jpg. Take care to check if error within bounds"
    Image.open(imgname).save(os.path.splitext(imgname)[0]+'.jpg', 'JPEG')


def heightmap_to_overview(heightmap, imgname):
    plt.imshow(
        heightmap,
        cmap=plt.get_cmap('terrain'))
    plt.savefig('grandcanyon-overview.png')


def terrain_to_json(terrainfilter, colorfunc=lambda x: 0xFFFFFF,
                    hscale=1, vscale=1,
                    remove_edge_triangles=True):
    o = terrainfilter.outputs[0]
    vertices = o.points.to_array()
    # Contains leading 3's for each triangle
    faces = o.polys.to_array()

    # Swap z (up in terrainfilter) with y (up in three.js)
    y = vertices[:,1].copy()
    vertices[:,1] = vertices[:,2]
    vertices[:,2] = -y

    # Zero height at lowest point
    vertices[:,1] -= vertices[:,1].min()


    faces = faces.reshape((len(faces)//4, 4))
    # Triangle with face color, see three.js json version 3 format
    faces[:,0] = 0b01000000

    # Generate colors with avg elevation of face
    gety = lambda vi: vertices[vi,1]
    # Not barycentric but avg y-coord of two extreme pts in y-direction,
    # I think this will look better
    avg = lambda y1,y2,y3: (max(y1,y2,y3)+min(y1,y2,y3))/2
    avgelevs = [avg(gety(f[1]),gety(f[2]),gety(f[3])) for f in faces]
    # Normalize to range [0,1]
    avgelevs -= min(avgelevs)
    avgelevs /= max(avgelevs)
    colors = [ colorfunc(elev) for elev in avgelevs]

    colorindices = np.arange(len(faces))
    # avoid shape mismatch error
    colorindices.shape = (len(faces), 1)

    faces = np.concatenate((faces, colorindices), axis=1)
    faces = faces.flatten()
    faces = faces.astype(int)

    def is_edge_triangle(vi):
        vertices[vi]
        return 0

    # TODO: Faces already have color indices appended.
    #       Append colors after removing edge triangles
    # Edge triangles are often very narrow due to delaunay constraint failing
    if remove_edge_triangles:
        logger.info("Removing edge triangles...")
        oldfaces = faces.copy()
        faces = np.ndarray(faces.shape)
        i = 0
        import pdb; pdb.set_trace()
        for t,v1,v2,v3 in oldfaces.reshape(faces.shape[0]//4, 4):
            # Must have two edge vertices to be on an edge
            if (is_edge_triangle(v1) +
                is_edge_triangle(v2) +
                is_edge_triangle(v3)) < 2:
                faces[i:i+4] = [t,v1,v2,v3]
                i += 4
            if i % 1000:
                logger.info("Processed %d out of %s faces", i//4, len(faces)//4)

    # TODO: Append colors here

    heightmap = delaunay_to_heightmap(vertices, faces)
    # Normalize heightmap to 0-255 and remember vscale to resize later
    heightmapvscale = heightmap.max() / 255
    logger.info("heightmapvscale {:.2f}".format(heightmapvscale))
    heightmap /= heightmapvscale
    heightmap = heightmap.round()

    # Put origin at 0,0
    vertices[:,0] -= vertices[:,0].min()
    vertices[:,2] -= vertices[:,2].min()

    o = {
        # Special xcgame metadata
        "xcgame": {
            # Unencoded heightmap
            # "heightmap": heightmap.tolist(),
            "heightmapvscale": heightmapvscale,
            # hscale is the same for heightmap and geometry
            "hscale": float(hscale),
            "vscale": float(vscale),
        },
        # From here it's all standard Tthreejs JSON format
        "metadata": { "formatVersion" : 3 },

        "scale": 1.0,

        "vertices": list(vertices.flatten()),

        "faces": list(faces),

        "colors": colors,

        "normals": []
    }


    return json.dumps(o, indent=1), heightmap