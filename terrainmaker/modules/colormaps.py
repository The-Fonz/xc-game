#
# Dict of colormap functions for terrain.
# Names must be unique.
#

import matplotlib.pyplot as plt

def normalize_cmap(cmap):
    "Normalize colormap to take height value between 0 and 1"
    def c(hgt):
        # Ignore alpha value
        r,g,b = cm(hgt)[:3]
        # Convert to hex
        return int(r*255) << 16 | int(g*255) << 8 | int(b*255)
    return c

mpl_terrain = normalize_cmap(plt.get_cmap('terrain'))


