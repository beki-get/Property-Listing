
# Property Listing Platform

A full-stack property listing platform built for property management. Buyers can browse, save, and inquire about properties. Owners can list and manage properties. Admins moderate the platform.

## Live URLs
- Frontend: https://property-listing-frontend-git-main-berekets-projects-3abd8483.vercel.app
- Backend API: https://property-listing-32ih.onrender.com/api

## Project Structure

```
property-platform/
├── backend/          # Node.js REST API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── zodValidation/
│   │   ├── error/
│   │   ├── utils/
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── .env.example
└── frontend/         # Next.js 14 App
    ├── app/
    ├── components/
    ├── store/
    ├── lib/
    └── .env.example
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL + Prisma | Database and ORM |
| Supabase | Hosted PostgreSQL |
| JWT | Authentication |
| Zod | Request validation |
| bcrypt | Password hashing |
| Render | Deployment |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 | React framework with SSR |
| Zustand | Global state management |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Vercel | Deployment |

---

## Technical Decisions

Node.js is non-blocking and event-driven well suited for a REST API that handles concurrent requests from multiple users browsing listings at the same time. Express is lightweight and gives full control over the request/response cycle without unnecessary abstractions. It also has a large ecosystem which made integrating JWT, Zod, and Prisma straightforward.

Property listings have clear relational structure users own properties, properties receive inquiries, users save favorites. PostgreSQL handles these relationships well with foreign keys and joins. It also has strong support for array types which fit the `images` field naturally.

Prisma gives type-safe database queries and handles migrations cleanly. Writing raw SQL for every query would be error-prone. Prisma's schema file serves as a single source of truth for the database structure and makes it easy to evolve the schema over time with migration history.

Next.js supports both server-side rendering and client-side rendering in the same project. The public property listing page is server-rendered for fast initial load and SEO — search engines can index the properties. Dashboards and interactive pages are client-rendered. This hybrid approach was the right fit for a platform where some pages need to be public and fast, and others need real-time interactivity.

Zustand is minimal — no boilerplate, no context providers, no reducers. It handles two specific needs: persisting authentication across page refreshes and syncing favorites across browser tabs via BroadcastChannel.

Property images are stored as URLs in PostgreSQL rather than binary data in the database. Cloudinary handles image hosting, CDN delivery, and optimization separately from the application. Storing images directly in the database would increase storage costs, slow down queries, and make backups unnecessarily large. Cloudinary gives a dedicated URL per image that can be stored as a simple string — keeping the database lean and the API responses fast

## Features

**Buyers**
- Browse published property listings with search and price filters
- View property details with image gallery
- Save properties to favorites (synced across browser tabs)
- Send inquiries directly to property owners
- View sent inquiry history

**Owners**
- Create property listings (saved as draft)
- Add images via URL
- Publish, archive, or delete listings
- View all received inquiries per listing

**Admin**
- View all properties regardless of status
- Disable listings that violate platform policy
- View and delete user accounts

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or Supabase account

### Backend

```bash
cd backend
cp .env.example 
npm install
npx prisma migrate dev
npm run dev
```

Required environment variables:
```
NODE_ENV=development||production
PORT=8000
DATABASE_URL=postgresql://user:yourpassword@localhost:5432/database-name
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Required environment variables:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Documentation

Full Postman collection is included in the repository root — `property.postman_collection.json`.

Base URL: `https://property-listing-32ih.onrender.com/api`

Key endpoints:
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PATCH  /api/properties/:id/publish
GET    /api/properties/my-properties
GET    /api/properties/admin/all
POST   /api/inquiries/:propertyId
GET    /api/favorites
POST   /api/favorites/:propertyId
```

## User Roles

| Role | Access |
|---|---|
| `user` | Browse, save favorites, send inquiries |
| `owner` | All user access + create and manage listings, view inbox |
| `admin` | Full platform access — manage all properties and users |

The admin account is created by directly updating the role field in the database.

## Deployment

**Backend** — deployed on Render . Connected to Supabase PostgreSQL.

**Frontend** — deployed on Vercel. Root directory set to `frontend/` inside the monorepo.

**Database** — Supabase (hosted PostgreSQL). Prisma migrations run against the Supabase connection string before deployment.
