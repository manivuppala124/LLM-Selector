from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from app.db.mongo import users_col
from app.core.security import hash_password, verify_password, create_access_token, decode_token

router = APIRouter()
bearer = HTTPBearer()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(req: RegisterRequest):
    if users_col.find_one({"email": req.email}):
        raise HTTPException(400, "Email already registered")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    users_col.insert_one({
        "email": req.email,
        "password_hash": hash_password(req.password),
        "created_at": datetime.now(timezone.utc),
    })
    return {"message": "Registered successfully"}


@router.post("/login")
def login(req: LoginRequest):
    user = users_col.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_access_token({"sub": req.email})
    return {"access_token": token, "token_type": "bearer"}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    try:
        payload = decode_token(credentials.credentials)
        return payload["sub"]
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
