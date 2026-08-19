"""Shared input validation — email format, with the friendly messages users
expect from a real website's signup form.
"""

import re

# Reasonable, standard email shape:
#   local part: 1–64 chars, no leading/trailing dots, no consecutive dots,
#               letters/digits and the common specials only
#   domain:     dot-separated labels of letters/digits/hyphens, ending in a
#               TLD of 2+ letters (every mainstream site requires one)
_LOCAL_RE = re.compile(r"^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$")
_DOMAIN_LABEL_RE = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$")

EMAIL_ERROR = "Enter a valid email address (e.g. name@gmail.com)"

# Big providers people actually mistype — a close miss is rejected (not just
# suggested) so invalid-looking addresses never reach the database.
COMMON_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com", "icloud.com", "ymail.com"]


def _levenshtein(a: str, b: str) -> int:
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def _typo_suggestion(local: str, domain: str) -> str | None:
    """If the domain is a close miss of a common provider, return the fix."""
    if domain in COMMON_DOMAINS:
        return None
    best, best_score = None, len(domain) + 1
    for common in COMMON_DOMAINS:
        score = _levenshtein(domain, common)
        if score < best_score:
            best, best_score = common, score
    if best and best_score <= 2 and best_score < len(domain) / 2:
        return f"{local}@{best}"
    return None


def validate_email_format(email: str) -> str:
    """Return the normalized email, or raise ValueError with a clean message."""
    email = (email or "").strip()
    if not email:
        raise ValueError(EMAIL_ERROR)
    if len(email) > 254:
        raise ValueError(EMAIL_ERROR)

    local, sep, domain = email.rpartition("@")
    if not sep or not local or not domain:
        raise ValueError(EMAIL_ERROR)
    if len(local) > 64:
        raise ValueError(EMAIL_ERROR)
    if not _LOCAL_RE.match(local) or local.startswith(".") or local.endswith(".") or ".." in local:
        raise ValueError(EMAIL_ERROR)

    labels = domain.split(".")
    if len(labels) < 2:  # require a TLD
        raise ValueError(EMAIL_ERROR)
    if any(not _DOMAIN_LABEL_RE.match(label) or len(label) > 63 for label in labels):
        raise ValueError(EMAIL_ERROR)
    if not labels[-1].isalpha() or len(labels[-1]) < 2:  # TLD: letters, 2+ (e.g. .com, .in, .co.in)
        raise ValueError(EMAIL_ERROR)

    # Hard-block close typos of common providers — suggestion is required,
    # not optional. (e.g. name@gmial.com is NOT accepted)
    suggestion = _typo_suggestion(local, domain.lower())
    if suggestion:
        raise ValueError(f"That email looks like a typo — did you mean {suggestion}?")

    return f"{local}@{domain}".lower()
