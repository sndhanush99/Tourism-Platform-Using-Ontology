<<<<<<< HEAD
# Tourism-Platform-Using-Ontology
AI-Driven Rural Tourism Platform Using  Ontology-Based Recommendation and  Conversational Travel Assistant
=======
# Village State 🏡
**Rural Tourism Ecosystem — Authentic India, Direct from Villagers**

---

## Quick Start (5 minutes)

### Step 1 — Get Free API Keys

| Service | Free Tier | Link |
|---------|-----------|------|
| MongoDB Atlas | 512MB free forever | https://cloud.mongodb.com |
| Stripe | Free test mode | https://dashboard.stripe.com |
| Hugging Face | Free inference API | https://huggingface.co/settings/tokens |
| Google Maps | $200/month free credit | https://console.cloud.google.com |

> The app works WITHOUT Google Maps and WITHOUT Hugging Face — the chatbot has a smart rule-based fallback built in!

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
```

### Step 3 — Seed Sample Data

```bash
cd backend
node seed.js
```

This creates 3 sample villages + test accounts:
- **Admin:** admin@villagestate.in / admin123
- **Host:** rajan@example.com / host123
- **Tourist:** tourist@example.com / tourist123

### Step 4 — Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your keys
npm start
```

Open http://localhost:3000

---

## Project Structure

```
village-state/
├── backend/
│   ├── models/           User, Village, Booking, Product
│   ├── routes/           auth, villages, bookings, payments, chatbot, marketplace, routeFinder, admin
│   ├── middleware/        auth.js (JWT + role guards)
│   ├── seed.js           Sample data
│   └── server.js         Express entry point
├── frontend/src/
│   ├── pages/
│   │   ├── auth/         Login, Register
│   │   ├── tourist/      VillageList, VillageDetail, BookingPage, MyBookings, Marketplace, RouteFinder
│   │   ├── host/         HostDashboard, HostVillages, AddVillage, HostBookings, HostMarketplace
│   │   └── admin/        AdminDashboard, AdminVillages
│   ├── components/       Navbar, Chatbot
│   ├── store/            authStore (Zustand)
│   └── api/              axios.js
└── .vscode/              extensions + launch config
```

---

## Features

### For Tourists
- Browse and search verified villages across India
- Filter by state, activities, budget
- Book stays with Stripe payment
- AI chatbot (rule-based + optional Hugging Face AI)
- Safe route finder
- Marketplace for authentic products

### For Hosts
- Register village with photos, stay options, activities
- Admin verification workflow
- Manage bookings (confirm/decline)
- Sell products/services in marketplace
- Earnings dashboard

### For Admins
- Review and approve village applications
- Platform revenue stats
- Booking management

---

## Chatbot — Zero API Key Required!

The chatbot has **two modes**:

1. **Rule-based** (default, no key needed): Smart keyword matching for 15+ topic categories — villages by state, booking help, safety tips, food, festivals, pricing, cancellation policy, etc.

2. **AI mode** (optional): Set `HUGGINGFACE_API_KEY` in `.env` to enable Mistral-7B AI responses. Free at https://huggingface.co/settings/tokens

---

## API Endpoints

```
POST /api/auth/register      Register tourist or host
POST /api/auth/login         Login
GET  /api/auth/me            Current user

GET  /api/villages           List verified villages (filters: state, search, lat, lng)
GET  /api/villages/:id       Village detail
POST /api/villages           Create village (host)
GET  /api/villages/host/my   Host's own villages

POST /api/bookings           Create booking
GET  /api/bookings/my        Tourist bookings
GET  /api/bookings/host      Host incoming bookings
PUT  /api/bookings/:id/status  Confirm/decline (host)

POST /api/payments/create-intent   Stripe PaymentIntent
POST /api/payments/confirm         Confirm payment

POST /api/chatbot/message    Chat with assistant

POST /api/route-finder/route  Find safe routes (Google Maps)

GET  /api/marketplace        List products/services
POST /api/marketplace        Add product (host)

GET  /api/admin/dashboard    Stats
GET  /api/admin/villages/pending  Pending applications
PUT  /api/admin/villages/:id/verify  Approve/reject
```
>>>>>>> 4dbbdd0 (Initial commit)
