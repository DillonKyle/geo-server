import sys
import gdal
import osr
import pandas as pd

ras = gdal.Open(sys.argv[1])
data = ras.GetProjection()
proj = osr.SpatialReference(wkt=ras.GetProjection())
epsg = proj.GetAttrValue('AUTHORITY',1)

print(epsg)
sys.stdout.flush()