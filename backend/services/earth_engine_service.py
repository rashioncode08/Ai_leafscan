import ee
import logging
import os
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_INITIALIZED = False

def init_ee():
    global _INITIALIZED
    if _INITIALIZED:
        return True

    key_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "gee_key.json")
    
    try:
        from google.oauth2.service_account import Credentials
        import json

        # 1. Try from Environment Variable (easier for Render)
        env_key = os.environ.get("GEE_KEY_JSON")
        if env_key:
            key_dict = json.loads(env_key)
            project_id = key_dict.get("project_id")
            credentials = Credentials.from_service_account_info(
                key_dict, scopes=["https://www.googleapis.com/auth/earthengine"]
            )
            logger.info("Using GEE credentials from Environment Variable")
        # 2. Fallback to file
        else:
            if not os.path.exists(key_path):
                logger.error(f"GEE key file not found at {key_path} and GEE_KEY_JSON env var is missing.")
                return False
                
            with open(key_path, 'r') as f:
                key_dict = json.load(f)
                project_id = key_dict.get("project_id")
                
            credentials = Credentials.from_service_account_file(
                key_path, scopes=["https://www.googleapis.com/auth/earthengine"]
            )
            logger.info("Using GEE credentials from file")

        if not project_id:
            raise Exception("project_id not found in GEE JSON key")

        # Initialize dynamically with whatever project the user provides
        ee.Initialize(credentials, project=project_id)
        _INITIALIZED = True
        logger.info("Successfully initialized Google Earth Engine")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Earth Engine: {e}")
        raise Exception(f"Earth Engine Init Error: {str(e)}")

def get_ndvi_thumbnail(polygon_coords: list) -> str:
    """
    Generate an NDVI thumbnail URL for the given polygon.
    polygon_coords should be a list of [lat, lon] pairs.
    """
    # This will now throw the exact initialization error if it fails
    init_ee()

    try:
        # Leaflet passes [lat, lon], but Earth Engine expects [lon, lat]
        ee_coords = [[lon, lat] for lat, lon in polygon_coords]
        
        # Close the polygon if not already closed
        if ee_coords[0] != ee_coords[-1]:
            ee_coords.append(ee_coords[0])

        roi = ee.Geometry.Polygon([ee_coords])

        # Get Sentinel-2 Surface Reflectance data from the past month
        end_date = ee.Date(ee.Date(ee.Date.now()).format('YYYY-MM-DD'))
        start_date = end_date.advance(-30, 'day')

        collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                      .filterBounds(roi)
                      .filterDate(start_date, end_date)
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))

        # Fallback if no recent cloud-free images are available
        if collection.size().getInfo() == 0:
            start_date = end_date.advance(-90, 'day')
            collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                          .filterBounds(roi)
                          .filterDate(start_date, end_date)
                          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)))

        # Get the median image to reduce clouds/noise
        image = collection.median().clip(roi)

        # Calculate NDVI: (NIR - Red) / (NIR + Red) -> (B8 - B4) / (B8 + B4)
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')

        # Create visualization parameters
        # -1 to 0 (water/bare soil)
        # 0 to 0.3 (stressed/sparse veg) -> Yellow/Red
        # 0.3 to 1.0 (healthy veg) -> Green
        vis_params = {
            'min': 0.0,
            'max': 0.8,
            'palette': ['FF0000', 'FFFF00', '00FF00'], # Red -> Yellow -> Green
            'region': roi,
            'dimensions': 512,
            'format': 'png'
        }

        # Generate a temporary URL for the thumbnail
        url = ndvi.getThumbURL(vis_params)
        return url

    except Exception as e:
        logger.error(f"Error generating NDVI: {e}")
        raise Exception(f"Failed to generate NDVI: {str(e)}")
