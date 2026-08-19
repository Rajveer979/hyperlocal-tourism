"""Transactional email — Resend (free tier 3k/month), with a dev fallback.

Without a RESEND_API_KEY the service logs the reset token server-side and
returns it in the response so the flow stays demoable end-to-end (marked
`delivered: false`). Add the key + verified sender in backend/.env to go live.
"""

import logging

from .. import config

log = logging.getLogger("email")

RESET_SUBJECT = "Reset your password — Hyperlocal Tourism"


def send_reset_email(to_email: str, reset_url: str, token: str) -> dict:
    """Email a password-reset link. Returns delivery info for the response."""
    if not config.RESEND_API_KEY:
        log.warning("No RESEND_API_KEY — reset token (dev only): %s", token)
        return {"delivered": False, "dev_token": token, "message": "Dev mode: token shown instead of email (set RESEND_API_KEY to go live)"}

    try:
        import resend

        resend.api_key = config.RESEND_API_KEY
        resend.Emails.send(
            {
                "from": config.RESEND_FROM_EMAIL,
                "to": [to_email],
                "subject": RESET_SUBJECT,
                "html": (
                    "<p>Hi,</p>"
                    "<p>We got a request to reset your Hyperlocal Tourism password. "
                    "Click the button below — the link expires in 30 minutes.</p>"
                    f'<p><a href="{reset_url}" style="background:#d97706;color:#fff;padding:10px 18px;'
                    'border-radius:8px;text-decoration:none;display:inline-block">Reset password</a></p>'
                    "<p>If you didn't ask for this, you can safely ignore this email.</p>"
                ),
            }
        )
        return {"delivered": True, "message": "Reset email sent"}
    except Exception as e:  # noqa: BLE001 — surface cleanly, don't crash the request
        log.error("Resend failed: %s", e)
        return {"delivered": False, "dev_token": token, "message": "Email failed — using dev token fallback"}
