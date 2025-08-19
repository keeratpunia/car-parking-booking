# Car Parking Booking System
A full-stack web app to find and book parking slots with role-based access.

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- DB: MongoDB (Atlas)
- Auth: JWT

## Run Locally

### 1) Backend
```bash
cd backend
cp .env.example .env   # fill values
npm install
npm run dev
```
### 2) Frontend
```bash
cd frontend
cp .env.example .env   # adjust API URL if needed
npm install
npm run dev
```

## Test Credentials:
Admin: { Email: admin@example.com ; Password: Admin@12345 }
Users : { user1 => Email: user1@example.com ; Password: user1@12345 }
        { user2 => Email: user2@example.com ; Password: user2@12345 }

## Features:
1) Email/password auth
2) User/admin roles
3) Locations, slots, bookings with time-range & conflict checks
4) Per-minute location pricing
5) CRUD everywhere (users see only their bookings; admins manage their locations/slots/bookings)
6) Soft delete, validation, clean UI
   
