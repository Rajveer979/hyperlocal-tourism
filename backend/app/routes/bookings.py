"""Bookings routes — create and list bookings (F11, F4).

POST /bookings                     — traveller creates a booking
GET  /bookings/host/{host_id}      — host sees bookings for their experiences
GET  /bookings/traveller/{traveller_id} — traveller sees their bookings
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.booking import Booking
from ..models.experience import Experience

router = APIRouter()


class BookingIn(BaseModel):
    experience_id: int
    slot_time: str
    group_size: int = 1
    traveller_name: str = ""


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.post("/bookings", status_code=201)
def create_booking(payload: BookingIn, db: Session = Depends(get_db)):
    """Create a new booking and save to database."""
    # Verify experience exists
    exp = db.get(Experience, payload.experience_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    booking = Booking(
        experience_id=payload.experience_id,
        traveller_id=0,  # placeholder until JWT auth is wired
        traveller_name=payload.traveller_name or "Traveller",
        slot_time=payload.slot_time,
        group_size=payload.group_size,
        status="confirmed",
        amount=exp.price * payload.group_size,
        created_at=_iso_now(),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {
        "id": booking.id,
        "experience_id": booking.experience_id,
        "traveller_name": booking.traveller_name,
        "slot_time": booking.slot_time,
        "group_size": booking.group_size,
        "status": booking.status,
        "amount": booking.amount,
        "created_at": booking.created_at,
    }


@router.get("/bookings/host/{host_id}")
def get_host_bookings(host_id: int, db: Session = Depends(get_db)):
    """Get all bookings for a host's experiences."""
    # First find all experiences owned by this host
    host_exp_ids = [
        e.id
        for e in db.execute(
            select(Experience).where(Experience.host_id == host_id)
        ).scalars().all()
    ]

    if not host_exp_ids:
        return []

    # Then find bookings for those experiences
    bookings = db.execute(
        select(Booking)
        .where(Booking.experience_id.in_(host_exp_ids))
        .order_by(Booking.created_at.desc())
    ).scalars().all()

    return [
        {
            "id": b.id,
            "experience_id": b.experience_id,
            "traveller_name": b.traveller_name,
            "slot_time": b.slot_time,
            "group_size": b.group_size,
            "status": b.status,
            "amount": b.amount,
            "created_at": b.created_at,
        }
        for b in bookings
    ]


@router.get("/bookings/traveller/{traveller_id}")
def get_traveller_bookings(traveller_id: int, db: Session = Depends(get_db)):
    """Get all bookings for a traveller."""
    bookings = db.execute(
        select(Booking)
        .where(Booking.traveller_id == traveller_id)
        .order_by(Booking.created_at.desc())
    ).scalars().all()

    return [
        {
            "id": b.id,
            "experience_id": b.experience_id,
            "traveller_name": b.traveller_name,
            "slot_time": b.slot_time,
            "group_size": b.group_size,
            "status": b.status,
            "amount": b.amount,
            "created_at": b.created_at,
        }
        for b in bookings
    ]
