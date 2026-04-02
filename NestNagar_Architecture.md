

**PRODUCT ARCHITECTURE DOCUMENT**

**NestNagar — Rent & PG Finder for Itanagar**

Full-Stack Web Application | MERN Stack

Version 1.0  |  Confidential

# **1\. Executive Summary**

NestNagar is a mobile-first web application built for Itanagar and the surrounding Arunachal Pradesh region. It connects students and working professionals (Seekers) who need accommodation with verified property Owners and Brokers — replacing the fragmented, broker-dominated Facebook group ecosystem with a structured, AI-enhanced platform.

Two core services:

* Rent PG / Room — browse and contact listings for PGs, single rooms, and full flats

* Rent Partner — find a compatible roommate to split rent with

The primary differentiator is an AI-powered onboarding and recommendation engine that personalises the home feed from the moment a Seeker registers, based on their situation, budget, and locality preference within Itanagar.

# **2\. Problem Statement**

| Problem Area | Current Reality in Itanagar |
| :---- | :---- |
| **Discovery** | Listings are scattered across Facebook groups; no structured search or filter |
| **Trust** | No verification of brokers or owners; fraud and ghost listings are common |
| **Communication** | Negotiation happens in public comment threads or via WhatsApp with no record |
| **Roommate finding** | No structured way to find a compatible rent partner; relies on personal networks |
| **Mobile experience** | No dedicated mobile-first app serving this specific geography |

# **3\. User Types & Roles**

### **3.1 Seeker**

* Students arriving in Itanagar for colleges and coaching centres

* Working professionals relocating for government or private sector jobs

* Can use both services: find a room/PG and/or find a rent partner

* Primary goal: find verified accommodation quickly within budget

### **3.2 Broker**

* Registered agents managing multiple properties on behalf of absent owners

* Requires identity verification before listings go live

* Needs a dashboard to manage multiple listings and chat threads

* Revenue model opportunity: premium placement, lead priority

### **3.3 Owner**

* Direct property owner — no intermediary involved

* Listed with a 'Direct Owner' badge (strong trust signal for seekers)

* Simpler posting UI — not expected to be technically sophisticated

* Can manage a single or handful of properties

# **4\. System Architecture**

## **4.1 Architecture Overview**

NestNagar uses a classic MERN (MongoDB, Express.js, React, Node.js) stack with additional layers for real-time communication and AI integration. The system is designed to be deployed on a single cloud provider (Render or Railway for backend, Vercel for frontend) to minimise infrastructure cost during the MVP phase.

| Architecture Pattern Client-Server with REST API \+ WebSocket layer. The React frontend communicates with the Node/Express backend via REST for data operations and via Socket.io for real-time chat. The Anthropic API is called server-side only — never exposed to the client. |
| :---- |

## **4.2 Tech Stack**

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| **Frontend** | React 18 \+ Vite | Mobile-first UI, SPA routing |
| **State management** | Redux Toolkit | Global state: auth, chat, feed |
| **Styling** | Tailwind CSS | Utility-first mobile-first design |
| **Backend** | Node.js \+ Express.js | REST API, middleware, business logic |
| **Database** | MongoDB \+ Mongoose | Document storage for listings, users, chats |
| **Real-time** | Socket.io | Bidirectional chat between Seeker and Owner/Broker |
| **AI / NLP** | Anthropic Claude API | Onboarding classification, listing personalisation |
| **Auth** | JWT \+ bcrypt | Stateless auth, password hashing |
| **OTP** | Twilio / MSG91 | Phone number verification on registration |
| **Image storage** | Cloudinary | Property photos, profile pictures |
| **Maps** | Leaflet.js \+ OpenStreetMap | Locality map view for listings (free tier) |
| **Frontend deploy** | Vercel | Global CDN, instant deploys |
| **Backend deploy** | Render / Railway | Containerised Node.js hosting |

# **5\. Database Schema**

All collections stored in MongoDB. Relationships use ObjectId references (not embedded documents) to allow independent querying.

### **5.1 User Collection**

| Field | Type | Notes |
| :---- | :---- | :---- |
| **\_id** | ObjectId | Auto-generated primary key |
| **name** | String | Full name |
| **phone** | String | Unique — used for login \+ OTP verification |
| **passwordHash** | String | bcrypt hashed, never returned in API responses |
| **role** | Enum | 'seeker' | 'broker' | 'owner' |
| **isVerified** | Boolean | Phone OTP confirmed |
| **identityDoc** | String | Cloudinary URL — for broker verification (Aadhaar etc.) |
| **brokerApproved** | Boolean | Admin-approved flag for brokers |
| **profilePhoto** | String | Cloudinary URL |
| **seekerProfile** | Object | Embedded — only for role: seeker (see 5.1a) |
| **createdAt** | Date | Timestamp |

