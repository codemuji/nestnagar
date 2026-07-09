# NestNagar — Development Checkpoint

**Date:** 2026-07-03
**Status:** In progress — multiple UI/UX bugs fixed, chat module stability improved, AI fallback hardened.

---

## 1. Homepage Feed Layout

### Before
- Custom `@tanstack/react-virtual` virtualizer with absolute-positioned rows inside a fixed-height `h-[calc(100vh-400px)]` scroll container.
- Estimated row height was `380px`, but `ListingCard` uses `aspect-[4/3]` so real height varies — caused **visual overlap** between cards.
- Fixed container height meant the **last card "stuck"** on the bottom edge with no breathing room.
- A big **"Join NestNagar Partner Program" Bento Promotion** card sat at the bottom — felt noisy.

### After
- **Virtualizer removed**, replaced with a plain CSS grid: `grid grid-cols-2 gap-3`.
- Page scrolls naturally instead of a sub-container.
- `ListingCard` rebuilt as a **compact card**:
  - `aspect-square` image
  - Whole card is a `<Link>` → tap to open detail.
  - Price + type on first row; title + locality underneath.
  - Removed: amenities row, View Details / Chat Now buttons, Broker badge.
  - Kept: heart (save), Owner shield.
- Added 6 skeleton tiles (`ListingCardSkeleton` with `compact` prop).
- Bento Promotion card **removed**.

### Files touched
- `frontend/src/features/listings/pages/Home.jsx`
- `frontend/src/features/listings/components/ListingCard.jsx`
- `frontend/src/features/listings/components/ListingCardSkeleton.jsx`

---

## 2. Chat Module Bugs

### Bug A — Duplicate messages on send
**Symptom:** Hitting Send appended the same message twice. Navigating away and re-entering the chat showed only one.

**Root cause:** Server `io.to(conversationId).emit('new-message', newMessage)` broadcasted **back to the sender's own socket**, while the client optimistically added the message. The client dedup `m.tempId === message._id` failed because the server's `_id` was a fresh DB ObjectId, not the client's `tempId`.

**Fix:**
- `backend/src/sockets/chatHandler.js` — payload now carries `tempId` and is sent via:
  - `io.to(socket.id).emit(...)` — echoes to sender only.
  - `socket.to(conversationId).emit(...)` — broadcasts to other participants (excludes sender).
- `frontend/src/features/chat/pages/ChatRoom.jsx` — `handleNewMessage` reconciles via `tempId`: replaces optimistic, otherwise skips if `_id` already present, otherwise appends. Cleanup uses the named handler reference so listeners are properly removed.

### Bug B — Chat starts from the top on entry
**Symptom:** Opening a conversation showed the earliest messages; user had to scroll to bottom.

**Root cause:** `useEffect` called `messagesEndRef.current?.scrollIntoView(...)` after `setMessages(msgs)`, but `messagesEndRef` was attached to a deeply-nested div inside a scrollable `<main>`. Timing race on first paint caused the ref to be `null` during the first effect run, so scroll never happened.

**Fix:**
- Added `messagesContainerRef` directly on the scrollable `<main>` element.
- Replaced `scrollIntoView` with `el.scrollTop = el.scrollHeight` for reliable behavior on initial load and every subsequent update.

### Files touched
- `backend/src/sockets/chatHandler.js`
- `frontend/src/features/chat/pages/ChatRoom.jsx`

---

## 3. Mistral AI — Seeker Profile Generation

### Bug
**Symptom:** `Mistral SDKError: 401 Unauthorized` surfaced in logs when updating preferences after account creation. Render backend logs were noisy even though profile update appeared to succeed.

**Root cause:**
1. `modelName: "mistral-tiny"` is **not a valid Mistral model name** — Mistral's API rejects unknown models with 401.
2. There was no guard for a missing or invalid `MISTRAL_API_KEY`. The SDK error propagated, the catch block returned a fallback, but only after a full stack-trace log.

### Fix — `backend/src/services/ai.service.js`
- Switched `modelName` → **`mistral-small-latest`** (valid, cost-effective).
- Added guard: chain is only built if `MISTRAL_API_KEY` exists. Missing key → `console.warn` + immediate fallback profile.
- Reusable `FALLBACK_PROFILE(answers)` factory now used in both initial-build and catch paths.
- Tightened catch log to `error?.message` to reduce noise.

### Render env checklist
- [ ] Confirm `MISTRAL_API_KEY` is set in Render dashboard → backend service → Environment.
- [ ] Trigger a manual deploy to pick up the updated `ai.service.js`.
- [ ] Optional: verify the Mistral key at https://console.mistral.ai.

---

## 4. Production-Readiness Notes (informational)

Items discovered during review, **not yet fixed**:

| Area | Concern |
|------|----------|
| Secrets | `backend/.env` (Mongo URI, JWT secret, Mistral & Cloudinary keys) is in `.gitignore` ✅, but values are still in plain text on disk. Rotate keys if repo was ever pushed publicly. |
| CORS | `CLIENT_URL` defaults to `http://localhost:5173` in `backend/src/index.js`. Must be overridden in production to the deployed frontend URL. |
| Frontend env | `VITE_API_BASE_URL` and `VITE_SOCKET_URL` are referenced but no `.env` file in `frontend/` — set these via Vercel env vars before deploy. |
| Lint | `npm run lint` exists in `frontend/package.json`; backend has no ESLint config. Run before each release. |
| Tests | No test suites present in either package. |

---

## 5. Summary of Files Changed in This Session

```
backend/src/sockets/chatHandler.js              # Fix: dedup-friendly send-message broadcast
backend/src/services/ai.service.js              # Fix: model name + missing-key fallback
frontend/src/features/chat/pages/ChatRoom.jsx   # Fix: dup messages, scroll-to-bottom
frontend/src/features/listings/pages/Home.jsx   # Refactor: 2-col grid, remove virtualizer
frontend/src/features/listings/components/ListingCard.jsx        # Refactor: compact 2-col card
frontend/src/features/listings/components/ListingCardSkeleton.jsx  # Add: compact prop
```

---

## 6. Next Steps (not done yet)

- [ ] Verify `MISTRAL_API_KEY` on Render and redeploy.
- [ ] Run `npm run lint` on frontend, address any warnings.
- [ ] Set up env vars for `VITE_API_BASE_URL` and `VITE_SOCKET_URL` on Vercel.
- [ ] Define and document production URLs (frontend + backend) and update `CLIENT_URL`.
- [ ] Add basic test coverage for chat send/receive and seeker-profile fallback.
- [ ] Consider trimming `dependencies` in `frontend/package.json` (`@vite-pwa/assets-generator`, `dexie`, `embla-carousel-react` if unused).
