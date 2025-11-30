# Backend Authentication API Specification

This document specifies the backend API endpoints required for the ProphetAtlas authentication system.

## Base URL

All endpoints are prefixed with `/api/auth`

**Base URL:** `{VITE_CIVITAS_API_URL}/api/auth`

---

## Endpoints

### 1. Sign In

**Endpoint:** `POST /api/auth/signin`

**Headers:**
```
Content-Type: application/json
X-API-Key: <optional_api_key>  # If API key authentication is enabled
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "remember_me": true  // Optional, defaults to false
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "user_123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z",
    "last_login": "2024-11-27T20:00:00Z"
  },
  "thread_id": "thread_456def",
  "expires_at": "2024-12-27T20:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email or password format
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

**Notes:**
- If `remember_me` is `true`, token should have longer expiration (e.g., 30 days)
- If `remember_me` is `false`, token should have shorter expiration (e.g., session-based or 24 hours)
- `thread_id` should be a new or existing chat thread for the user
- `last_login` should be updated on successful sign-in

---

### 2. Sign Up

**Endpoint:** `POST /api/auth/signup`

**Headers:**
```
Content-Type: application/json
X-API-Key: <optional_api_key>
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",  // Optional
  "accept_terms": true  // Required, must be true
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "user_123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-11-27T20:00:00Z",
    "last_login": null
  },
  "thread_id": "thread_456def",
  "expires_at": "2024-12-27T20:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: 
  - Invalid email format
  - Password doesn't meet requirements (min 8 chars, uppercase, number)
  - Email already exists
  - `accept_terms` is false
- `500 Internal Server Error`: Server error

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number

---

### 3. Google OAuth Sign In

**Endpoint:** `GET /api/auth/google`

**Description:** Initiates Google OAuth flow. Should redirect to Google OAuth consent screen, then handle callback.

**Query Parameters:** None (or optional `redirect_uri`)

**Response:** 
- Redirects to Google OAuth consent screen
- After user consent, redirects to `/api/auth/google/callback`
- Callback should create/update user and redirect to frontend with token

**Callback Endpoint:** `GET /api/auth/google/callback`

**Callback Query Parameters:**
- `code`: Authorization code from Google
- `state`: Optional state parameter for CSRF protection

**Callback Response:**
- Should redirect to frontend with token in URL or set cookie
- Example: `https://frontend.com/auth/callback?token=...&user_id=...`

**Error Responses:**
- `501 Not Implemented`: If Google OAuth is not yet implemented
- `400 Bad Request`: Invalid OAuth callback
- `500 Internal Server Error`: Server error

**Notes:**
- Currently returns 501 in frontend, but should be implemented for production
- Should create user account if doesn't exist
- Should link to existing account if email matches

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-API-Key: <optional_api_key>
```

**Response (200 OK):**
```json
{
  "user_id": "user_123abc",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "last_login": "2024-11-27T20:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

**Notes:**
- Used to verify token validity and get user info
- Called on app load to restore session
- Should update `last_login` timestamp

---

### 5. Sign Out

**Endpoint:** `POST /api/auth/signout`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-API-Key: <optional_api_key>
```

**Response (200 OK):**
```json
{
  "message": "Signed out successfully",
  "success": true
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid token
- `500 Internal Server Error`: Server error

**Notes:**
- Should invalidate the token on the server
- Frontend will remove token from localStorage/sessionStorage regardless of API response
- Optional: Could maintain a blacklist of invalidated tokens

---

### 6. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
X-API-Key: <optional_api_key>
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent if account exists",
  "success": true
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email format
- `500 Internal Server Error`: Server error

**Notes:**
- Should send password reset email with reset token
- For security, always return success message even if email doesn't exist (prevents email enumeration)
- Reset token should expire (e.g., 1 hour)
- Reset token should be single-use

---

### 7. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Headers:**
```
Content-Type: application/json
X-API-Key: <optional_api_key>
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully",
  "success": true
}
```

**Error Responses:**
- `400 Bad Request`: 
  - Invalid token
  - Token expired
  - Password doesn't meet requirements
- `500 Internal Server Error`: Server error

**Notes:**
- Should validate reset token
- Should check token expiration
- Should invalidate token after use
- Should update user password
- Should optionally invalidate all existing sessions for security

---

## Authentication Mechanism

### Token Format

- **Type:** JWT (JSON Web Token) recommended
- **Storage:** 
  - `localStorage` if `remember_me` is true
  - `sessionStorage` if `remember_me` is false
- **Header:** `Authorization: Bearer <token>`

### Token Expiration

- **With remember_me=true:** 30 days (or configurable)
- **With remember_me=false:** 24 hours or session-based
- **Token refresh:** Optional, but recommended for better UX

### Security Considerations

1. **Password Hashing:** Use bcrypt or similar (never store plaintext)
2. **Token Security:** 
   - Use HTTPS in production
   - Include expiration in token
   - Validate token signature
3. **Rate Limiting:** 
   - Limit sign-in attempts (e.g., 5 per 15 minutes)
   - Limit password reset requests (e.g., 3 per hour per email)
4. **CSRF Protection:** For OAuth flows, use state parameter
5. **Email Verification:** Optional but recommended for production

---

## Database Schema (Suggested)

### Users Table
```sql
CREATE TABLE users (
  user_id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  provider VARCHAR(50) DEFAULT 'email',  -- 'email' or 'google'
  provider_id VARCHAR(255),  -- For OAuth providers
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

### Sessions/Tokens Table (Optional - for token blacklisting)
```sql
CREATE TABLE user_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remember_me BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
  token VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

---

## Implementation Priority

### Phase 1 (Critical - Required for Sign-In/Sign-Up Pages)
1. ✅ `POST /api/auth/signin` - Sign in with email/password
2. ✅ `POST /api/auth/signup` - Create new account
3. ✅ `GET /api/auth/me` - Get current user (for session restoration)
4. ✅ `POST /api/auth/signout` - Sign out

### Phase 2 (Important - Password Recovery)
5. `POST /api/auth/forgot-password` - Request password reset
6. `POST /api/auth/reset-password` - Reset password with token

### Phase 3 (Nice to Have - OAuth)
7. `GET /api/auth/google` - Google OAuth initiation
8. `GET /api/auth/google/callback` - Google OAuth callback

---

## Testing

### Test Sign In
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "remember_me": true
  }'
```

### Test Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "NewPassword123",
    "name": "New User",
    "accept_terms": true
  }'
```

### Test Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

---

## Integration Notes

- All endpoints should support CORS for frontend origin
- Error messages should be user-friendly but not reveal sensitive info
- Log authentication attempts for security monitoring
- Consider implementing 2FA for enhanced security (future enhancement)
