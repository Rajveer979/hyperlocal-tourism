"""Database setup — Neon PostgreSQL (shared cloud database)."""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Auto-create .env from .env.example if missing
_backend_dir = os.path.join(os.path.dirname(__file__), "..")
_env_path = os.path.join(_backend_dir, ".env")
_example_path = os.path.join(_backend_dir, ".env.example")
if not os.path.exists(_env_path) and os.path.exists(_example_path):
    import shutil
    shutil.copy2(_example_path, _env_path)
    print("✅ Created .env from .env.example")

try:
    from dotenv import load_dotenv
    load_dotenv(_env_path)
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hyperlocal.db")

# SQLite needs check_same_thread=False; Neon/PostgreSQL needs SSL
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

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
