# Backend API Implementation Priorities

## 🔴 Phase 1: Critical (Required for MVP)

### Authentication API
**Status:** ⚠️ **REQUIRED** - Sign-in/Sign-up pages depend on this

1. **`POST /api/auth/signin`**
   - **Request:**
     ```json
     {
       "email": "user@example.com",
       "password": "securepassword123",
       "remember_me": true
     }
     ```
   - **Response (200 OK):**
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
   - **Errors:** `400` (invalid format), `401` (invalid credentials), `500` (server error)
   - Purpose: User login

2. **`POST /api/auth/signup`**
   - **Request:**
     ```json
     {
       "email": "user@example.com",
       "password": "securepassword123",
       "name": "John Doe",
       "accept_terms": true
     }
     ```
   - **Response (200 OK):**
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
   - **Errors:** `400` (invalid format, email exists, password requirements, accept_terms false), `500` (server error)
   - Purpose: Create new account

3. **`GET /api/auth/me`**
   - **Headers:** `Authorization: Bearer <token>`
   - **Response (200 OK):**
     ```json
     {
       "user_id": "user_123abc",
       "email": "user@example.com",
       "name": "John Doe",
       "created_at": "2024-01-15T10:30:00Z",
       "last_login": "2024-11-27T20:00:00Z"
     }
     ```
   - **Errors:** `401` (invalid/expired token), `404` (user not found), `500` (server error)
   - Purpose: Verify token & get user info (called on app load)

4. **`POST /api/auth/signout`**
   - **Headers:** `Authorization: Bearer <token>`
   - **Response (200 OK):**
     ```json
     {
       "message": "Signed out successfully",
       "success": true
     }
     ```
   - **Errors:** `401` (invalid token), `500` (server error)
   - Purpose: Invalidate token

**Why Critical:** Frontend sign-in/sign-up pages are ready but won't work without these endpoints.

---

## 🟡 Phase 2: Important (Better UX)

### Password Recovery
5. **`POST /api/auth/forgot-password`**
   - **Request:**
     ```json
     {
       "email": "user@example.com"
     }
     ```
   - **Response (200 OK):**
     ```json
     {
       "message": "Password reset email sent if account exists",
       "success": true
     }
     ```
   - **Errors:** `400` (invalid email format), `500` (server error)
   - Purpose: Send password reset email

6. **`POST /api/auth/reset-password`**
   - **Request:**
     ```json
     {
       "token": "reset_token_from_email",
       "new_password": "newSecurePassword123"
     }
     ```
   - **Response (200 OK):**
     ```json
     {
       "message": "Password reset successfully",
       "success": true
     }
     ```
   - **Errors:** `400` (invalid token, expired, password requirements), `500` (server error)
   - Purpose: Reset password with token from email

### Onboarding API
7. **`GET /api/onboarding/steps`**
   - **Response (200 OK):**
     ```json
     {
       "steps": [
         {
           "id": "chat",
           "tab": "chat",
           "title": "Chat with ProphetAtlas",
           "description": "Ask me anything about properties...",
           "duration": 18,
           "order": 1,
           "enabled": true
         }
       ],
       "version": "1.0.0"
     }
     ```
   - Purpose: Get onboarding tour steps

8. **`POST /api/onboarding/complete`**
   - **Request:**
     ```json
     {
       "user_id": "user_123abc",
       "steps_completed": 3,
       "duration_seconds": 45,
       "skipped": false
     }
     ```
   - **Response (200 OK):**
     ```json
     {
       "success": true,
       "redirect_to_tab": "chat"
     }
     ```
   - Purpose: Mark onboarding as complete

9. **`GET /api/onboarding/status`**
   - **Query:** `?user_id=user_123abc`
   - **Response (200 OK):**
     ```json
     {
       "completed": true,
       "completed_at": "2024-11-27T20:00:00Z"
     }
     ```
   - Purpose: Check if user completed onboarding

**Note:** Onboarding API is already documented in `BACKEND_ONBOARDING_API.md`

---

## 🟢 Phase 3: Nice to Have (Enhancements)

### OAuth
10. **`GET /api/auth/google`**
    - Purpose: Initiate Google OAuth flow
    - Redirects to Google, then to callback

11. **`GET /api/auth/google/callback`**
    - **Query:** `?code=<auth_code>&state=<csrf_token>`
    - Purpose: Handle OAuth callback, create/login user

### Chat History Sync (Optional)
12. **`GET /api/chats`**
    - **Headers:** `Authorization: Bearer <token>`
    - **Query:** `?limit=50&offset=0`
    - **Response (200 OK):**
      ```json
      {
        "chats": [
          {
            "id": "chat_123",
            "title": "Property analysis in Austin",
            "thread_id": "thread_456",
            "created_at": "2024-11-27T20:00:00Z",
            "updated_at": "2024-11-27T21:00:00Z",
            "message_count": 15
          }
        ],
        "total": 25
      }
      ```
    - Purpose: Get user's chat history

13. **`GET /api/chats/search?q=<query>`**
    - **Headers:** `Authorization: Bearer <token>`
    - **Query:** `?q=austin`
    - **Response (200 OK):**
      ```json
      {
        "chats": [...],
        "total": 5
      }
      ```
    - Purpose: Search chat history

14. **`GET /api/chats/{chat_id}/messages`**
    - **Headers:** `Authorization: Bearer <token>`
    - **Response (200 OK):**
      ```json
      {
        "messages": [
          {
            "id": "msg_123",
            "role": "user",
            "content": "Find properties in Austin",
            "created_at": "2024-11-27T20:00:00Z"
          }
        ],
        "thread_id": "thread_456"
      }
      ```
    - Purpose: Get messages for a specific chat

