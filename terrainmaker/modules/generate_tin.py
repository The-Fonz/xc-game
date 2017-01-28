#
# Uses Mayavi
#

import logging
import numpy as np
from mayavi import mlab

logger = logging.getLogger(__name__)


def tin_from_grid(dem, triangles_fraction=.06, show=False):
    ""

    data = mlab.pipeline.array2d_source(dem)

    if show:
        mlab.figure(1, size=(450, 390))
        mlab.clf()

    # Use a greedy_terrain_decimation to created a decimated mesh
    terrain = mlab.pipeline.greedy_terrain_decimation(data)
    terrain.filter.error_measure = 'number_of_triangles'
    terrain.filter.number_of_triangles = int(dem.shape[0] * dem.shape[1] * 2 * triangles_fraction)
    logger.info("Setting error measure to %.4f of data array size %s, results in %d triangles",
                triangles_fraction, dem.shape, terrain.filter.number_of_triangles)

    # terrain.filter.compute_normals = True

    if show:
        # Plot it black the lines of the mesh
        lines = mlab.pipeline.surface(terrain, color=(1, 1, 1),
                                      representation='wireframe')
        # The terrain decimator has done the warping. We control the warping
        # scale via the actor's scale.
        lines.actor.actor.scale = [1, 1, 0.2]
        # Display the surface itself.
        surf = mlab.pipeline.surface(terrain, colormap='gist_earth',
                                     vmin=dem.min(), vmax=dem.max())
        surf.actor.actor.scale = [1, 1, 0.2]
        # Display the original regular grid. This time we have to use a
        # warp_scalar filter.
        if show=='all':
            warp = mlab.pipeline.warp_scalar(data, warp_scale=0.2)
            grid = mlab.pipeline.surface(warp, color=(1, 1, 1),
                                         representation='wireframe')

        mlab.view(-17, 46, 143, [1.46, 8.46, 269.4])
        mlab.show()

    return terrain
