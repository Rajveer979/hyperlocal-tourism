"""Layer-3 fallback: a hardcoded Hindi sample listing.

Mirrors `frontend/src/data/mockData.js` → `mockVoiceResult` so mock mode and
the live backend return the same shape and feel. The `original_language` and
`languages` fields are overridden per-request by the caller.
"""

SAMPLE_LISTING = {
    "host_name": "Kamlaben",
    "village_name": "Himmatnagar",
    "title": "Thepla Bananas Seekhen (थेपला बनाना सीखें)",
    "description": (
        "Kamlaben ke ghar par thepla banana seekhein — chulhe par, asli "
        "Gujarati masale ke saath. Khana bhi khayenge, aur recipe ghar le jaayenge."
    ),
    "description_en": (
        "Learn to make thepla at Kamlaben's home — on the chulha, with real "
        "Gujarati spices. You eat what you cook and carry the recipe home."
    ),
    "price": 300,
    "languages": ["hi", "en"],
    "original_language": "hi",
}
