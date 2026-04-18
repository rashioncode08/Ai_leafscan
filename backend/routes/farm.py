"""
/api/farm — Farm mapping, NDVI analysis, AI land analysis, and chat.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.earth_engine_service import get_ndvi_thumbnail
from motor.motor_asyncio import AsyncIOMotorDatabase
from database.mongo import get_db
from routes.auth import get_current_user, get_optional_user
from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/farm", tags=["Farm Mapping"])


class PolygonRequest(BaseModel):
    # List of [lat, lon] coordinates
    coordinates: list[list[float]]


class AnalyzeRequest(BaseModel):
    coordinates: list[list[float]]
    ndvi_url: str = ""
    location_name: str = ""


class FarmChatRequest(BaseModel):
    analysis_context: str
    question: str
    scan_id: str = ""
    language: str = "en"


class SaveScanRequest(BaseModel):
    coordinates: list[list[float]]
    ndvi_url: str
    analysis: str = ""
    location_name: str = ""


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


@router.post("/analyze")
async def analyze_farm(req: AnalyzeRequest):
    """
    Use Gemini/NVIDIA AI to analyze the NDVI data and provide
    land health insights, problems, and recommendations.
    """
    # Build a rich context prompt from the polygon data
    coords_str = ", ".join([f"({c[0]:.4f}, {c[1]:.4f})" for c in req.coordinates[:6]])
    center_lat = sum(c[0] for c in req.coordinates) / len(req.coordinates)
    center_lon = sum(c[1] for c in req.coordinates) / len(req.coordinates)

    prompt = f"""You are an expert agronomist and remote sensing scientist analyzing satellite NDVI data for an Indian farmer.

Field Information:
- Location: {req.location_name or f'Near ({center_lat:.4f}°N, {center_lon:.4f}°E)'}
- Field boundary coordinates: {coords_str}
- NDVI satellite scan has been completed using Sentinel-2 data.
- The NDVI color map uses: Red (stressed/bare) → Yellow (moderate) → Green (healthy vegetation)

Based on this NDVI satellite analysis of the farmer's field, provide a structured assessment:

1. **Overall Field Health** (1-2 sentences)
2. **Problems Detected** — List 2-3 potential issues (soil degradation, water stress, pest damage, nutrient deficiency, etc.)
3. **Recommended Actions** — 3-4 specific actions the farmer should take immediately
4. **Crop Suitability** — What crops would thrive in this region/season
5. **Water Management** — Irrigation advice based on vegetation patterns

Keep language simple — an Indian farmer with basic education should understand everything.
Respond in under 250 words. Do NOT use markdown headers, just plain text with numbered points."""

    analysis = ""
    source = ""

    # Try Gemini first, then NVIDIA
    try:
        from services.gemini_service import client as gemini_client
        from config import get_settings
        settings = get_settings()
        response = await gemini_client.chat.completions.create(
            model=settings.GEMINI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert Indian agricultural scientist specializing in remote sensing and precision farming."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=600,
            temperature=0.3,
        )
        analysis = response.choices[0].message.content
        source = "gemini"
    except Exception as e:
        logger.warning(f"Gemini farm analysis failed: {e}")

    if not analysis:
        try:
            from services.nvidia_service import client as nvidia_client
            from config import get_settings
            settings = get_settings()
            response = await nvidia_client.chat.completions.create(
                model=settings.NVIDIA_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert Indian agricultural scientist specializing in remote sensing and precision farming."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=600,
                temperature=0.3,
            )
            analysis = response.choices[0].message.content
            source = "nvidia"
        except Exception as e:
            logger.error(f"NVIDIA farm analysis also failed: {e}")
            raise HTTPException(500, "AI analysis unavailable. Please try again later.")

    return {"analysis": analysis, "source": source}


@router.post("/chat")
async def farm_chat(
    req: FarmChatRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Contextual follow-up chat about farm/NDVI analysis."""
    lang_instruction = {
        "en": "Respond in simple English.",
        "hi": "हिंदी में जवाब दें। सरल शब्दों का उपयोग करें।",
    }.get(req.language, "Respond in simple English.")

    system_prompt = f"""You are 'KisanAI', an expert Indian agricultural scientist.
You are having a follow-up conversation about a farmer's field that was just analyzed via satellite NDVI imagery.
Keep answers conversational, helpful, and under 150 words.
{lang_instruction}"""

    user_prompt = f"""Previous NDVI Analysis of the farmer's field:
{req.analysis_context}

Farmer's follow-up question: {req.question}"""

    answer = ""
    source = ""

    # Try Gemini first
    try:
        from services.gemini_service import client as gemini_client
        from config import get_settings
        settings = get_settings()
        response = await gemini_client.chat.completions.create(
            model=settings.GEMINI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=300,
            temperature=0.4,
        )
        answer = response.choices[0].message.content
        source = "gemini"
    except Exception as e:
        logger.warning(f"Gemini chat failed: {e}")

    if not answer:
        try:
            from services.nvidia_service import client as nvidia_client
            from config import get_settings
            settings = get_settings()
            response = await nvidia_client.chat.completions.create(
                model=settings.NVIDIA_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=300,
                temperature=0.4,
            )
            answer = response.choices[0].message.content
            source = "nvidia"
        except Exception as e:
            logger.error(f"NVIDIA chat also failed: {e}")
            raise HTTPException(500, "AI chat unavailable. Please try again.")

    # Save chat message to DB
    if req.scan_id:
        try:
            await db.farm_chats.insert_one({
                "scan_id": req.scan_id,
                "question": req.question,
                "answer": answer,
                "source": source,
                "created_at": datetime.now(timezone.utc),
            })
        except Exception:
            pass  # Non-critical — don't fail the response

    return {"answer": answer, "source": source}


@router.post("/save")
async def save_farm_scan(
    req: SaveScanRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Save an NDVI scan to the user's profile."""
    doc = {
        "user_id": current_user["id"],
        "coordinates": req.coordinates,
        "ndvi_url": req.ndvi_url,
        "analysis": req.analysis,
        "location_name": req.location_name,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.farm_scans.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Farm scan saved!"}


@router.get("/scans")
async def get_farm_scans(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get all saved NDVI scans for the logged-in user."""
    cursor = db.farm_scans.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(20)
    scans = await cursor.to_list(length=20)
    return {
        "scans": [
            {
                "id": str(s["_id"]),
                "coordinates": s.get("coordinates"),
                "ndvi_url": s.get("ndvi_url"),
                "analysis": s.get("analysis", "")[:200],  # Truncated for list view
                "location_name": s.get("location_name", ""),
                "created_at": s.get("created_at").isoformat() if s.get("created_at") else None,
            }
            for s in scans
        ]
    }
