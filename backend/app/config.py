"""Settings loaded from environment (backend/.env)."""

import os

from dotenv import load_dotenv

load_dotenv()  # reads backend/.env when running from backend/


def _get(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


# --- Engine control -----------------------------------------------------------
# auto | gemini | groq | fixture
VOICE_ENGINE = _get("VOICE_ENGINE", "auto").lower()

# --- Gemini (one call: audio -> JSON) -----------------------------------------
GEMINI_API_KEY = _get("GEMINI_API_KEY")
# ⚠️ NOT gemini-3.6-flash — that model 500s on audio input (broken audio
# support). gemini-3.5-flash / gemini-2.5-flash accept audio fine.
GEMINI_MODEL = _get("GEMINI_MODEL", "gemini-3.5-flash")

# --- Groq (two calls: Whisper transcribe -> Llama structure) ------------------
GROQ_API_KEY = _get("GROQ_API_KEY")
GROQ_WHISPER_MODEL = _get("GROQ_WHISPER_MODEL", "whisper-large-v3-turbo")
# llama-3.3-70b-versatile was retired from Groq — gpt-oss-120b is the current
# free-tier JSON-mode model (verified working).
GROQ_LLM_MODEL = _get("GROQ_LLM_MODEL", "openai/gpt-oss-120b")

# --- Server -------------------------------------------------------------------
CORS_ORIGINS = [o.strip() for o in _get("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

# --- Auth (F22) -----------------------------------------------------------------
# Dev-only default — ALWAYS set a real secret in backend/.env for anything
# beyond local testing.
JWT_SECRET = _get("JWT_SECRET", "dev-secret-change-me")
RESET_TOKEN_TTL_MINUTES = 30

# --- Email (forgot password) ----------------------------------------------------
RESEND_API_KEY = _get("RESEND_API_KEY")
RESEND_FROM_EMAIL = _get("RESEND_FROM_EMAIL", "Hyperlocal Tourism <onboarding@resend.dev>")
