#
# Commandline program to generate sceneries
#

import os
import sys
import logging
import argparse
import importlib

logging.setLevel('DEBUG')
logging.basicConfig()

# Add terrainmaker and config folder to PATH for module import
filedir = os.path.abspath(os.path.dirname(__file__))
parent_folder = os.path.abspath(os.path.join(filedir, '..'))
config_folder = os.path.join(parent_folder, 'config-scenery')
sys.path.append(parent_folder)
sys.path.append(config_folder)

import * from terrainmaker.modules

# Set up cmdline arguments
parser = argparse.ArgumentParser(description="Generate TIN terrain model")
parser.add_argument('config', help='Config file name (e.g. "grandcanyon"')
parser.add_argument('--format', '-f', default='json',
                    help="Output format, default THREE.js JSON",
                    choices=('json',))


if __name__=="__main__":
    args = parser.parse_args()

    # Load config
    try:
        config = importlib.import_module(args.config)
        print("Imported config", config)
    except ImportError:
        print("Config", args.config, "not found in folder", config_folder)
        exit()

    # Check cache for DEM data

    # If not, download DEM and put in cache

    # Make TIN
    terrain = generate_tin.tin_from_grid(data)

    # Convert to JSON

    # Save JSON
    # with open('grandcanyon.json', 'w') as f:
    #     f.write(terrjs)

    # Make heightmap

    # Save heightmap

