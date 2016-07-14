#
# Utilities for terrain generation, grouped here for clean code
#

from __future__ import division
import numpy as np
import json

def delaunay_to_heightmap(vertices, faces):
    pass
    # Convert to delaunay triangulation scipy format
    # Make grid where to interpolate (or take as arg)
    # Interpolate with http://docs.scipy.org/doc/scipy/reference/generated/scipy.interpolate.LinearNDInterpolator.html
    # Save as img

def terrain_to_json(terrainfilter, colorfunc=lambda x: 0xFFFFFF, hscale=1, vscale=1):
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

    o = {
        # Special xcgame metadata
        "xcgame": {
            "heightmap": 0,
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

    return json.dumps(o, indent=1)
