# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Vasthu AI Frontend, please report it responsibly.

**Do NOT open a public issue for security vulnerabilities.**

Instead, please email the maintainers directly. Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge your report within 48 hours and work with you to resolve the issue.

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |

## Security Notes

- The frontend does **not** call LLM APIs directly — all AI requests go through the backend.
- Firebase Auth config values (`VITE_FIREBASE_*`) are public client-side keys, not secrets.
- The backend service key (`VITE_API_KEY`) should be kept private and not committed.
- All sensitive operations are authenticated via Firebase tokens sent to the backend.
