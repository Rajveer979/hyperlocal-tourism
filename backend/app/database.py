"""Database setup — SQLAlchemy over SQLite for dev.

Per the plan: SQLite is fine for development and the demo; swapping to
PostgreSQL later is a one-line DATABASE_URL change (the models are portable).

This slice deliberately defines only the tables F18 (reviews) needs:
`bookings` (for the completed-booking gate) and `reviews`. The backend
teammate owns the full schema (users, experiences, availability, etc.) —
their models supersede these on merge.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()  # reads backend/.env when running from backend/

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hyperlocal.db")

# SQLite needs check_same_thread=False; PostgreSQL with Supabase needs SSL
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
_engine_kwargs = {}
if DATABASE_URL.startswith("postgresql") and "supabase.co" in DATABASE_URL:
    _engine_kwargs["connect_args"] = {"sslmode": "require"}
else:
    _engine_kwargs["connect_args"] = _connect_args

engine = create_engine(DATABASE_URL, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base for all models."""


def get_db():
    """FastAPI dependency — yields a session, always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
