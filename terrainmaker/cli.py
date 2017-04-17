#
# Commandline program to generate sceneries
# Only Python2 compatible!
#

import os
import sys
import logging
import argparse
import importlib

logging.basicConfig(level='INFO',
                    format="%(relativeCreated)dms %(name)s %(message)s")
logger = logging.getLogger(__name__)

# Add terrainmaker and config folder to PATH for module import
filedir = os.path.abspath(os.path.dirname(__file__))
parent_folder = os.path.abspath(os.path.join(filedir, '..'))
config_folder = os.path.join(parent_folder, 'config-scenery')
resource_scenery_folder = os.path.join(parent_folder, 'resources', 'sceneries')
sys.path.append(parent_folder)
sys.path.append(config_folder)

from terrainmaker.modules import *

# Set up cmdline arguments
parser = argparse.ArgumentParser(description="Generate TIN terrain model")
parser.add_argument('config', help='Config file name (e.g. "grandcanyon"')
parser.add_argument('--show', '-s', action="store_true", default=False,
                    help="Show mayavi output in separate window")
parser.add_argument('--cachedir',
                    default=os.path.join(parent_folder, 'resources', 'DEM_CACHE'),
                    help="Directory to cache DEM files")


if __name__=="__main__":
    args = parser.parse_args()

    # Load config
    try:
        config = importlib.import_module(args.config)
        logger.info("Imported config %s", config)
    except ImportError:
        logger.error("Config %s not found in folder %s", args.config, config_folder)
        exit()

    # Assume config file name is the same as scenery name
    scenery_path = os.path.join(resource_scenery_folder, args.config)
    if not os.path.isdir(scenery_path):
        os.makedirs(scenery_path)
        logger.info("Made scenery path %s", scenery_path)
    scenery_fn = os.path.join(scenery_path, args.config)

    colormap = getattr(colormaps, config.colormap)

    dem_filename = config.dem_url.split('/')[-1]
    dem_path = os.path.join(args.cachedir, dem_filename)
    dem_dir = os.path.dirname(dem_path)
    if not os.path.isfile(dem_path):
        logger.info("DEM cache miss, downloading file...")
        dem_bytes = heightmap.download_binary(config.dem_url)
        if not os.path.isdir(dem_dir):
            os.makedirs(dem_dir)
            logger.info("Made directory %s", dem_dir)
        with open(dem_path, 'wb') as df:
            df.write(dem_bytes)
        logger.info("Saved DEM in cache as %s", dem_path)
    else:
        with open(dem_path, 'rb') as df:
            dem_bytes = df.read()
            logger.info("Read DEM from cache, path %s", dem_path)

    dem = heightmap.hgt_to_nparray(dem_bytes)

    # Take only a smaller slice
    sp = config.slice_points
    logger.info("Slice terrain with shape %s to %s", dem.shape, sp)
    dem = dem[sp[0]:sp[1], sp[2]:sp[3]]

    # Make TIN
    terrain = generate_tin.tin_from_grid(dem, triangles_fraction=config.triangles_fraction, show=args.show)

    vertices, faces = export.terrainfilter_clean(terrain)

    # Save points in binary format
    pts_binary_fn = scenery_fn + '-points.bytes'
    pts_binary = export.pts_to_binary(terrain)
    with open(pts_binary_fn, 'wb') as f:
        f.write(pts_binary)
    logger.info("Saved heightmap in binary format as %s", pts_binary_fn)

    # TODO: Save metadata for binary format (hscale, vscale, colors)

    # Generate heightmap
    heightmap = delaunay_to_heightmap(vertices, faces)

    # Save heightmap
    heightmap_fn = scenery_fn+'-heightmap.png'
    export.heightmap_to_png(heightmap, heightmap_fn)
    heightmap_jpg_fn = export.img_to_jpg(heightmap_fn)
    heightmap_url = 'resources/sceneries/{}/{}'.format(args.config,
                                                      os.path.basename(heightmap_jpg_fn))
    logger.info("Saved heightmap as %s and %s, generated url as %s",
                heightmap_fn, heightmap_jpg_fn, heightmap_url)

    # Save overview to see terrain colors
    overview_fn = scenery_fn+'-overview.png'
    export.heightmap_to_overview(heightmap, overview_fn, config.colormap)
    logger.info("Saved overview as %s", overview_fn)

    # Convert to JSON
    logger.info("Converting to json...")
    json = export.to_three_json(vertices, faces, heightmap_url,
                                             vscale=config.vscale,
                                             hscale=config.hscale,
                                             colorfunc=colormap,
                                             remove_edge_triangles=True)

    # Save JSON
    logger.info("Saving json...")
    scenery_json_fn = scenery_fn + '.json'
    with open(scenery_json_fn, 'w') as f:
        f.write(json)
    logger.info("Saved json as %s", scenery_json_fn)
