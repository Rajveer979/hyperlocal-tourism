"""POI model — seeded heritage sites used by the itinerary builder (F12).

These are NOT user-created. They are pre-seeded for the demo corridor
(Ahmedabad → Udaipur) so the LLM has real places to weave into itineraries.
"""

from sqlalchemy import Column, Float, Integer, String

from ..database import Base


class POI(Base):
    __tablename__ = "pois"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    category = Column(String, nullable=True)  # heritage | temple | nature | historical | tourist
    district = Column(String, nullable=True)
    best_time = Column(String, nullable=True)  # e.g. "morning", "afternoon", "any"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "lat": self.lat,
            "lng": self.lng,
            "category": self.category,
            "district": self.district,
            "best_time": self.best_time,
        }
