"""F18 — reviews API.

- GET  /experiences/{experience_id}/reviews  → public list for a listing
- POST /reviews                              → create a review, GATED: the
  traveller must have a *completed* booking for that experience.

Traveller identity is a stopgap: the contract body is
{experience_id, rating, comment} and `traveller_id` is optional, defaulting
to the demo traveller, until the backend teammate's real JWT auth (F22)
lands. Swap `_current_traveller()` for a token dependency then.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Review

router = APIRouter()

# Demo traveller (F22 hardcoded logins): Aarav. The seed gives this traveller
# a completed booking on experience 1, so that one is reviewable in the demo.
DEMO_TRAVELLER_ID = 7


class ReviewIn(BaseModel):
    experience_id: int
    rating: int = Field(ge=1, le=5, description="1–5 stars")
    comment: str = Field(min_length=1, max_length=500)
    # Temporary stopgap — replaced by JWT auth; omit in normal calls.
    traveller_id: int | None = None


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _current_traveller(payload: ReviewIn) -> int:
    return payload.traveller_id or DEMO_TRAVELLER_ID


@router.get("/experiences/{experience_id}/reviews")
def list_reviews(experience_id: int, db: Session = Depends(get_db)):
    """All reviews for one experience, newest first."""
    rows = (
        db.execute(
            select(Review)
            .where(Review.experience_id == experience_id)
            .order_by(Review.created_at.desc())
        )
        .scalars()
        .all()
    )
    return rows


@router.post("/reviews", status_code=201)
def create_review(payload: ReviewIn, db: Session = Depends(get_db)):
    """Create a review — only for travellers with a COMPLETED booking."""
    traveller_id = _current_traveller(payload)

    booking = db.execute(
        select(Booking).where(
            Booking.experience_id == payload.experience_id,
            Booking.traveller_id == traveller_id,
        )
    ).scalars().first()

    if booking is None:
        raise HTTPException(
            status_code=403,
            detail="You can only review an experience you have booked.",
        )
    if booking.status != "completed":
        raise HTTPException(
            status_code=403,
            detail="Reviews open only after your visit is completed — check back after the experience date.",
        )

    review = Review(
        experience_id=payload.experience_id,
        traveller_id=traveller_id,
        traveller_name=booking.traveller_name or f"Traveller {traveller_id}",
        rating=payload.rating,
        comment=payload.comment.strip(),
        created_at=_iso_now(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
