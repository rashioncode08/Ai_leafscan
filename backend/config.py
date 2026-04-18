"""KisanAI Configuration — Environment variables and app settings."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"

    # Grok API (xAI) — OpenAI-compatible
    GROK_API_KEY: str = ""
    GROK_MODEL: str = "grok-3-mini"
    GROK_BASE_URL: str = "https://api.x.ai/v1"

    # Gemini API (Google AI Studio)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # NVIDIA API (Llama 4 Maverick)
    NVIDIA_API_KEY: str = ""
    NVIDIA_MODEL: str = "meta/llama-4-maverick-17b-128e-instruct"

    # OpenWeatherMap API
    OPENWEATHER_API_KEY: str = ""

    # Ollama (Local LLM)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma4"

    # Twilio (SMS Notifications)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # JWT Auth
    JWT_SECRET: str = "change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # App
    APP_NAME: str = "KisanAI"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — reads .env once."""
    return Settings()
