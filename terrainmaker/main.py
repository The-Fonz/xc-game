#
#
#

import matplotlib.pyplot as plt
from canyon_decimation import terrain
import utils

cm = plt.get_cmap('terrain')

def cf(hgt):
    "Takes height from 0 to 1"
    # Ignore alpha value
    r,g,b = cm(hgt)[:3]
    # Convert to hex
    return int(r*255) << 16 | int(g*255) << 8 | int(b*255)

if __name__=="__main__":
    terrjs = utils.terrain_to_json(terrain, colorfunc=cf)
    with open('grandcanyon.ignore.json', 'w') as f:
        f.write(terrjs)
