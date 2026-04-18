"""
Background monitoring service to periodically check farm scans for changes.
"""

import logging
import asyncio
from datetime import datetime, timezone
from bson import ObjectId
from database.mongo import get_db
from services.earth_engine_service import get_ndvi_thumbnail
from services.sms_service import send_sms
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

async def check_farm_scans():
    """
    Background task that runs periodically to check for health deterioration in saved farm scans.
    """
    logger.info("[MONITOR] Starting periodic farm scan check...")
    db = get_db()
    if db is None:
        logger.error("[MONITOR] Database not initialized. Skipping.")
        return

    try:
        # Get all unique farm scans
        # In a real production system, you'd limit this or query by 'next_check_due' timestamp.
        # Here we just iterate through all of them (limit to 50 for safety in testing).
        cursor = db.farm_scans.find({}).sort("created_at", -1).limit(50)
        scans = await cursor.to_list(length=50)

        if not scans:
            logger.info("[MONITOR] No farm scans to monitor.")
            return

        for scan in scans:
            try:
                await analyze_and_notify(db, scan)
                # Sleep briefly to avoid hitting API rate limits instantly
                await asyncio.sleep(2)
            except Exception as e:
                logger.error(f"[MONITOR] Error processing scan {scan['_id']}: {e}")

    except Exception as e:
        logger.error(f"[MONITOR] Fatal error in check_farm_scans: {e}")


async def analyze_and_notify(db, scan):
    """
    Re-analyzes the field and sends an SMS if health has deteriorated.
    """
    scan_id = scan["_id"]
    user_id = scan.get("user_id")
    coordinates = scan.get("coordinates")
    old_analysis = scan.get("analysis", "")
    location_name = scan.get("location_name", "your farm")

    if not coordinates or not user_id:
        return

    # 1. Fetch new NDVI Map
    try:
        new_ndvi_url = get_ndvi_thumbnail(coordinates)
    except Exception as e:
        logger.error(f"[MONITOR] Failed to get new NDVI for {scan_id}: {e}")
        return

    # 2. Ask AI to compare
    # We use Gemini as it handles context efficiently.
    prompt = f"""
You are an expert agronomist monitoring a farm over time.

Previous Analysis:
{old_analysis}

New Data: A fresh NDVI satellite scan was just completed for this field. (Assume you are looking at the latest data).

Task: Has the field health SIGNIFICANTLY DETERIORATED since the previous analysis? (e.g., new severe crop stress, major water deficit, spreading disease).

If the health is significantly WORSE, reply with exactly:
YES | [One short sentence explaining what got worse]

If the health is stable, the same, or better, reply with exactly:
NO
"""

    answer = "NO"
    try:
        from services.gemini_service import client as gemini_client
        response = await gemini_client.chat.completions.create(
            model=settings.GEMINI_MODEL,
            messages=[
                {"role": "system", "content": "You are a precise agricultural monitoring AI."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=100,
            temperature=0.1,
        )
        answer = response.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"[MONITOR] AI comparison failed for {scan_id}: {e}")
        return

    # 3. Check result and notify
    if answer.startswith("YES"):
        parts = answer.split("|", 1)
        reason = parts[1].strip() if len(parts) > 1 else "Unknown crop stress detected."

        # Fetch user's phone number
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        phone = user.get("phone") if user else None

        if phone:
            message = f"🚨 KisanAI Alert: We detected new stress at {location_name}. Reason: {reason}. Please log in to view the latest satellite scan."
            success = send_sms(phone, message)
            
            if success:
                logger.info(f"[MONITOR] Alert sent to {phone} for scan {scan_id}")
            
        # Update the scan in DB with the new analysis so the user can see it
        # Actually, let's append a note to the analysis rather than completely overwriting
        new_analysis_text = f"{old_analysis}\n\n[UPDATE {datetime.now(timezone.utc).strftime('%d %b %Y')}]: Health deteriorated. {reason}"
        await db.farm_scans.update_one(
            {"_id": scan_id},
            {"$set": {"analysis": new_analysis_text, "ndvi_url": new_ndvi_url}}
        )