| 5.1a seekerProfile (embedded sub-document) purpose: 'student' | 'working'budget: { min: Number, max: Number }locality: String (e.g. 'Naharlagun', 'Ganga Market')moveInDate: DatealonOrPartner: 'alone' | 'partner'genderPreference: 'any' | 'male' | 'female' |
| :---- |

### **5.2 Listing Collection**

| Field | Type | Notes |
| :---- | :---- | :---- |
| **\_id** | ObjectId | Auto-generated |
| **postedBy** | ObjectId | Ref: User (broker or owner) |
| **posterRole** | Enum | 'broker' | 'owner' — shown as badge on frontend |
| **type** | Enum | 'pg' | 'single-room' | 'flat' |
| **title** | String | Short headline for the listing |
| **description** | String | Free text — what the poster writes |
| **price** | Number | Monthly rent in INR |
| **deposit** | Number | Security deposit amount |
| **locality** | String | Area within Itanagar |
| **coordinates** | Object | { lat, lng } — for map view |
| **amenities** | \[String\] | e.g. \['WiFi', 'AC', 'Attached bath', 'Geyser'\] |
| **genderAllowed** | Enum | 'any' | 'male' | 'female' |
| **photos** | \[String\] | Cloudinary URLs — minimum 1, max 8 |
| **status** | Enum | 'available' | 'filled' | 'paused' |
| **views** | Number | Incremented on each detail page load |
| **createdAt** | Date | Timestamp |

### **5.3 PartnerCard Collection**

| Field | Type | Notes |
| :---- | :---- | :---- |
| **\_id** | ObjectId | Auto-generated |
| **postedBy** | ObjectId | Ref: User (a seeker) |
| **purpose** | String | 'student' | 'working' |
| **budget** | Number | Max they can pay per month |
| **preferredLocality** | String | Area preference |
| **moveInDate** | Date | When they need to move |
| **genderPreference** | Enum | 'any' | 'male' | 'female' |
| **habits** | \[String\] | e.g. \['Non-smoker', 'Early riser', 'Vegetarian'\] |
| **bio** | String | Short description about themselves |
| **status** | Enum | 'active' | 'matched' | 'closed' |
| **createdAt** | Date | Timestamp |

### **5.4 Conversation Collection**

| Field | Type | Notes |
| :---- | :---- | :---- |
| **\_id** | ObjectId | Auto-generated |
| **participants** | \[ObjectId\] | Exactly 2 users |
| **contextType** | Enum | 'listing' | 'partnerCard' |
| **contextId** | ObjectId | Ref: Listing or PartnerCard that started the chat |
| **lastMessage** | Object | { text, senderId, timestamp } — for inbox preview |
| **createdAt** | Date | Timestamp |

### **5.5 Message Collection**

| Field | Type | Notes |
| :---- | :---- | :---- |
| **\_id** | ObjectId | Auto-generated |
| **conversationId** | ObjectId | Ref: Conversation |
| **senderId** | ObjectId | Ref: User |
| **text** | String | Message content |
| **readBy** | \[ObjectId\] | List of userIds who have read the message |
| **createdAt** | Date | Timestamp — used for ordering |

# **6\. REST API Design**

Base URL: /api/v1. All protected routes require Authorization: Bearer \<JWT\> header.

### **6.1 Auth Routes**

| Method | Endpoint | Access | Description |
| :---- | :---- | :---- | :---- |
| **POST** | /auth/send-otp | Public | Send OTP to phone number |
| **POST** | /auth/verify-otp | Public | Verify OTP, return temp token |
| **POST** | /auth/register | Temp token | Complete registration with role \+ seeker profile |
| **POST** | /auth/login | Public | Login with phone \+ password, return JWT |
| **GET** | /auth/me | Protected | Return logged-in user object |

### **6.2 Listing Routes**

| Method | Endpoint | Access | Description |
| :---- | :---- | :---- | :---- |
| **GET** | /listings | Public | Browse all listings with filters |
| **GET** | /listings/personalised | Seeker JWT | AI-ranked feed based on seeker profile |
| **GET** | /listings/:id | Public | Single listing detail \+ increment views |
| **POST** | /listings | Broker/Owner JWT | Create a new listing (with photo upload) |
| **PATCH** | /listings/:id | Owner of listing | Update listing details or status |
| **DELETE** | /listings/:id | Owner of listing | Remove listing |

### **6.3 Partner Card Routes**

