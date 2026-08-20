"""Idempotent seed for the F18 reviews demo data.

Mirrors `frontend/src/data/mockData.js` so mock mode and the live backend
show the same reviews. The key row: demo traveller **Aarav (id 7)** has a
COMPLETED booking on experience 1 — that's what makes the review gate
demonstrable (exp 1 reviewable, the rest 403).

Run from backend/:
    python -m seed.seed_reviews

Re-runnable: wipes the `bookings` + `reviews` tables and re-inserts.
"""

from sqlalchemy import text

from app.database import Base, SessionLocal, engine
from app.models import Booking, Review

# --- Bookings (F4/F11) — statuses pending | confirmed | completed ------------
BOOKINGS = [
    # Demo traveller Aarav (id 7) — completed visit → can review experience 1
    {"id": 1, "experience_id": 1, "traveller_id": 7, "traveller_name": "Aarav", "slot_time": "2026-07-10T10:00:00", "group_size": 2, "status": "completed", "amount": 600, "created_at": "2026-07-01T09:00:00Z"},
    {"id": 2, "experience_id": 1, "traveller_id": 101, "traveller_name": "Sneha M.", "slot_time": "2026-08-20T10:00:00", "group_size": 2, "status": "confirmed", "amount": 600, "created_at": "2026-08-14T09:00:00Z"},
    {"id": 3, "experience_id": 1, "traveller_id": 102, "traveller_name": "David L.", "slot_time": "2026-08-22T13:00:00", "group_size": 4, "status": "confirmed", "amount": 1200, "created_at": "2026-08-15T11:30:00Z"},
    {"id": 4, "experience_id": 1, "traveller_id": 103, "traveller_name": "Ananya K.", "slot_time": "2026-08-19T10:00:00", "group_size": 1, "status": "pending", "amount": 300, "created_at": "2026-08-16T16:00:00Z"},
]

# --- Reviews (F18) — only for completed bookings -----------------------------
REVIEWS = [
    {"id": 1, "experience_id": 1, "traveller_id": 101, "traveller_name": "Sneha M.", "rating": 5, "comment": "Best thepla I have ever eaten. Kamlaben teaches like a grandmother, patient and warm.", "created_at": "2026-07-12T10:00:00Z"},
    {"id": 2, "experience_id": 1, "traveller_id": 102, "traveller_name": "Rohan D.", "rating": 5, "comment": "Came for the food, stayed for the conversation. The chhaas is worth the detour alone.", "created_at": "2026-06-28T09:30:00Z"},
    {"id": 3, "experience_id": 2, "traveller_id": 104, "traveller_name": "Ananya K.", "rating": 4, "comment": "Throwing the pot was harder than it looks but Mahesh is a brilliant teacher. My pot survived the journey home!", "created_at": "2026-07-05T12:00:00Z"},
    {"id": 4, "experience_id": 3, "traveller_id": 102, "traveller_name": "David L.", "rating": 5, "comment": "Shankar Lal knows every stone of this village. The stepwell story alone is worth the walk.", "created_at": "2026-07-18T08:00:00Z"},
    {"id": 5, "experience_id": 4, "traveller_id": 105, "traveller_name": "Priya V.", "rating": 5, "comment": "A gentle introduction to pichwai. Meera’s hands move like water. Took my painting home and framed it.", "created_at": "2026-07-20T15:00:00Z"},
    {"id": 6, "experience_id": 5, "traveller_id": 106, "traveller_name": "Karan S.", "rating": 4, "comment": "The simplest, most honest meal of our trip. Everything came from the field behind us.", "created_at": "2026-07-25T14:00:00Z"},
]


def run() -> None:
    Base.metadata.create_all(bind=engine)  # ensure tables exist (dev only)

    with SessionLocal() as db:
        # Idempotent: wipe + re-insert so re-runs never duplicate.
        db.query(Review).delete()
        db.query(Booking).delete()
        db.add_all([Booking(**b) for b in BOOKINGS])
        db.add_all([Review(**r) for r in REVIEWS])
        db.commit()

        # Reset PostgreSQL sequences to match seeded IDs
        if str(engine.url).startswith("postgresql"):
            db.execute(text("SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings))"))
            db.execute(text("SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reviews))"))
            db.commit()

    print(f"Seeded {len(BOOKINGS)} bookings and {len(REVIEWS)} reviews.")


if __name__ == "__main__":
    run()
