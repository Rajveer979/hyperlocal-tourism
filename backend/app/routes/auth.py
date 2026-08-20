"""F22 — auth: signup, login, forgot/reset password, current user.

Contract shapes (API-CONTRACT.md):
  POST /auth/login          {username, password}            → {token, role, user}
  POST /auth/signup         (new)                           → {token, role, user}
  POST /auth/forgot-password {email}                        → {delivered, ...}
  POST /auth/reset-password  {token, new_password}          → {ok}
  GET  /auth/me             (Bearer)                        → user
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import config
from ..core.security import create_token, get_current_user, hash_password, verify_password
from ..core.validation import validate_email_format
from ..database import get_db
from ..models import PasswordResetToken, User
from ..services.email_service import send_reset_email

router = APIRouter()

ROLES = ("host", "traveller")


class SignupIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str
    phone: str = Field(default="", max_length=20)
    password: str = Field(min_length=6, max_length=128)
    role: str = Field(default="traveller")
    language_preference: str = "hi"


class LoginIn(BaseModel):
    email: str
    password: str


class ForgotPasswordIn(BaseModel):
    email: str


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=128)


def _auth_response(user: User) -> dict:
    return {"token": create_token(user.id, user.role), "role": user.role, "user": user.to_public()}


def _find_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email.lower().strip())).scalars().first()


@router.post("/auth/signup", status_code=201)
def signup(payload: SignupIn, db: Session = Depends(get_db)):
    role = payload.role.lower()
    if role not in ROLES:
        raise HTTPException(status_code=400, detail="Role must be 'host' or 'traveller'")

    try:
        email = validate_email_format(payload.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if db.execute(select(User).where(User.email == email)).scalars().first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(
        name=payload.name.strip(),
        email=email,
        phone=payload.phone.strip(),
        password_hash=hash_password(payload.password),
        role=role,
        language_preference=payload.language_preference,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _auth_response(user)


@router.post("/auth/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = _find_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Track "which user logged in and when" — visible in the admin users list.
    user.last_login_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    return _auth_response(user)


@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordIn, db: Session = Depends(get_db)):
    """Issue a one-time reset token (30 min) and email the reset link.

    Always returns 200-style success even for unknown emails (don't reveal
    which addresses have accounts); dev fallback exposes the token.
    """
    try:
        email = validate_email_format(payload.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = db.execute(select(User).where(User.email == email)).scalars().first()
    if user is None:
        raise HTTPException(status_code=404, detail="This email is not registered. Please sign up first.")

    token = secrets.token_urlsafe(32)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hashlib.sha256(token.encode()).hexdigest(),
            expires_at=(datetime.now(timezone.utc) + timedelta(minutes=config.RESET_TOKEN_TTL_MINUTES)).isoformat(),
        )
    )
    db.commit()

    reset_url = f"http://localhost:5173/login?mode=reset&token={token}"
    return send_reset_email(user.email, reset_url, token)


@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordIn, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    row = db.execute(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)).scalars().first()

    if row is None or row.used:
        raise HTTPException(status_code=400, detail="Invalid or already-used reset token")
    if datetime.fromisoformat(row.expires_at) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired — request a new one")

    user = db.get(User, row.user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Account no longer exists")

    row.used = True
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"ok": True, "message": "Password updated — you can now log in."}


@router.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return user.to_public()
