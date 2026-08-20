"""Pydantic schemas for experiences — request validation + response shapes."""

from pydantic import BaseModel, Field


class ExperienceIn(BaseModel):
    """What the frontend sends on publish."""

    host_name: str = ""
    village_name: str = ""
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    description_en: str | None = None
    price: int = 0
    languages: list[str] = ["hi"]
    women_hosted: bool = False
    lat: float | None = None
    lng: float | None = None
    photos: list[str] = []  # URLs already uploaded


class ExperienceOut(BaseModel):
    """What the API returns."""

    id: int
    host_id: int
    host_name: str | None = None
    title: str
    description: str
    description_en: str | None = None
    price: int
    village_name: str | None = None
    lat: float | None = None
    lng: float | None = None
    languages: list[str] = []
    women_hosted: bool = False
    photos: list[str] = []
    is_active: bool = True
    created_at: str
