"""
/api/chat — Contextual AI chat for disease detection results.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from database.mongo import get_db
from bson import ObjectId
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ResultChatRequest(BaseModel):
    detection_id: str
    question: str
    language: str = "en"


@router.post("/results")
async def results_chat(
    req: ResultChatRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Contextual follow-up chat about a crop disease detection result."""
    # Fetch the detection context from DB
    try:
        obj_id = ObjectId(req.detection_id)
    except Exception:
        raise HTTPException(400, "Invalid detection ID")

    detection = await db.detections.find_one({"_id": obj_id})
    if not detection:
        raise HTTPException(404, "Detection not found")

    rec = await db.recommendations.find_one({"detection_id": obj_id})

    # Build context
    disease = detection.get("disease_name", "Unknown").replace("___", " — ").replace("_", " ")
    crop = detection.get("crop_type", "Unknown crop")
    confidence = detection.get("confidence", 0)
    severity = detection.get("severity", "UNKNOWN")
    rec_text = rec.get("treatment_text", "") if rec else ""
    vision = detection.get("vision_analysis", "")

    lang_instruction = {
        "en": "Respond in simple English.",
        "hi": "हिंदी में जवाब दें। सरल शब्दों का उपयोग करें।",
    }.get(req.language, "Respond in simple English.")

    system_prompt = f"""You are 'KisanAI', an expert Indian agricultural scientist and plant pathologist.
You are having a follow-up conversation about a crop disease that was just diagnosed.
Keep answers conversational, helpful, specific, and under 150 words.
{lang_instruction}"""

    user_prompt = f"""Disease Detection Context:
- Crop: {crop}
- Disease: {disease}
- AI Confidence: {confidence:.1f}%
- Severity: {severity}
- Treatment Recommendation: {rec_text[:300] if rec_text else 'Not available'}
- Vision Analysis: {vision[:300] if vision else 'Not available'}

Farmer's question: {req.question}"""

    answer = ""
    source = ""

    # Try Gemini → NVIDIA
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
        logger.warning(f"Gemini results chat failed: {e}")

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
            logger.error(f"NVIDIA results chat also failed: {e}")
            raise HTTPException(500, "AI chat unavailable. Please try again.")

    # Persist chat message
    try:
        await db.result_chats.insert_one({
            "detection_id": str(req.detection_id),
            "question": req.question,
            "answer": answer,
            "source": source,
            "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass  # Non-critical

    return {"answer": answer, "source": source}


@router.get("/results/{detection_id}")
async def get_result_chat_history(
    detection_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get all chat messages for a specific detection result."""
    cursor = db.result_chats.find({"detection_id": detection_id}).sort("created_at", 1).limit(50)
    messages = await cursor.to_list(length=50)
    return {
        "messages": [
            {
                "question": m.get("question"),
                "answer": m.get("answer"),
                "source": m.get("source"),
                "created_at": m.get("created_at").isoformat() if m.get("created_at") else None,
            }
            for m in messages
        ]
    }
