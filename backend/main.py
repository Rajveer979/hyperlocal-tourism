"""FastAPI entry point — voice feature (F1) + reviews (F18).

Run from backend/:  uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.database import Base, engine
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.reviews import router as reviews_router
from app.services.voice_service import structure_listing


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dev only — create tables on boot. Real migrations come with the backend
    # teammate's full schema work.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Hyperlocal Tourism", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(reviews_router)


@app.get("/health")
def health():
    return {"status": "ok", "engine": config.VOICE_ENGINE}


@app.post("/voice/structure")
async def voice_structure(
    language: str = Form(...),
    audio: UploadFile | None = File(None),
    transcript: str | None = Form(None),
    previous: str | None = Form(None),
):
    """Audio (WAV 16 kHz mono) + language → {listing, missing, question}.

    A raw `transcript` may be sent instead of audio — the cached-fallback
    layer uses this so no speech-to-text is needed for pre-run samples.
    `previous` is an optional JSON draft listing; when present the engine
    merges the new audio into it (the follow-up round, F1).
    """
    if audio is None and not transcript:
        raise HTTPException(status_code=400, detail="Provide an audio file or a transcript")

    prev = None
    if previous:
        try:
            prev = json.loads(previous)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="previous must be a JSON object") from None

    audio_bytes = await audio.read() if audio else None
    return structure_listing(
        audio_bytes=audio_bytes,
        language=language,
        transcript=transcript,
        previous=prev,
    )
