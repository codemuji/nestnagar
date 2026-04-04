# 🏠 NestNagar: Find Your Sanctuary

NestNagar is a modern, AI-powered housing platform specifically designed for the community in **Itanagar & Naharlagun, Arunachal Pradesh**. It bridges the gap between home seekers (students and professionals) and property owners/brokers through a curated, aesthetic, and personalized experience.

---

## ✨ Key Features

### 🎯 AI-Powered Personalization
- **Smart Onboarding**: A 5-step conversational flow that understands your needs (budget, locality, lifestyle).
- **Curated Feed**: Uses **Mistral AI** to categorize listings and generate a personalized "sanctuary" feed tailored to each seeker's preferences.

### 💬 Real-Time Communication
- **Instant Chat**: Seamless Socket.io-based messaging between seekers and posters.
- **Contextual Conversations**: Start chats directly from a listing to keep discussions organized.

### 🏢 Property Management
- **Role-Based Dashboards**: Distinct experiences for **Seekers**, **Owners**, and **Brokers**.
- **Visual Listings**: High-quality image uploads powered by **Cloudinary**.
- **Verified Listings**: Trust-focused platform for the local Itanagar market.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: For a blazing-fast, modern UI.
- **Tailwind CSS**: Custom "Heritage" design system with a premium aesthetic.
- **Redux Toolkit**: Centralized state management for auth and user data.
- **Lucide React**: Beautiful, consistent iconography.

### Backend
- **Node.js & Express**: Robust REST API architecture.
- **MongoDB & Mongoose**: Flexible NoSQL data modeling.
- **Socket.io**: Real-time bi-directional communication.
- **Mistral AI (via LangChain)**: Intelligent seeker profiling and categorization.
- **Cloudinary**: Cloud-based image storage and optimization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account
- Mistral AI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nestnagar
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the Environment Variables section below
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file
   npm run dev
   ```

---

## 🔑 Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_random_secret
JWT_EXPIRES_IN=30d
MISTRAL_API_KEY=your_mistral_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🌐 Deployment

### Backend (Render)
1. Build Command: `npm install`
2. Start Command: `npm start`
3. Root Directory: `backend`

### Frontend (Vercel)
1. Framework Preset: `Vite`
2. Root Directory: `frontend`
3. Ensure Environment Variables are added in the Vercel dashboard.

---

## 📂 Project Structure

```text
nestnagar/
├── backend/            # Express API & Socket.io
│   ├── src/
│   │   ├── controllers/# Business logic
│   │   ├── models/     # Database schemas
│   │   ├── routes/     # API endpoints
│   │   └── sockets/    # Real-time handlers
├── frontend/           # React Application
│   ├── src/
│   │   ├── features/   # Modularized feature folders
│   │   ├── components/ # Reusable UI components
│   │   └── store/      # Redux configuration
└── README.md
```

---

## 📜 License
ISC License. Built with ❤️ for Itanagar.
