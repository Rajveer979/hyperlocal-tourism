"""Models for the F18 reviews slice.

Kept deliberately lean — see the note in app/database.py. The backend
teammate owns the full schema; these cover only what reviews need.
"""

from sqlalchemy import Column, Integer, String

from ..database import Base


class Booking(Base):
    """A traveller's booking of an experience slot.

    status: pending | confirmed | completed | cancelled
    A booking must be `completed` before a review is allowed.
    """

    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    experience_id = Column(Integer, index=True)
    traveller_id = Column(Integer, index=True)
    traveller_name = Column(String)
    slot_time = Column(String)  # ISO 8601, matches the contract
    group_size = Column(Integer, default=1)
    status = Column(String, default="confirmed")
    amount = Column(Integer, default=0)
    created_at = Column(String)  # ISO 8601


class Review(Base):
    """A traveller's review of an experience they completed."""

    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    experience_id = Column(Integer, index=True)
    traveller_id = Column(Integer, index=True)
    traveller_name = Column(String)
    rating = Column(Integer)  # 1–5
    comment = Column(String)
    created_at = Column(String)  # ISO 8601
