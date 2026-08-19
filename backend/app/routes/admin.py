"""F23 — admin endpoints.

- GET /admin/users — every registered account + last login (who logged in).
  More admin actions (verify-host, hide-listing) extend this file.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.security import require_role
from ..database import get_db
from ..models import User

router = APIRouter(prefix="/admin", dependencies=[Depends(require_role("admin"))])


@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """All accounts, newest first — includes last_login_at so an admin can
    see which user logged in and when."""
    users = db.execute(select(User).order_by(User.created_at.desc())).scalars().all()
    return [u.to_public() for u in users]
