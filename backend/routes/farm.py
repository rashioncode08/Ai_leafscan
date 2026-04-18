from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.earth_engine_service import get_ndvi_thumbnail
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/farm", tags=["Farm Mapping"])

class PolygonRequest(BaseModel):
    # List of [lat, lon] coordinates
    coordinates: list[list[float]]

@router.post("/ndvi")
async def generate_ndvi(req: PolygonRequest):
    """
    Takes a polygon boundary and returns a URL to a 
    colorized NDVI satellite image for that region.
    """
    if not req.coordinates or len(req.coordinates) < 3:
        raise HTTPException(status_code=400, detail="A valid polygon requires at least 3 coordinates.")
        
    try:
        url = get_ndvi_thumbnail(req.coordinates)
        return {"url": url}
    except Exception as e:
        logger.error(f"NDVI generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
