#
# Utilities for terrain generation, grouped here for clean code
#

from __future__ import division
import numpy as np

def delaunay_to_heightmap(vertices, faces):
    pass
    # Convert to delaunay triangulation scipy format
    # Make grid where to interpolate (or take as arg)
    # Interpolate with http://docs.scipy.org/doc/scipy/reference/generated/scipy.interpolate.LinearNDInterpolator.html
    # Save as img

def terrain_to_json(terrainfilter, colorfunc=lambda x: 0xFFFFFF):
    o = terrainfilter.outputs[0]
    vertices = o.points.to_array()
    # Contains leading 3's for each triangle
    faces = o.polys.to_array()

    # Swap z (up in terrainfilter) with y (up in three.js)
    y = vertices[:,1].copy()
    vertices[:,1] = vertices[:,2]
    vertices[:,2] = -y

    # SRTM has 30m resolution
    vertices[:,(0,2)] *= 30

    # Zero height at lowest point
    vertices[:,1] -= vertices[:,1].min()

    # Triangle with face color, see three.js json version 3 format
    facecode = 0b01000000

    faces = faces.reshape((len(faces)//4, 4))
    faces[:,0] = facecode

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

    return TEMPL % (list(vertices.flatten()), list(faces), colors)

TEMPL = u"""\
{
    "metadata": { "formatVersion" : 3 },

    "scale": 1.0,

    "vertices": %s,

    "faces": %s,

    "colors": %s,

    "normals": []
}
"""
