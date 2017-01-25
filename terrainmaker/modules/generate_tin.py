#
# Uses Mayavi
#

from mayavi import mlab


def tin_from_grid(data, show=False):
    ""
    data.shape = (3601, 3601)
    data = data[200:400, 1200:1400]
    data = data.astype(np.float32)

    data = mlab.pipeline.array2d_source(data)

    # Use a greedy_terrain_decimation to created a decimated mesh
    terrain = mlab.pipeline.greedy_terrain_decimation(data)
    terrain.filter.error_measure = 'number_of_triangles'
    # TODO: Change this to scale more easily
    terrain.filter.number_of_triangles = 5000
    terrain.filter.compute_normals = True

    if show:
        mlab.figure(1, size=(450, 390))
        mlab.clf()
        # Plot it black the lines of the mesh
        lines = mlab.pipeline.surface(terrain, color=(0, 0, 0),
                                              representation='wireframe')
        # The terrain decimator has done the warping. We control the warping
        # scale via the actor's scale.
        lines.actor.actor.scale = [1, 1, 0.2]
        # Display the surface itself.
        surf = mlab.pipeline.surface(terrain, colormap='gist_earth',
                                              vmin=1450, vmax=1650)
        surf.actor.actor.scale = [1, 1, 0.2]
        # Display the original regular grid. This time we have to use a
        # warp_scalar filter.
        warp = mlab.pipeline.warp_scalar(data, warp_scale=0.2)
        grid = mlab.pipeline.surface(warp, color=(1, 1, 1),
                                              representation='wireframe')

        mlab.view(-17, 46, 143, [1.46, 8.46, 269.4])
        mlab.show()

    return terrain
