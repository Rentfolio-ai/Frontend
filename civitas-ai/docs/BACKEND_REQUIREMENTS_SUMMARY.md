# Backend Requirements Summary

This document provides a high-level overview of all backend requirements for the ProphetAtlas frontend.

## 📋 Table of Contents

1. [Authentication API](#authentication-api) - **NEW - Required for Sign-In/Sign-Up**
2. [Stream API](#stream-api) - Already documented
3. [Onboarding API](#onboarding-api) - Already documented
4. [Chat History & Search](#chat-history--search) - **NEW - Optional Enhancement**
5. [Bookmarks API](#bookmarks-api) - **NEW - Optional Enhancement**

---

## 1. Authentication API

**Status:** ⚠️ **REQUIRED** - Frontend sign-in/sign-up pages depend on this

**Documentation:** See `BACKEND_AUTH_API.md` for complete specification

**Endpoints Required:**
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/me` - Get current user (for session restoration)
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/google` - Google OAuth (optional, Phase 3)

**Priority:** 🔴 **HIGH** - Required for authentication flow

**Current State:** Frontend is ready, backend needs implementation

---

## 2. Stream API

**Status:** ✅ **Documented** - See `BACKEND_STREAM_IMPLEMENTATION.md`

**Endpoint:** `POST /api/stream` - Server-Sent Events (SSE) streaming

**Purpose:** Real-time chat with thinking states, tool execution, and streamed responses

**Priority:** 🔴 **HIGH** - Core chat functionality

---

## 3. Onboarding API

**Status:** ✅ **Documented** - See `BACKEND_ONBOARDING_API.md`

**Endpoints:**
- `GET /api/onboarding/steps` - Get onboarding steps
- `POST /api/onboarding/complete` - Mark onboarding as complete
- `GET /api/onboarding/status` - Check onboarding status

**Priority:** 🟡 **MEDIUM** - Nice to have for new user experience

---

## 4. Chat History & Search

**Status:** 💡 **OPTIONAL ENHANCEMENT** - Currently using localStorage

**Current Implementation:** 
- Chat history stored in `localStorage` as `civitas-chat-history`
- Search works locally on frontend
- Each chat has: `id`, `title`, `timestamp`, `createdAt`, `messages[]`

**Proposed Backend Endpoints:**

### Get Chat History
```
GET /api/chats
Headers: Authorization: Bearer <token>
Query: ?limit=50&offset=0
Response: {
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

### Search Chats
```
GET /api/chats/search?q=austin
Headers: Authorization: Bearer <token>
Response: {
  "chats": [...],
  "total": 5
}
```

### Get Chat Messages
```
GET /api/chats/{chat_id}/messages
Headers: Authorization: Bearer <token>
Response: {
  "messages": [...],
  "thread_id": "thread_456"
}
```

### Delete Chat
```
DELETE /api/chats/{chat_id}
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "message": "Chat deleted"
}
```

**Database Schema:**
```sql
CREATE TABLE chats (
  chat_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  thread_id VARCHAR(255),
  title VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
  message_id VARCHAR(255) PRIMARY KEY,
  chat_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE
);

CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_messages_chat_id ON chat_messages(chat_id);
```

**Priority:** 🟢 **LOW** - Enhancement, not critical. localStorage works for now.

---

## 5. Bookmarks API

**Status:** 💡 **OPTIONAL ENHANCEMENT** - Currently using localStorage

**Current Implementation:**
- Bookmarks stored in `localStorage` as `civitas-property-bookmarks`
- Each bookmark has: `id`, `property`, `bookmarkedAt`, `displayName`, `notes`, `tags`

**Proposed Backend Endpoints:**

### Get Bookmarks
```
GET /api/bookmarks
Headers: Authorization: Bearer <token>
Response: {
  "bookmarks": [
    {
      "id": "bm_123",
      "property": {
        "address": "123 Main St",
        "city": "Austin",
        "price": 350000,
        ...
      },
      "display_name": "123 Main St, Austin",
      "bookmarked_at": "2024-11-27T20:00:00Z",
      "notes": "Great location",
      "tags": ["potential", "under-review"]
    }
  ]
}
```

### Add Bookmark
```
POST /api/bookmarks
Headers: Authorization: Bearer <token>
Body: {
  "property": {...},
  "notes": "Optional notes",
  "tags": ["tag1", "tag2"]
}
Response: {
  "bookmark": {...},
  "success": true
}
```

### Update Bookmark
```
PATCH /api/bookmarks/{bookmark_id}
Headers: Authorization: Bearer <token>
Body: {
  "notes": "Updated notes",
  "tags": ["updated", "tags"]
}
Response: {
  "bookmark": {...},
  "success": true
}
```

### Delete Bookmark
```
DELETE /api/bookmarks/{bookmark_id}
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "message": "Bookmark deleted"
}
```

**Database Schema:**
```sql
CREATE TABLE bookmarks (
  bookmark_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  property_data JSONB NOT NULL,  -- Store full property object
  display_name VARCHAR(500),
  notes TEXT,
  tags TEXT[],  -- Array of tags
  bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_bookmarked_at ON bookmarks(bookmarked_at DESC);
CREATE INDEX idx_bookmarks_tags ON bookmarks USING GIN(tags);
```

**Priority:** 🟢 **LOW** - Enhancement, not critical. localStorage works for now.

---

## Implementation Priority

### 🔴 Phase 1: Critical (Required for MVP)
1. **Authentication API** - Sign-in/Sign-up pages won't work without this
   - `POST /api/auth/signin`
   - `POST /api/auth/signup`
   - `GET /api/auth/me`
   - `POST /api/auth/signout`

2. **Stream API** - Core chat functionality
   - Already documented in `BACKEND_STREAM_IMPLEMENTATION.md`

### 🟡 Phase 2: Important (Better UX)
3. **Password Recovery**
   - `POST /api/auth/forgot-password`
   - `POST /api/auth/reset-password`

4. **Onboarding API**
   - Already documented in `BACKEND_ONBOARDING_API.md`

### 🟢 Phase 3: Enhancements (Nice to Have)
5. **Google OAuth**
   - `GET /api/auth/google`
   - `GET /api/auth/google/callback`

6. **Chat History Sync** (Optional)
   - Backend storage for chat history
   - Search across all chats

7. **Bookmarks Sync** (Optional)
   - Backend storage for bookmarks
   - Sync across devices

---

## Quick Start Checklist

### For Authentication (Phase 1):
- [ ] Create users table with email, password_hash, name, etc.
- [ ] Implement password hashing (bcrypt)
- [ ] Implement JWT token generation and validation
- [ ] Create `POST /api/auth/signin` endpoint
- [ ] Create `POST /api/auth/signup` endpoint
- [ ] Create `GET /api/auth/me` endpoint
- [ ] Create `POST /api/auth/signout` endpoint
- [ ] Add CORS headers for frontend origin
- [ ] Add rate limiting for auth endpoints
- [ ] Test with frontend sign-in/sign-up pages

### For Stream API:
- [ ] See `BACKEND_STREAM_IMPLEMENTATION.md` for complete checklist

### For Onboarding:
- [ ] See `BACKEND_ONBOARDING_API.md` for complete checklist

---

## Testing

### Test Authentication Flow
1. Sign up with new email
2. Sign in with credentials
3. Get current user (verify token)
4. Sign out
5. Try to get current user (should fail)

### Test Frontend Integration
1. Start frontend: `npm run dev`
2. Navigate to sign-in page
3. Try signing in (should call backend)
4. Check browser network tab for API calls
5. Verify token is stored in localStorage/sessionStorage

---

## Notes

- All endpoints should support both `X-API-Key` header (for API key auth) and `Authorization: Bearer <token>` (for user auth)
- Error responses should be consistent: `{ "error": "...", "message": "..." }`
- All timestamps should be ISO 8601 format (e.g., `2024-11-27T20:00:00Z`)
- Consider implementing request logging for debugging
- Use environment variables for sensitive config (JWT secret, database URL, etc.)