15. **`DELETE /api/chats/{chat_id}`**
    - **Headers:** `Authorization: Bearer <token>`
    - **Response (200 OK):**
      ```json
      {
        "success": true,
        "message": "Chat deleted"
      }
      ```
    - Purpose: Delete a chat

**Note:** Currently using localStorage, so this is optional enhancement.

### Bookmarks Sync (Optional)
16. **`GET /api/bookmarks`**
    - **Headers:** `Authorization: Bearer <token>`
    - **Response (200 OK):**
      ```json
      {
        "bookmarks": [
          {
            "id": "bm_123",
            "property": {
              "listing_id": "listing_456",
              "address": "123 Main St",
              "city": "Austin",
              "state": "TX",
              "zip_code": "78701",
              "price": 350000,
              "bedrooms": 3,
              "bathrooms": 2,
              "sqft": 1500,
              "property_type": "Single Family",
              "year_built": 2010,
              "lot_size": 10890,
              "lat": 30.2672,
              "lng": -97.7431,
              "photos": ["https://..."],
              "days_on_market": 15,
              "listing_url": "https://...",
              "hoa_fee": 150,
              "description": "Beautiful home...",
              "listing_type": "Standard",
              "mls_number": "MLS123456",
              "nightly_price": 150,
              "monthly_revenue_estimate": 4500,
              "annual_revenue_estimate": 54000,
              "cash_on_cash_roi": 0.12,
              "avg_occupancy_rate": 0.75
            },
            "display_name": "123 Main St, Austin",
            "bookmarked_at": "2024-11-27T20:00:00Z",
            "last_updated_at": "2024-11-27T20:00:00Z",
            "notes": "Great location",
            "tags": ["potential", "under-review"],
            "search_query": "properties in Austin under 400k"
          }
        ]
      }
      ```
    - **Errors:** `401` (unauthorized), `500` (server error)
    - Purpose: Get user's bookmarked properties

17. **`POST /api/bookmarks`**
    - **Headers:** `Authorization: Bearer <token>`
    - **Request:**
      ```json
      {
        "property": {
          "listing_id": "listing_456",
          "address": "123 Main St",
          "city": "Austin",
          "state": "TX",
          "zip_code": "78701",
          "price": 350000,
          "bedrooms": 3,
          "bathrooms": 2,
          "sqft": 1500,
          "property_type": "Single Family",
          "year_built": 2010,
          "lot_size": 10890,
          "lat": 30.2672,
          "lng": -97.7431
        },
        "notes": "Optional notes",
        "tags": ["tag1", "tag2"],
        "search_query": "Optional original search query"
      }
      ```
    - **Response (200 OK):**
      ```json
      {
        "bookmark": {
          "id": "bm_123",
          "property": {...},
          "display_name": "123 Main St, Austin",
          "bookmarked_at": "2024-11-27T20:00:00Z",
          "last_updated_at": "2024-11-27T20:00:00Z",
          "notes": "Optional notes",
          "tags": ["tag1", "tag2"],
          "search_query": "Optional original search query"
        },
        "success": true
      }
      ```
    - **Errors:** `400` (invalid property data), `401` (unauthorized), `409` (bookmark already exists), `500` (server error)
    - Purpose: Add a bookmark

18. **`PATCH /api/bookmarks/{bookmark_id}`**
    - **Headers:** `Authorization: Bearer <token>`
    - **Request:**
      ```json
      {
        "notes": "Updated notes",
        "tags": ["updated", "tags"]
      }
      ```
    - **Response (200 OK):**
      ```json
      {
        "bookmark": {
          "id": "bm_123",
          "property": {...},
          "display_name": "123 Main St, Austin",
          "bookmarked_at": "2024-11-27T20:00:00Z",
          "last_updated_at": "2024-11-27T21:00:00Z",
          "notes": "Updated notes",
          "tags": ["updated", "tags"]
        },
        "success": true
      }
      ```
    - **Errors:** `400` (invalid data), `401` (unauthorized), `404` (bookmark not found), `500` (server error)
    - Purpose: Update bookmark notes/tags

19. **`DELETE /api/bookmarks/{bookmark_id}`**
    - **Headers:** `Authorization: Bearer <token>`
    - **Response (200 OK):**
      ```json
      {
        "success": true,
        "message": "Bookmark deleted"
      }
      ```
    - **Errors:** `401` (unauthorized), `404` (bookmark not found), `500` (server error)
    - Purpose: Remove bookmark

**Note:** Currently using localStorage, so this is optional enhancement.

---

## 📋 Quick Implementation Checklist

### Must Have (Phase 1):
- [ ] `POST /api/auth/signin`
- [ ] `POST /api/auth/signup`
- [ ] `GET /api/auth/me`
- [ ] `POST /api/auth/signout`
- [ ] JWT token generation & validation
- [ ] Password hashing (bcrypt)
- [ ] CORS headers for frontend
- [ ] Rate limiting on auth endpoints

### Should Have (Phase 2):
- [ ] `POST /api/auth/forgot-password`
- [ ] `POST /api/auth/reset-password`
- [ ] `GET /api/onboarding/steps`
- [ ] `POST /api/onboarding/complete`
- [ ] `GET /api/onboarding/status`

### Nice to Have (Phase 3):
- [ ] `GET /api/auth/google` + callback
- [ ] Chat history endpoints (4 endpoints)
- [ ] Bookmarks endpoints (4 endpoints)

---

## 🎯 Start Here

**Minimum to get sign-in/sign-up working:**
1. Implement `POST /api/auth/signin`
2. Implement `POST /api/auth/signup`
3. Implement `GET /api/auth/me`
4. Implement `POST /api/auth/signout`

Once these 4 endpoints work, the frontend authentication flow will be functional.

See `BACKEND_AUTH_API.md` for detailed request/response formats and error handling.
