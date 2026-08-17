"""FastAPI entry point — voice feature (F1) only.

Run from backend/:  uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""

import json

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.services.voice_service import structure_listing

app = FastAPI(title="Hyperlocal Tourism — Voice API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
