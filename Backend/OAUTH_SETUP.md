# MediConnect OAuth Setup (Google, GitHub, Facebook)

This guide configures patient social login for Backend + Frontend.

## 1) Required Backend environment variables

Set these in Backend/.env for local and in your production environment manager:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_AUTH_ENABLED=true
- FRONTEND_URL
- OAUTH_CALLBACK_PATH=/auth/oauth/callback

Optional (only if you also want GitHub/Facebook login):

- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- FACEBOOK_CLIENT_ID
- FACEBOOK_CLIENT_SECRET
- GITHUB_AUTH_ENABLED=true
- FACEBOOK_AUTH_ENABLED=true

A provider is usable only when:
- *_AUTH_ENABLED is true
- client ID and client secret are both set

### Google-only minimum setup (.env)

If you only want Google login right now, use this exact block:

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_AUTH_ENABLED=true
GITHUB_AUTH_ENABLED=false
FACEBOOK_AUTH_ENABLED=false
FRONTEND_URL=http://localhost:5173
OAUTH_CALLBACK_PATH=/auth/oauth/callback

## 2) Redirect URI format used by MediConnect

MediConnect computes redirect URI as:

{FRONTEND_URL}{OAUTH_CALLBACK_PATH}/{provider}

Examples:
- http://localhost:5173/auth/oauth/callback/google
- http://localhost:5173/auth/oauth/callback/github
- http://localhost:5173/auth/oauth/callback/facebook

Production examples:
- https://app.yourdomain.com/auth/oauth/callback/google
- https://app.yourdomain.com/auth/oauth/callback/github
- https://app.yourdomain.com/auth/oauth/callback/facebook

## 3) OAuth app registration checklist

Google OAuth app:
- Add authorized redirect URI for google callback above
- Ensure scopes include openid, email, profile

GitHub OAuth app:
- Add callback URL for github callback above
- Ensure app has user email access (read:user and user:email scopes are requested)

Facebook app:
- Add valid OAuth redirect URI for facebook callback above
- Ensure app requests email and public_profile

## 4) Validate provider state from API

Use:

GET /api/auth/oauth/providers?intent=login

Expected per provider fields:
- configured: true/false
- enabled: true/false
- callbackUrl
- missingFields
- unavailableReason

When enabled=true, login button should be clickable in frontend.

## 5) Production env loading note

Backend now loads env files from Backend root explicitly:
- .env.production (if present)
- .env

Runtime process environment variables still take priority.

## 6) End-to-end smoke test

1. Open login page.
2. Confirm only enabled providers are clickable.
3. Click provider button.
4. Complete provider consent screen.
5. Confirm redirect back to /auth/oauth/callback/:provider.
6. Confirm user lands on dashboard after token exchange.

If callback fails, inspect provider app redirect URI and FRONTEND_URL first.