| Method | Endpoint | Access | Description |
| :---- | :---- | :---- | :---- |
| **GET** | /partners | Seeker JWT | Browse partner wanted cards with filters |
| **POST** | /partners | Seeker JWT | Post a new partner wanted card |
| **PATCH** | /partners/:id | Card owner | Update card details or status |
| **DELETE** | /partners/:id | Card owner | Remove card |

### **6.4 Chat Routes**

| Method | Endpoint | Access | Description |
| :---- | :---- | :---- | :---- |
| **POST** | /conversations | Protected JWT | Start a conversation linked to a listing or card |
| **GET** | /conversations | Protected JWT | Get all conversations for logged-in user |
| **GET** | /conversations/:id/messages | Participant | Fetch message history (paginated) |
| **PATCH** | /conversations/:id/read | Participant | Mark messages as read |

# **7\. Real-Time Chat Architecture (Socket.io)**

Chat is handled via Socket.io running on the same Node.js server. Each user joins a room named after their userId on connection. Messages are persisted to MongoDB on every send event — Socket.io is only the delivery layer.

### **7.1 Socket Events**

| Event Name | Direction | Payload & Behaviour |
| :---- | :---- | :---- |
| **connection** | Client → Server | Authenticates JWT from handshake query, joins user's private room |
| **join-conversation** | Client → Server | Client joins conversation room by conversationId |
| **send-message** | Client → Server | { conversationId, text } — saved to DB, emitted to room |
| **new-message** | Server → Client | { message } — emitted to all participants in the room |
| **typing** | Client → Server | { conversationId } — rebroadcast to other participant |
| **stop-typing** | Client → Server | { conversationId } — rebroadcast to other participant |
| **disconnect** | Server event | User removed from rooms, online status updated |

| Chat Access Control A conversation can only be started from a listing detail page or partner card page. The backend validates that the initiating user is a Seeker, and the target is the listing/card owner. This prevents unsolicited messages and keeps every chat thread tied to a specific property context. |
| :---- |

# **8\. AI Integration — Anthropic API**

## **8.1 Seeker Onboarding Flow**

During registration, a Seeker answers 5 quick questions in a guided step UI. These answers are collected on the frontend and sent to the backend endpoint POST /auth/register. The backend then calls the Anthropic API server-side, passing the answers as context.

### **8.2 AI System Prompt (server-side)**

| System Prompt Sent to Claude API You are a housing assistant for Itanagar, Arunachal Pradesh, India.A user has just answered these onboarding questions:- Purpose: {purpose} (student or working professional)- Budget: Rs. {budget} per month- Preferred locality: {locality}- Move-in date: {moveInDate}- Looking: {aloneOrPartner}Return ONLY a valid JSON object with no explanation:{  "listingTypes": \["pg"|"single-room"|"flat"\],  "priceRange": { "min": number, "max": number },  "showPartnerOption": boolean,  "priorityLocalities": \[string\],  "feedMessage": string (one personalised sentence for the home screen)} |
| :---- |

The JSON response from Claude is parsed and stored in the user's seekerProfile. Every time the seeker loads the home feed, GET /listings/personalised uses these stored preferences to query MongoDB with the right filters and sort order — no repeated AI calls needed after registration.

## **8.3 Future AI Features (v2)**

* Auto-generate listing description from broker's photo \+ bullet points

* Flag suspicious listings that may be fraudulent based on price anomaly

* Partner compatibility scoring between two seeker profiles

# **9\. Frontend Architecture**

## **9.1 Project Structure**

| React App Folder Structure src/  components/       \# Shared UI (ListingCard, ChatBubble, Avatar, Badge)  pages/            \# Route-level components    Home.jsx         \# Personalised feed for seekers    ListingDetail.jsx    PartnerFeed.jsx    ChatInbox.jsx    ChatRoom.jsx    PostListing.jsx  \# Broker/Owner    Dashboard.jsx    \# Broker/Owner listing manager    Onboarding.jsx   \# AI-powered step flow    Register.jsx / Login.jsx  store/            \# Redux slices    authSlice.js    listingsSlice.js    chatSlice.js  hooks/            \# Custom hooks    useSocket.js    useListings.js  services/         \# Axios API service layer    api.js          \# Axios instance with JWT interceptor    listingService.js    chatService.js  utils/            \# formatPrice, timeAgo, etc.  App.jsx           \# Routes (React Router v6)  main.jsx |
| :---- |

## **9.2 Key Pages & Components**

