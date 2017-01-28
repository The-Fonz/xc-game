#
# Utilities for terrain generation, grouped here for clean code
#

import io
import logging
import zipfile
import requests
import numpy as np
from scipy import interpolate

logger = logging.getLogger(__name__)


def download_binary(url):
    """
    Download .hgt file, unzip if necessary. Returns io.BytesIO object.
    Everything happens in memory.
    """
    logger.info("Getting url %s", url)
    r = requests.get(url)
    if not r.status_code == 200:
        raise Warning("Request status code is not 200 but {}".format(r.status_code))
    # Get binary content
    logger.info("Downloaded %.2f MB", len(r.content)/2**20)
    c = io.BytesIO(r.content)
    # Unzip if necessary
    if zipfile.is_zipfile(c):
        logger.info("Is a zipfile, unzipping...")
        zf = zipfile.ZipFile(c)
        info = zf.infolist()
        if len(info) > 1:
            raise Warning("This zip archive contains %d files", len(info))
        return zf.open(info[0]).read()
    return c


def hgt_to_nparray(bytesio):
    """
    Convert HGT file to 2D numpy array.
    Assumes DEM tile is square.
    :param bytesio: HGT file as io.BytesIO
    :return: Square 2D numpy array of floats
    """
    # hgt format is signed 2 byte integers, big endian
    data = np.fromstring(bytesio, '>i2')
    side = len(data) ** .5
    # If not exactly an integer
    if side % 1:
        raise Warning("Side is not exactly an integer but {:f}".format(side))
    side = int(side)
    logger.info("Guessing that square DEM side length is %d", side)
    data.shape = (side, side)
    # Return as floats for easy calcs later on
    return data.astype(np.float32)


def stitch_hgt():
    "Stich hgt files together"
    raise Warning("Not implemented")


def delaunay_to_heightmap(vertices, faces):
    # Convert to delaunay triangulation scipy format
    # Make grid where to interpolate (or take as arg)
    xmin = vertices[:,0].min().round()
    xmax = vertices[:,0].max().round()
    zmin = vertices[:,2].min().round()+1
    zmax = vertices[:,2].max().round()
    logger.info("Generating grid on [{}:{},{}:{}]".format(xmin,xmax,zmin,zmax))
    evalpts = np.array([ (i,j) for j in np.arange(zmin,zmax) for i in np.arange(xmin,xmax) ])
    # Interpolate with http://docs.scipy.org/doc/scipy/reference/generated/scipy.interpolate.LinearNDInterpolator.html
    points = vertices[:,[0,2]]
    values = vertices[:,1]
    out = interpolate.griddata(points, values, evalpts, method='linear')
    return out.reshape((int(zmax-zmin),int(xmax-xmin)))

