# MAISON NOIR — Luxury Fashion & AI Stylist Platform

The repository is organized into clean `frontend/` and `backend/` directories.

```
Maison Noir/
├── frontend/              # React + TypeScript (Vite, Tailwind, TanStack Router, Framer Motion)
└── backend/               # Node.js + Express + MongoDB (Mongoose, TypeScript, JWT, Zod)
```

---

## Quick Start Guide

### 1. Backend Setup & Server (Node.js + Express + MongoDB)

Navigate to the backend directory:
```bash
cd backend
npm install
npm run seed
npm run dev
```

API Health check: `http://localhost:5001/api/health`

### 2. Frontend Setup (React + TypeScript)

In a separate terminal, navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

Frontend Application: `http://localhost:8080`

---

## Google OAuth 2.0 Configuration Guide

### 1. Google Cloud Console Setup

To connect production-grade Google Authentication to Maison Noir:

1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click **+ Create Credentials** ➔ **OAuth client ID**.
3. Select Application type: **Web application**.
4. Set **Name**: `Maison Noir Web App`.
5. Add **Authorized JavaScript origins**:
   - **Local Development:**
     - `http://localhost:8080`
     - `http://localhost:5173`
   - **Production:**
     - `https://YOUR-DOMAIN.com` *(Replace with your actual production domain)*
6. Add **Authorized redirect URIs**:
   - `http://localhost:8080`
   - `http://localhost:5173`
   - `https://YOUR-DOMAIN.com`
7. Click **Create** and copy your **Client ID** (e.g., `123456789-abc.apps.googleusercontent.com`).

---

### 2. Environment Variables Configuration

Place your Google Client ID into the environment files:

#### Backend (`backend/.env`):
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/maison_noir
JWT_SECRET=maison_noir_super_secret_jwt_key_2026_luxury_brand
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8080
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## MongoDB Schema & Account Linking Architecture

### User Document Schema (`maison_noir.users`)
```json
{
  "_id": "6a75f05144daef8083317d54",
  "firstName": "Elena",
  "lastName": "Vance",
  "email": "elena.vance@maisonnoir.com",
  "authProvider": "google",
  "googleId": "109823749238472938471",
  "emailVerified": true,
  "avatar": "https://lh3.googleusercontent.com/a/...",
  "role": "user",
  "addresses": [],
  "createdAt": "2026-08-07T14:48:49.914Z",
  "updatedAt": "2026-08-07T14:48:49.914Z"
}
```

### Account Linking Logic
If a user registers an account via local email/password (`elena@maisonnoir.com`) and later authenticates with Google using the same verified email address, the backend automatically links the accounts:
- Updates `googleId = googleSub`
- Sets `authProvider = "both"`
- Sets `emailVerified = true`
- Preserves the original `_id` so that all cart items, saved wishlist items, order history, and addresses remain seamlessly linked to the single user record.
