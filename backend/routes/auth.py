"""
/api/auth — Simple JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from database.mongo import get_db
from config import get_settings
from typing import Optional

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterRequest(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    password: str
    language_pref: str = "en"


class LoginRequest(BaseModel):
    email: str = ""
    phone: str = ""
    password: str


def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    """Extract and validate the current user from JWT Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(404, "User not found")

    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "language_pref": user.get("language_pref", "en"),
        "created_at": user.get("created_at"),
    }


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Optional[dict]:
    """Same as get_current_user but returns None instead of raising on missing token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization, db)
    except HTTPException:
        return None


@router.post("/register")
async def register(req: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if user exists
    if req.email:
        existing = await db.users.find_one({"email": req.email})
        if existing:
            raise HTTPException(400, "Email already registered")

    user_doc = {
        "name": req.name,
        "email": req.email or None,
        "phone": req.phone or None,
        "password_hash": pwd_context.hash(req.password),
        "language_pref": req.language_pref,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    return {
        "user": {"id": user_id, "name": req.name, "email": req.email},
        "token": create_token(user_id),
    }


@router.post("/login")
async def login(req: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Find user by email or phone
    query = {}
    if req.email:
        query["email"] = req.email
    elif req.phone:
        query["phone"] = req.phone
    else:
        raise HTTPException(400, "Provide email or phone")

    user = await db.users.find_one(query)

    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")

    return {
        "user": {"id": str(user["_id"]), "name": user.get("name"), "email": user.get("email")},
        "token": create_token(str(user["_id"])),
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the current user's profile information."""
    return current_user
