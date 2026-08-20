"""Experience model — the core listing table (F3, F8, F10).

Each row is one bookable experience created by a host via voice or manual form.
Photos are stored in a JSON array (URLs relative to /uploads/).
"""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Float, Integer, JSON, String

from ..database import Base


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, index=True, nullable=False)

    # Listing content — filled by voice AI or manually
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    description_en = Column(String, nullable=True)  # auto-translated
    price = Column(Integer, default=0)  # INR

    # Location
    village_name = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    # Host-facing
    host_name = Column(String, nullable=True)
    languages = Column(JSON, default=list)  # ["hi", "en"]
    women_hosted = Column(Boolean, default=False)

    # Photo URLs — list of relative paths like ["/uploads/abc.jpg"]
    photos = Column(JSON, default=list)

    # Status
    is_active = Column(Boolean, default=True)

    created_at = Column(
        String, default=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "host_id": self.host_id,
            "host_name": self.host_name,
            "title": self.title,
            "description": self.description,
            "description_en": self.description_en,
            "price": self.price,
            "village_name": self.village_name,
            "lat": self.lat,
            "lng": self.lng,
            "languages": self.languages or [],
            "women_hosted": self.women_hosted,
            "photos": self.photos or [],
            "is_active": self.is_active,
            "created_at": self.created_at,
        }
