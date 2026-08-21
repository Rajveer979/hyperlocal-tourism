"""Seed real heritage sites across major Indian tourist corridors.

Run:  python -m seed.seed_pois
"""

from sqlalchemy.orm import Session

from app.database import engine
from app.models.poi import POI


# Real coordinates, verified on OpenStreetMap
POIS = [
    # === Gujarat: Ahmedabad area ===
    {"name": "Sabarmati Ashram", "description": "Gandhi's riverside ashram, now a museum of Indian independence.", "lat": 23.0627, "lng": 72.5807, "category": "heritage", "district": "Ahmedabad", "best_time": "morning"},
    {"name": "Adalaj Stepwell", "description": "Ornate 15th-century stepwell with intricate carvings and cooling chambers.", "lat": 23.1638, "lng": 72.6364, "category": "heritage", "district": "Gandhinagar", "best_time": "morning"},
    {"name": "Sarkhej Roza", "description": "15th-century mosque complex, called the 'Acropolis of Ahmedabad'.", "lat": 22.99, "lng": 72.495, "category": "heritage", "district": "Ahmedabad", "best_time": "afternoon"},
    {"name": "Jama Masjid Ahmedabad", "description": "15th-century mosque with yellow sandstone and marble pillars.", "lat": 23.0243, "lng": 72.5812, "category": "temple", "district": "Ahmedabad", "best_time": "morning"},
    {"name": "Bhadra Fort", "description": "Mughal-era fort with the beautiful Darbar Hall and chhatris.", "lat": 23.0225, "lng": 72.5820, "category": "historical", "district": "Ahmedabad", "best_time": "any"},

    # === Gujarat: Vadodara area ===
    {"name": "Laxmi Vilas Palace", "description": "Indo-Saracenic palace four times the size of Buckingham Palace.", "lat": 22.3117, "lng": 73.1817, "category": "heritage", "district": "Vadodara", "best_time": "afternoon"},
    {"name": "Champaner-Pavagadh Archaeological Park", "description": "UNESCO World Heritage hill fortress with 16th-century mosques and temples.", "lat": 22.4833, "lng": 73.5333, "category": "historical", "district": "Panchmahal", "best_time": "morning"},
    {"name": "Modhera Sun Temple", "description": "11th-century sun temple with a stepwell and carved torana gateway.", "lat": 23.16, "lng": 72.37, "category": "temple", "district": "Mehsana", "best_time": "morning"},
    {"name": "Kirti Mandir Vadodara", "description": "Memorial to the Gaekwad dynasty with painted murals and marble sculptures.", "lat": 22.3056, "lng": 73.1894, "category": "heritage", "district": "Vadodara", "best_time": "afternoon"},

    # === Gujarat: En route ===
    {"name": "Nal Sarovar Bird Sanctuary", "description": "Largest wetland bird sanctuary in Gujarat — flamingos in winter.", "lat": 22.52, "lng": 71.89, "category": "nature", "district": "Ahmedabad", "best_time": "morning"},
    {"name": "Thol Lake Bird Sanctuary", "description": "Shallow lake with migratory birds, 35 km from Ahmedabad.", "lat": 23.135, "lng": 72.38, "category": "nature", "district": "Mehsana", "best_time": "morning"},
    {"name": "Dabhoi Fort", "description": "13th-century fort with four gates and carved torans.", "lat": 22.1833, "lng": 73.4333, "category": "historical", "district": "Vadodara", "best_time": "any"},

    # === Rajasthan: Jaipur area ===
    {"name": "Amber Fort", "description": "Hilltop palace-fortress with mirrorwork, courtyards, and panoramic views of Maota Lake.", "lat": 26.9855, "lng": 75.8513, "category": "heritage", "district": "Jaipur", "best_time": "morning"},
    {"name": "Hawa Mahal (Palace of Winds)", "description": "Iconic pink sandstone façade with 953 latticed windows for royal women to watch street festivals.", "lat": 26.9239, "lng": 75.8267, "category": "heritage", "district": "Jaipur", "best_time": "afternoon"},
    {"name": "City Palace Jaipur", "description": "Royal residence blending Mughal and Rajput architecture, still home to Jaipur's royal family.", "lat": 26.9258, "lng": 75.8237, "category": "heritage", "district": "Jaipur", "best_time": "afternoon"},
    {"name": "Jantar Mantar Jaipur", "description": "UNESCO astronomical observatory with the world's largest stone sundial.", "lat": 26.9247, "lng": 75.8245, "category": "historical", "district": "Jaipur", "best_time": "morning"},
    {"name": "Nahargarh Fort", "description": "Crown jewel overlooking Jaipur city — stunning sunset views over the Pink City.", "lat": 26.9387, "lng": 75.8153, "category": "historical", "district": "Jaipur", "best_time": "afternoon"},
    {"name": "Jal Mahal (Water Palace)", "description": "Serene palace floating in the middle of Man Sagar Lake.", "lat": 26.9530, "lng": 75.8462, "category": "heritage", "district": "Jaipur", "best_time": "afternoon"},
    {"name": "Albert Hall Museum", "description": "Indo-Saracenic museum with Egyptian mummy, Rajput miniatures, and art deco interiors.", "lat": 26.9116, "lng": 75.8191, "category": "museum", "district": "Jaipur", "best_time": "any"},
    {"name": "Birla Mandir Jaipur", "description": "Gleaming white marble temple dedicated to Lakshmi-Narayan on Moti Dungri hill.", "lat": 26.8933, "lng": 75.8109, "category": "temple", "district": "Jaipur", "best_time": "morning"},
    {"name": "Chokhi Dhani", "description": "Rajasthani village resort with folk dance, puppet shows, camel rides, and traditional thali.", "lat": 26.8247, "lng": 75.7681, "category": "cultural", "district": "Jaipur", "best_time": "evening"},

    # === Rajasthan: Jodhpur area ===
    {"name": "Mehrangarh Fort", "description": "One of India's largest forts — towering above Jodpur with stunning ramparts and a museum.", "lat": 26.2985, "lng": 73.0184, "category": "heritage", "district": "Jodhpur", "best_time": "morning"},
    {"name": "Umaid Bhawan Palace", "description": "Art Deco palace, one of the world's largest private residences — part hotel, part museum.", "lat": 26.2792, "lng": 73.0468, "category": "heritage", "district": "Jodhpur", "best_time": "afternoon"},
    {"name": "Jaswant Thada", "description": "White marble cenotaph with intricate lattice work — the 'Taj Mahal of Marwar'.", "lat": 26.2990, "lng": 73.0146, "category": "heritage", "district": "Jodhpur", "best_time": "afternoon"},

    # === Rajasthan: Udaipur area ===
    {"name": "City Palace Udaipur", "description": "Rajput lakeside palace complex with museums and balconies overlooking Lake Pichola.", "lat": 24.5764, "lng": 73.6913, "category": "heritage", "district": "Udaipur", "best_time": "afternoon"},
    {"name": "Kumbhalgarh Fort", "description": "UNESCO fort with the second-longest continuous wall after the Great Wall of China.", "lat": 25.15, "lng": 73.58, "category": "historical", "district": "Rajsamand", "best_time": "morning"},
    {"name": "Ranakpur Jain Temple", "description": "1,444 marble pillars, no two alike — one of the finest Jain temples in India.", "lat": 25.15, "lng": 73.45, "category": "temple", "district": "Pali", "best_time": "morning"},
    {"name": "Nathdwara Shrinathji Temple", "description": "Major Vaishnavite pilgrimage site with a 700-year-old black marble idol.", "lat": 24.934, "lng": 73.817, "category": "temple", "district": "Rajsamand", "best_time": "any"},
    {"name": "Eklingji Temple Complex", "description": "200+ temples in a walled complex, the kuldevta of the Mewar dynasty.", "lat": 24.5833, "lng": 73.75, "category": "temple", "district": "Udaipur", "best_time": "morning"},
    {"name": "Fateh Sagar Lake", "description": "Scenic lake with Nehru Island Park — popular for boat rides at sunset.", "lat": 24.5975, "lng": 73.6764, "category": "nature", "district": "Udaipur", "best_time": "evening"},

    # === Rajasthan: Jaisalmer area ===
    {"name": "Jaisalmer Fort", "description": "Living sandstone fort — shops, homes, and temples inside 12th-century walls.", "lat": 26.9124, "lng": 70.9126, "category": "heritage", "district": "Jaisalmer", "best_time": "morning"},
    {"name": "Patwon Ki Haveli", "description": "Cluster of five ornate merchant mansions with carved balconies and jharokhas.", "lat": 26.9141, "lng": 70.9132, "category": "heritage", "district": "Jaisalmer", "best_time": "afternoon"},
    {"name": "Sam Sand Dunes", "description": "Rolling Thar Desert dunes — camel safari and desert camping at sunset.", "lat": 26.7969, "lng": 70.4935, "category": "nature", "district": "Jaisalmer", "best_time": "evening"},

    # === Delhi ===
    {"name": "Red Fort", "description": "Mughal emperor Shah Jahan's massive red sandstone palace — UNESCO World Heritage Site.", "lat": 28.6562, "lng": 77.2410, "category": "heritage", "district": "Delhi", "best_time": "morning"},
    {"name": "Qutub Minar", "description": "73-meter tall victory tower from 1193 — the tallest brick minaret in the world.", "lat": 28.5244, "lng": 77.1855, "category": "heritage", "district": "Delhi", "best_time": "morning"},
    {"name": "Humayun's Tomb", "description": "Mughal garden tomb that inspired the Taj Mahal — UNESCO World Heritage Site.", "lat": 28.5933, "lng": 77.2507, "category": "heritage", "district": "Delhi", "best_time": "morning"},
    {"name": "Lotus Temple", "description": "Stunning Bahá'í House of Worship shaped like a lotus flower — open to all faiths.", "lat": 28.5535, "lng": 77.2588, "category": "temple", "district": "Delhi", "best_time": "afternoon"},
    {"name": "Chandni Chowk", "description": "Old Delhi's bustling bazaar — street food, spice markets, and 400 years of history.", "lat": 28.6506, "lng": 77.2334, "category": "cultural", "district": "Delhi", "best_time": "morning"},
    {"name": "Akshardham Temple", "description": "Modern Hindu temple complex with boat rides, exhibitions, and a garden of India's values.", "lat": 28.6127, "lng": 77.2773, "category": "temple", "district": "Delhi", "best_time": "afternoon"},

    # === Maharashtra: Mumbai area ===
    {"name": "Gateway of India", "description": "Iconic 1924 arch monument overlooking the Arabian Sea — Mumbai's most famous landmark.", "lat": 18.9220, "lng": 72.8347, "category": "heritage", "district": "Mumbai", "best_time": "evening"},
    {"name": "Elephanta Caves", "description": "UNESCO island caves with massive rock-cut Shiva sculptures from the 6th century.", "lat": 18.9634, "lng": 72.9315, "category": "heritage", "district": "Mumbai", "best_time": "morning"},
    {"name": "Chhatrapati Shivaji Terminus", "description": "Victorian Gothic railway station — UNESCO World Heritage architectural masterpiece.", "lat": 18.9398, "lng": 72.8355, "category": "heritage", "district": "Mumbai", "best_time": "any"},
    {"name": "Siddhivinayak Temple", "description": "One of Mumbai's most revered Ganesh temples — a must-visit during Ganesh Chaturthi.", "lat": 19.0169, "lng": 72.8310, "category": "temple", "district": "Mumbai", "best_time": "morning"},
    {"name": "Marine Drive", "description": "3.6 km curved boulevard along the coast — Mumbai's Queen's Necklace at night.", "lat": 18.9434, "lng": 72.8234, "category": "nature", "district": "Mumbai", "best_time": "evening"},

    # === Uttar Pradesh: Varanasi ===
    {"name": "Dashashwamedh Ghat", "description": "Main ghat of Varanasi — spectacular Ganga Aarti ceremony every evening.", "lat": 25.3046, "lng": 83.0106, "category": "cultural", "district": "Varanasi", "best_time": "evening"},
    {"name": "Kashi Vishwanath Temple", "description": "One of the twelve Jyotirlingas — holiest Shiva temple in Hinduism.", "lat": 25.3109, "lng": 83.0107, "category": "temple", "district": "Varanasi", "best_time": "morning"},
    {"name": "Sarnath", "description": "Where Buddha gave his first sermon — ancient stupas, museums, and a serene deer park.", "lat": 25.3714, "lng": 83.0226, "category": "heritage", "district": "Varanasi", "best_time": "morning"},
    {"name": "Assi Ghat", "description": "Southernmost ghat — peaceful sunrise spot with yoga and morning rituals.", "lat": 25.2863, "lng": 83.0083, "category": "cultural", "district": "Varanasi", "best_time": "morning"},

    # === Karnataka: Hampi ===
    {"name": "Virupaksha Temple", "description": "Active 7th-century temple with a 160-foot tower — Hampi's most sacred monument.", "lat": 15.3350, "lng": 76.4600, "category": "temple", "district": "Hampi", "best_time": "morning"},
    {"name": "Vijaya Vittala Temple", "description": "Famous for its stone chariot and musical pillars — Hampi's crown jewel.", "lat": 15.3483, "lng": 76.4730, "category": "heritage", "district": "Hampi", "best_time": "morning"},
    {"name": "Hampi Bazaar", "description": "Ancient marketplace ruins flanked by the Virupaksha temple — soak in Vijayanagar history.", "lat": 15.3355, "lng": 76.4620, "category": "cultural", "district": "Hampi", "best_time": "afternoon"},

    # === Kerala ===
    {"name": "Alleppey Backwaters", "description": "Network of lagoons, lakes, and canals — houseboat cruises through coconut palm-lined waterways.", "lat": 9.4981, "lng": 76.3388, "category": "nature", "district": "Alappuzha", "best_time": "morning"},
    {"name": "Fort Kochi", "description": "450-year-old Portuguese/Dutch fishing village with Chinese fishing nets and colonial charm.", "lat": 9.9638, "lng": 76.2431, "category": "heritage", "district": "Ernakulam", "best_time": "afternoon"},

    # === Madhya Pradesh: Khajuraho ===
    {"name": "Khajuraho Group of Monuments", "description": "UNESCO temples famous for intricate Nagara-style architecture and sculptural art.", "lat": 24.8318, "lng": 79.9199, "category": "heritage", "district": "Chhatarpur", "best_time": "morning"},

    # === Tamil Nadu: Chennai ===
    {"name": "Marina Beach", "description": "India's longest urban beach — bustling promenade with street food and evening walks.", "lat": 13.0500, "lng": 80.2824, "category": "nature", "district": "Chennai", "best_time": "evening"},
    {"name": "Kapaleeshwarar Temple", "description": "7th-century Dravidian temple with a towering gopuram — the soul of Mylapore.", "lat": 13.0339, "lng": 80.2700, "category": "temple", "district": "Chennai", "best_time": "morning"},

    # === West Bengal: Kolkata ===
    {"name": "Howrah Bridge", "description": "Iconic cantilever bridge over the Hooghly River — no nuts or bolts, purely riveted.", "lat": 22.5851, "lng": 88.3468, "category": "heritage", "district": "Kolkata", "best_time": "evening"},
    {"name": "Victoria Memorial", "description": "Marble museum and garden dedicated to Queen Victoria — Kolkata's crown jewel.", "lat": 22.5448, "lng": 88.3426, "category": "heritage", "district": "Kolkata", "best_time": "afternoon"},

    # === Goa ===
    {"name": "Basilica of Bom Jesus", "description": "UNESCO baroque church housing St. Francis Xavier's remains — 1605 Portuguese architecture.", "lat": 15.5009, "lng": 73.9116, "category": "heritage", "district": "Goa", "best_time": "morning"},
    {"name": "Fort Aguada", "description": "17th-century Portuguese fort with a lighthouse — panoramic views of the Arabian Sea.", "lat": 15.4922, "lng": 73.7736, "category": "historical", "district": "Goa", "best_time": "evening"},
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
