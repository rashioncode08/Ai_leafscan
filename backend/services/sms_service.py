"""
SMS Service for sending real or mock SMS notifications.
"""

import logging
from config import get_settings
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

logger = logging.getLogger(__name__)

def send_sms(to_phone: str, message_body: str):
    """
    Sends an SMS using Twilio if configured, otherwise falls back to a mock logger.
    """
    if not to_phone:
        logger.warning("Attempted to send SMS but no phone number provided.")
        return False

    settings = get_settings()
    
    # Try Twilio if credentials exist
    if getattr(settings, "TWILIO_ACCOUNT_SID", None) and getattr(settings, "TWILIO_AUTH_TOKEN", None):
        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=message_body,
                from_=getattr(settings, "TWILIO_FROM_NUMBER", "+1234567890"),
                to=to_phone
            )
            logger.info(f"Twilio SMS sent successfully to {to_phone}. SID: {message.sid}")
            return True
        except TwilioRestException as e:
            logger.error(f"Twilio API Error: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending Twilio SMS: {e}")
            return False
    else:
        # Fallback to Mock SMS
        logger.info(f"\n{'='*40}\n[MOCK SMS SERVICE]\nTo: {to_phone}\nMessage: {message_body}\n{'='*40}\n")
        return True
