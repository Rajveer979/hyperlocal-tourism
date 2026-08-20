"""Idempotent seed for demo auth users (F22).

Run from backend/:
    python -m seed.seed_users

Demo logins (match the frontend DEMO_CREDENTIALS constants):
    host@demo       / host123        → Kamlaben (host)
    traveller@demo  / traveller123   → Aarav (traveller, id 7)
    admin@demo      / admin123       → Admin (admin)

Aarav keeps id 7 on purpose — the reviews seed (seed_reviews.py) gives that
traveller a COMPLETED booking on experience 1, which is what makes the
review gate demoable.

Re-runnable: wipes `users` + `password_reset_tokens` and re-inserts.
"""

from sqlalchemy import text

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import PasswordResetToken, User

USERS = [
    {"id": 1, "name": "Kamlaben", "email": "host@demo", "phone": "+91 98765 43210", "role": "host", "password": "host123", "language_preference": "gu", "upi_id": "kamlaben@okhdfcbank", "is_women_hosted": True, "verified_by": "Himmatnagar Gram Panchayat", "story": "Kamlaben has been making thepla in this kitchen for 40 years."},
    {"id": 7, "name": "Aarav", "email": "traveller@demo", "phone": "+91 91234 56780", "role": "traveller", "password": "traveller123", "language_preference": "hi"},
    {"id": 8, "name": "Admin", "email": "admin@demo", "phone": "+91 90000 00000", "role": "admin", "password": "admin123", "language_preference": "en"},
]


def run() -> None:
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        db.query(PasswordResetToken).delete()
        db.query(User).delete()
        for u in USERS:
            password = u.pop("password")
            db.add(User(**u, password_hash=hash_password(password)))
        db.commit()

        # Reset PostgreSQL sequences to match seeded IDs
        if str(engine.url).startswith("postgresql"):
            db.execute(text("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))"))
            db.commit()

    print(f"Seeded {len(USERS)} demo users (host@demo / traveller@demo / admin@demo).")


if __name__ == "__main__":
    run()
