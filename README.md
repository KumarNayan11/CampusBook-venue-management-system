<div align="center">

<img src="https://campusbook2026.vercel.app/favicon.ico" width="64" alt="CampusBook Logo" />

# CampusBook
### Campus Venue Booking & Utilization System

*A centralized, conflict-free facility management platform built for educational institutions.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-campusbook2026.vercel.app-4F46E5?style=for-the-badge&logo=vercel&logoColor=white)](https://campusbook2026.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-KumarNayan11-181717?style=for-the-badge&logo=github)](https://github.com/KumarNayan11/CampusBook-venue-management-system)
[![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)](LICENSE)

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## Overview

Educational institutions manage dozens of shared spaces — seminar halls, labs, auditoriums, conference rooms — often through manual processes that result in double-bookings, approval delays, and zero visibility into facility usage.

**CampusBook** solves this with a structured, role-driven web platform that handles the full lifecycle of a venue booking: request → multi-tier approval → confirmation → analytics.

Built on the **MERN stack**, deployed on **Vercel + MongoDB Atlas**, and designed for real institutional workflows.

---

## Screenshots

| Landing Page | Faculty Dashboard |
|---|---|
| ![Landing](https://campusbook2026.vercel.app/og-landing.png) | ![Faculty Dashboard](https://campusbook2026.vercel.app/og-faculty.png) |

| HOD Approval Panel | Analytics Dashboard |
|---|---|
| ![HOD Panel](https://campusbook2026.vercel.app/og-hod.png) | ![Analytics](https://campusbook2026.vercel.app/og-analytics.png) |

> Live screenshots available at the [deployed app](https://campusbook2026.vercel.app/).

---

## Features

### Core Functionality

- **Conflict-Free Booking** — Automated time-slot validation against existing bookings and academic timetables prevents double-reservations
- **Multi-Tier Approval Workflow** — Departmental venues: `Faculty → HOD → DSW → Confirmed`. Central venues: `Faculty → DSW → Confirmed`
- **Role-Based Access Control** — Four distinct roles (Admin, Faculty, HOD, DSW) each with tailored dashboards and permissions
- **Live Analytics Dashboard** — Booking volume trends, venue utilization rates, department-wise breakdowns, and approval resolution stats
- **Notification System** — Real-time status notifications at every stage of the booking lifecycle
- **Timetable Integration** — Academic schedule data automatically blocks venues during active class hours

### User Roles

| Role | Capabilities |
|------|-------------|
| **Faculty** | Browse venues, submit booking requests, view personal booking history and timetable |
| **HOD** | All faculty capabilities + approve/reject departmental booking requests, configure department venues |
| **DSW (Dean)** | Campus-wide oversight, approve central venue bookings, manage all venues, export logs |
| **Admin** | Full system control — manage users, venues, system config, view audit logs, export reports |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, TailwindCSS 4, React Router v7, Recharts, Axios |
| **Backend** | Node.js, Express 4, JWT, bcryptjs, Helmet, express-rate-limit |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Testing** | Jest, Supertest, mongodb-memory-server |
| **Deployment** | Vercel (frontend + serverless backend), MongoDB Atlas |

---

## Project Structure

```
campusbook-venue-management/
├── backend/
│   ├── controllers/        # Route handler logic
│   ├── middleware/         # Auth, role guards, rate limiting
│   ├── models/             # Mongoose schemas (User, Venue, Booking, etc.)
│   ├── routes/             # Express API routes
│   ├── utils/              # Helper functions (token gen, conflict detection)
│   ├── scripts/            # DB utility scripts
│   ├── __tests__/          # Jest test suites
│   ├── seed.js             # Database seeder
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Role-based dashboard pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # API helpers, formatters
│   ├── index.html
│   └── vite.config.js
├── package.json            # Root workspace config
└── vercel.json             # Vercel deployment config
```

---

## Database Collections

The system uses **MongoDB** with 7 collections:

| Collection | Description |
|---|---|
| `users` | All system users with roles and department associations |
| `departments` | Academic departments with assigned HOD references |
| `venues` | Campus facilities with capacity, category, booking hours |
| `bookings` | Booking requests with status, timestamps, and approval chain |
| `timetables` | Academic schedule entries that block venue availability |
| `notifications` | Status update notifications per user |
| `systemconfigs` | System-level settings (e.g. minimum advance booking hours) |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- A MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repository

```bash
git clone https://github.com/KumarNayan11/CampusBook-venue-management-system.git
cd CampusBook-venue-management-system
```

### 2. Install dependencies

```bash
npm run setup
```

This installs dependencies for the root, backend, and frontend workspaces in one command.

### 3. Configure environment variables

Create a `.env` file inside the `backend/` directory:

```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusbook

# Auth
JWT_SECRET=your_super_secret_jwt_key_here
```

Create a `.env` file in the `frontend/` directory (optional — defaults to `/api`):

```env
VITE_API_URL=/api
```

### 4. Seed the database

```bash
npm run seed
```

This populates the database with demo users, departments, and venues so you can explore the system immediately.

### 5. Run in development

**Backend** (Express API on port 5000):
```bash
npm run dev-backend
```

**Frontend** (Vite dev server):
```bash
npm run dev-frontend
```

### 6. Build for production

```bash
npm run build
```

---

## API Overview

The backend exposes REST APIs under the `/api` prefix, protected by JWT middleware.

```
POST   /api/auth/login
POST   /api/auth/register

GET    /api/venues
POST   /api/venues              (Admin)
PUT    /api/venues/:id          (Admin)
DELETE /api/venues/:id          (Admin)

POST   /api/bookings            (Faculty, HOD)
GET    /api/bookings/my
GET    /api/bookings/pending    (HOD, DSW)
PUT    /api/bookings/:id/approve
PUT    /api/bookings/:id/reject

GET    /api/analytics           (DSW, Admin)
GET    /api/notifications/my
```

---

## Booking Workflow

```
Faculty submits request
        │
        ▼
  Validation Layer
  ┌─────────────────────────────┐
  │ • Advance notice check      │
  │ • Venue booking hours       │
  │ • Timetable conflict scan   │
  │ • Existing booking overlap  │
  └─────────────────────────────┘
        │
   ┌────┴────┐
   │         │
Dept Venue   Central Venue
   │         │
   ▼         ▼
HOD Review  DSW Review
   │
   ▼
DSW Review
   │
   ▼
Booking Confirmed → Notification sent
```

---

## Running Tests

```bash
npm test
```

Tests run with Jest + Supertest against an in-memory MongoDB instance, so no live database is required.

---

## Deployment

The project is configured for **Vercel** deployment out of the box via `vercel.json`.

- Frontend is built with Vite and served as a static SPA
- Backend runs as Vercel Serverless Functions
- Database is hosted on **MongoDB Atlas**

**Live deployment:** [https://campusbook2026.vercel.app/](https://campusbook2026.vercel.app/)

---

## Demo Credentials

After running `npm run seed`, the following accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mits.edu | password123 |
| DSW | dsw@mits.edu | password123 |
| HOD (CSE) | hod.cse@mits.edu | password123 |
| Faculty | faculty@mits.edu | password123 |

> ⚠️ Change all credentials before any production deployment.

---

## Acknowledgements

Developed as part of **NEC — Software Development 2** at  
**Madhav Institute of Technology & Science, Gwalior (M.P.), India**

Submitted to: **Mr. Atul Kumar Chauhan**  
Session: Jan – June 2026

---

<div align="center">

Built by **Nayan Jain** (BTIT24O1087) · Information Technology · MITS Gwalior

</div>
