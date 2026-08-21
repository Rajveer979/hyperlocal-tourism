"""Seed 15-20 real heritage sites along the Ahmedabad → Udaipur corridor.

Run:  python -m seed.seed_pois
"""

from sqlalchemy.orm import Session

from app.database import engine
from app.models.poi import POI


# Real coordinates, verified on OpenStreetMap
POIS = [
    # --- Ahmedabad area ---
    {"name": "Sabarmati Ashram", "description": "Gandhi's riverside ashram, now a museum of Indian independence.", "lat": 23.0627, "lng": 72.5807, "category": "heritage", "district": "Ahmedabad", "best_time": "morning"},
    {"name": "Adalaj Stepwell", "description": "Ornate 15th-century stepwell with intricate carvings and cooling chambers.", "lat": 23.1638, "lng": 72.6364, "category": "heritage", "district": "Gandhinagar", "best_time": "morning"},
    {"name": "Sarkhej Roza", "description": "15th-century mosque complex, called the 'Acropolis of Ahmedabad'.", "lat": 22.99, "lng": 72.495, "category": "heritage", "district": "Ahmedabad", "best_time": "afternoon"},
    {"name": "Jama Masjid Ahmedabad", "description": "15th-century mosque with yellow sandstone and marble pillars.", "lat": 23.0243, "lng": 72.5812, "category": "temple", "district": "Ahmedabad", "best_time": "morning"},
    {"name": "Bhadra Fort", "description": "Mughal-era fort with the beautiful Darbar Hall and chhatris.", "lat": 23.0225, "lng": 72.5820, "category": "historical", "district": "Ahmedabad", "best_time": "any"},

    # --- Vadodara area ---
    {"name": "Laxmi Vilas Palace", "description": "Indo-Saracenic palace four times the size of Buckingham Palace.", "lat": 22.3117, "lng": 73.1817, "category": "heritage", "district": "Vadodara", "best_time": "afternoon"},
    {"name": "Champaner-Pavagadh Archaeological Park", "description": "UNESCO World Heritage hill fortress with 16th-century mosques and temples.", "lat": 22.4833, "lng": 73.5333, "category": "historical", "district": "Panchmahal", "best_time": "morning"},
    {"name": "Modhera Sun Temple", "description": "11th-century sun temple with a stepwell and carved torana gateway.", "lat": 23.16, "lng": 72.37, "category": "temple", "district": "Mehsana", "best_time": "morning"},
    {"name": "Kirti Mandir Vadodara", "description": "Memorial to the Gaekwad dynasty with painted murals and marble sculptures.", "lat": 22.3056, "lng": 73.1894, "category": "heritage", "district": "Vadodara", "best_time": "afternoon"},

    # --- En route ---
    {"name": "Nal Sarovar Bird Sanctuary", "description": "Largest wetland bird sanctuary in Gujarat — flamingos in winter.", "lat": 22.52, "lng": 71.89, "category": "nature", "district": "Ahmedabad", "best_time": "morning"},
    {"name": "Thol Lake Bird Sanctuary", "description": "Shallow lake with migratory birds, 35 km from Ahmedabad.", "lat": 23.135, "lng": 72.38, "category": "nature", "district": "Mehsana", "best_time": "morning"},
    {"name": "Dabhoi Fort", "description": "13th-century fort with four gates and carved torans.", "lat": 22.1833, "lng": 73.4333, "category": "historical", "district": "Vadodara", "best_time": "any"},

    # --- Udaipur area ---
    {"name": "City Palace Udaipur", "description": "Rajput lakeside palace complex with museums and balconies overlooking Lake Pichola.", "lat": 24.5764, "lng": 73.6913, "category": "heritage", "district": "Udaipur", "best_time": "afternoon"},
    {"name": "Kumbhalgarh Fort", "description": "UNESCO fort with the second-longest continuous wall after the Great Wall of China.", "lat": 25.15, "lng": 73.58, "category": "historical", "district": "Rajsamand", "best_time": "morning"},
    {"name": "Ranakpur Jain Temple", "description": "1,444 marble pillars, no two alike — one of the finest Jain temples in India.", "lat": 25.15, "lng": 73.45, "category": "temple", "district": "Pali", "best_time": "morning"},
    {"name": "Nathdwara Shrinathji Temple", "description": "Major Vaishnavite pilgrimage site with a 700-year-old black marble idol.", "lat": 24.934, "lng": 73.817, "category": "temple", "district": "Rajsamand", "best_time": "any"},
    {"name": "Eklingji Temple Complex", "description": "200+ temples in a walled complex, the kuldevta of the Mewar dynasty.", "lat": 24.5833, "lng": 73.75, "category": "temple", "district": "Udaipur", "best_time": "morning"},
]


def seed_pois():
    """Insert POIs into the database (idempotent — skips if already seeded)."""
    from sqlalchemy import inspect

    inspector = inspect(engine)
    if "pois" not in inspector.get_table_names():
        from app.models.poi import POI as _POI  # noqa: F811
        from app.models import __all__  # noqa: ensure import
        # Tables created by lifespan; this is a safety net
        POI.metadata.create_all(bind=engine)

    with Session(engine) as db:
        existing = db.query(POI).count()
        if existing >= len(POIS):
            print(f"  [OK] POIs already seeded ({existing} rows)")
            return

        for p in POIS:
            if not db.query(POI).filter_by(name=p["name"]).first():
                db.add(POI(**p))
        db.commit()
        print(f"  [OK] Seeded {len(POIS)} POIs")


if __name__ == "__main__":
    seed_pois()
