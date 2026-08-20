"""Experiences routes — CRUD for listings (F3, F8, F10, F21).

POST /experiences          — host creates a listing
GET  /experiences          — list with filters
GET  /experiences/{id}     — single listing detail
POST /experiences/{id}/photos — upload photos for a listing
"""

import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.security import get_current_user
from ..database import get_db
from ..models import User
from ..models.experience import Experience
from ..schemas import ExperienceIn

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Create ──────────────────────────────────────────────────────────────────

@router.post("/experiences", status_code=201)
def create_experience(
    payload: ExperienceIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exp = Experience(
        host_id=user.id,
        host_name=payload.host_name or user.name,
        village_name=payload.village_name,
        title=payload.title,
        description=payload.description,
        description_en=payload.description_en,
        price=payload.price,
        languages=payload.languages,
        women_hosted=payload.women_hosted,
        lat=payload.lat,
        lng=payload.lng,
        photos=payload.photos,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp.to_dict()


# ── List with filters ───────────────────────────────────────────────────────

@router.get("/experiences")
def list_experiences(
    q: str | None = None,
    category: str | None = None,
    max_price: int | None = None,
    women_hosted: bool | None = None,
    language: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    stmt = select(Experience).where(Experience.is_active == True)

    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            (Experience.title.ilike(like))
            | (Experience.description.ilike(like))
            | (Experience.village_name.ilike(like))
        )
    if max_price is not None:
        stmt = stmt.where(Experience.price <= max_price)
    if women_hosted:
        stmt = stmt.where(Experience.women_hosted == True)
    if language:
        # JSON array contains — works on SQLite too
        stmt = stmt.where(Experience.languages.like(f'%"{language}"%'))

    stmt = stmt.order_by(Experience.created_at.desc()).offset(skip).limit(limit)
    rows = db.execute(stmt).scalars().all()
    return [r.to_dict() for r in rows]


# ── Detail ──────────────────────────────────────────────────────────────────

@router.get("/experiences/{exp_id}")
def get_experience(exp_id: int, db: Session = Depends(get_db)):
    exp = db.get(Experience, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    return exp.to_dict()


# ── Photo upload ────────────────────────────────────────────────────────────

@router.post("/experiences/{exp_id}/photos")
async def upload_photo(
    exp_id: int,
    photo: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exp = db.get(Experience, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    if exp.host_id != user.id:
        raise HTTPException(status_code=403, detail="Not your listing")

    ext = os.path.splitext(photo.filename or "photo.jpg")[1] or ".jpg"
    filename = f"{exp_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await photo.read()
    with open(filepath, "wb") as f:
        f.write(content)

    url = f"/uploads/{filename}"
    photos = list(exp.photos or [])
    photos.append(url)
    exp.photos = photos
    db.commit()
    db.refresh(exp)
    return exp.to_dict()
