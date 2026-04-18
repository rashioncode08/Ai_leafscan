"""
/api/history — Detection history CRUD.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from database.mongo import get_db

router = APIRouter(prefix="/api", tags=["History"])


@router.get("/history")
async def list_detections(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    crop: str = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List past detections with optional crop filter."""
    query = {}
    if crop:
        query["crop_type"] = crop

    cursor = db.detections.find(query).sort("created_at", -1).skip(offset).limit(limit)
    detections = await cursor.to_list(length=limit)

    return {
        "detections": [
            {
                "id": str(d["_id"]),
                "crop_type": d.get("crop_type"),
                "disease_name": d.get("disease_name"),
                "confidence": d.get("confidence"),
                "severity": d.get("severity"),
                "created_at": d.get("created_at").isoformat() if d.get("created_at") else None,
            }
            for d in detections
        ],
        "count": len(detections),
    }


@router.get("/history/{detection_id}")
async def get_detection(detection_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a specific detection with its recommendation."""
    try:
        obj_id = ObjectId(detection_id)
    except Exception:
        raise HTTPException(400, "Invalid detection ID format")

    detection = await db.detections.find_one({"_id": obj_id})

    if not detection:
        raise HTTPException(404, "Detection not found")

    rec = await db.recommendations.find_one({"detection_id": obj_id})

    return {
        "id": str(detection["_id"]),
        "crop_type": detection.get("crop_type"),
        "disease_name": detection.get("disease_name"),
        "confidence": detection.get("confidence"),
        "severity": detection.get("severity"),
        "top_predictions": detection.get("top_predictions", []),
        "image_filename": detection.get("image_filename"),
        "created_at": detection.get("created_at").isoformat() if detection.get("created_at") else None,
        "recommendation": {
            "text": rec.get("treatment_text"),
            "language": rec.get("language"),
            "source": rec.get("source"),
        } if rec else None,
    }


@router.get("/history/{detection_id}/image")
async def get_detection_image(detection_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Serve the binary image data for a detection."""
    try:
        obj_id = ObjectId(detection_id)
    except Exception:
        raise HTTPException(400, "Invalid detection ID format")

    detection = await db.detections.find_one({"_id": obj_id}, {"image_data": 1, "image_filename": 1})

    if not detection or "image_data" not in detection:
        raise HTTPException(404, "Image not found")

    content_type = "image/jpeg"
    filename = detection.get("image_filename", "").lower()
    if filename.endswith(".png"):
        content_type = "image/png"
    elif filename.endswith(".webp"):
        content_type = "image/webp"

    return Response(content=detection["image_data"], media_type=content_type)


@router.delete("/history/{detection_id}")
async def delete_detection(detection_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Delete a detection record."""
    try:
        obj_id = ObjectId(detection_id)
    except Exception:
        raise HTTPException(400, "Invalid detection ID format")

    result = await db.detections.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Detection not found")

    # Delete associated recommendation
    await db.recommendations.delete_many({"detection_id": obj_id})

    return {"message": "Detection deleted", "id": detection_id}