| Page / Component | Responsibility |
| :---- | :---- |
| **Onboarding.jsx** | 5-step guided form. Collects seeker situation. On submit calls POST /auth/register and navigates to Home. |
| **Home.jsx** | Shows personalised listing feed pulled from /listings/personalised. Renders the AI feedMessage as a welcome banner. |
| **ListingCard.jsx** | Reusable card with photo, price, locality badge, poster type badge (Direct Owner / Broker), and contact button. |
| **ListingDetail.jsx** | Full listing view with photo gallery, amenities chips, and a 'Start Chat' button that creates a conversation. |
| **ChatInbox.jsx** | List of all active conversations. Shows last message preview and unread dot. Feeds from Redux chatSlice. |
| **ChatRoom.jsx** | Real-time message thread. Uses useSocket hook to subscribe to new-message events. Shows typing indicator. |
| **PostListing.jsx** | Multi-step form for brokers/owners. Handles Cloudinary image upload before form submit. |
| **Dashboard.jsx** | Broker/Owner view of their own listings. Shows view count, active chats, and mark-as-filled toggle. |

# **10\. Security Considerations**

| Concern | Mitigation |
| :---- | :---- |
| **Authentication** | JWT tokens with 7-day expiry. Refresh token stored in httpOnly cookie. |
| **Authorisation** | Middleware checks role and ownership before every mutation (PATCH/DELETE). |
| **Phone verification** | OTP expires in 5 minutes. Max 3 attempts before lockout. |
| **Broker fraud** | brokerApproved flag defaults to false. Listings only go live after admin approves identity doc. |
| **Anthropic API key** | Stored in server .env. Never exposed to client. Called only from backend. |
| **Image upload** | All uploads go through Cloudinary signed URLs. Direct client upload to Cloudinary (no file stored on server). |
| **Rate limiting** | express-rate-limit on /auth routes (10 req/15 min) and /listings POST (20 req/hour). |
| **Input sanitisation** | express-validator on all POST/PATCH routes. Mongoose schema type enforcement. |

# **11\. MVP Scope & Build Order**

Build in strict priority order. Do not move to the next phase until the current one is working end-to-end.

| Phase | Feature | Scope |
| :---- | :---- | :---- |
| **1** | Auth \+ Roles | Register, OTP verify, login, role selection, JWT middleware |
| **2** | AI Onboarding | Seeker 5-step form, Anthropic API integration, seekerProfile stored |
| **3** | Listings CRUD | Post listing with photo upload, browse feed, listing detail page |
| **4** | Personalised Feed | GET /listings/personalised using stored seeker preferences |
| **5** | Real-time Chat | Socket.io setup, ChatInbox, ChatRoom, message persistence |
| **6** | Partner Cards | Post partner card, browse and filter partner cards, chat from card |
| **7** | Broker Dashboard | Listing manager, view counts, mark as filled |
| **\--- V2 \---** | **Map view** | Leaflet.js locality map with listing pins |
| **\--- V2 \---** | **Push notifications** | FCM — new message, new inquiry alerts |
| **\--- V2 \---** | **Promoted listings** | Paid placement for brokers |

# **12\. Environment Variables**

| Backend .env NODE\_ENV=developmentPORT=5000MONGODB\_URI=mongodb+srv://...JWT\_SECRET=your\_jwt\_secret\_min\_32\_charsJWT\_EXPIRES\_IN=7dANTHROPIC\_API\_KEY=sk-ant-...CLOUDINARY\_CLOUD\_NAME=your\_cloudCLOUDINARY\_API\_KEY=your\_keyCLOUDINARY\_API\_SECRET=your\_secretTWILIO\_ACCOUNT\_SID=ACxxx        \# or MSG91 keyTWILIO\_AUTH\_TOKEN=xxxTWILIO\_PHONE\_NUMBER=+1xxx |
| :---- |

| Frontend .env VITE\_API\_BASE\_URL=http://localhost:5000/api/v1VITE\_SOCKET\_URL=http://localhost:5000VITE\_CLOUDINARY\_UPLOAD\_PRESET=your\_presetVITE\_CLOUDINARY\_CLOUD\_NAME=your\_cloud |
| :---- |

# **13\. Deployment Plan**

| Service | Provider | Notes |
| :---- | :---- | :---- |
| **Frontend (React)** | Vercel | Free tier. Auto-deploy from GitHub main branch. |
| **Backend (Node/Express)** | Render | Free tier (spins down on inactivity — upgrade for prod). |
| **Database** | MongoDB Atlas | Free M0 cluster. Sufficient for MVP. |
| **Image storage** | Cloudinary | Free tier: 25 GB. Sufficient for MVP. |
| **Domain** | Namecheap / GoDaddy | Register nestnagar.in or similar for Rs. 600-900/year. |
| **SSL** | Automatic | Vercel and Render both provision SSL automatically. |

NestNagar — Architecture Document v1.0  |  Prepared for internal use