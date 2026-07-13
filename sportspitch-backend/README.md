# Sports Booking Backend API

Node.js, Express, and MongoDB API for SportsPitch.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The server defaults to `http://localhost:3004`.

## Required Environment

- `PORT`
- `MONGODB_URI`
- `CORS_ORIGINS`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

Use a long random value for `JWT_SECRET`. In production, set `CORS_ORIGINS`
to the deployed customer and admin frontend origins.

## Public Endpoints

- `GET /`
- `GET /health`
- `POST /api/auth/login`
- `POST /api/bookings`
- `GET /api/bookings/availability?sport=Cricket&date=2026-07-11`
- `GET /api/announcements`

## Protected Admin Endpoints

All booking list/update/delete routes, payment routes, settings routes,
sport-fee writes, WhatsApp routes, and announcement writes require:

```http
Authorization: Bearer <token>
```

Get the token from `POST /api/auth/login`.

## Sports

- Cricket
- Badminton
- Karate
- Kabaddi
- Football
- Box Cricket

## Notes

- The customer app can create bookings and check slot availability without
  receiving the full bookings collection.
- Admin PINs are hashed in the settings collection and are not returned from
  `GET /api/settings`.
- Mongo TLS is enabled automatically for `mongodb+srv://` connection strings.
