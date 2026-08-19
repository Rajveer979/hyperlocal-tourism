"""User + password-reset models for the auth feature (F22).

Full users table — supersedes the "lean slice only" note in database.py for
users: the backend teammate's schema can extend this, but auth needs it now.
"""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Integer, String

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="traveller")  # host | traveller | admin
    language_preference = Column(String, default="hi")
    upi_id = Column(String, nullable=True)
    is_women_hosted = Column(Boolean, default=False)
    verified_by = Column(String, nullable=True)  # panchayat name (F7 badge)
    story = Column(String, nullable=True)  # F6 host story
    photo_url = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())
    last_login_at = Column(String, nullable=True)  # ISO 8601 — set on login

    def to_public(self) -> dict:
        """Safe user shape for the API — never includes the password hash."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "language_preference": self.language_preference,
            "upi_id": self.upi_id,
            "is_women_hosted": self.is_women_hosted,
            "verified_by": self.verified_by,
            "story": self.story,
            "photo_url": self.photo_url,
            "last_login_at": self.last_login_at,
        }


class PasswordResetToken(Base):
    """One-time reset token — stored hashed, expires after 30 minutes."""

    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    token_hash = Column(String, unique=True, nullable=False)
    expires_at = Column(String, nullable=False)  # ISO 8601
    used = Column(Boolean, default=False)
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())
