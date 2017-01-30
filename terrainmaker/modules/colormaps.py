#
# Dict of colormap functions for terrain.
# Names must be unique.
#

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

def normalize_cmap(cmap):
    "Normalize colormap to take height value between 0 and 1"
    def c(hgt):
        # Ignore alpha value
        r,g,b = cmap(hgt)[:3]
        # Convert to hex
        return int(r*255) << 16 | int(g*255) << 8 | int(b*255)
    return c

# From green to white
terrain = normalize_cmap(plt.get_cmap('terrain'))

# Green valleys, grey mountains, white snow
cdict = {'red':   ((0.0,  0.1, 0.1),
                   (0.7,  0.4, 1.0),
                   (1.0,  1.0, 1.0)),

         'green': ((0.0,  0.6, 0.6),
                   (0.7,  0.4, 1.0),
                   (1.0,  1.0, 1.0)),

         'blue':  ((0.0,  0.1, 0.1),
                   (0.7,  0.4, 1.0),
                   (1.0,  1.0, 1.0))}
simple_snow_cm = LinearSegmentedColormap('simple_snow', cdict)
plt.register_cmap(cmap=simple_snow_cm)
simple_snow = normalize_cmap(simple_snow_cm)

