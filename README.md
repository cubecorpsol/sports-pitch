# Sports Booking System

Production-oriented sports booking system with three apps:

| Path | Purpose |
| --- | --- |
| `sports-pitch-main/` | Customer frontend, built with TanStack Start |
| `sportspitch-admin/` | Admin frontend, built with Vite/React |
| `sportspitch-backend/` | Node/Express/MongoDB API |

## Local Setup

Install all workspaces from the repository root:

```bash
npm install
```

Create environment files from the examples:

```bash
cp sports-pitch-main/.env.example sports-pitch-main/.env
cp sportspitch-admin/.env.example sportspitch-admin/.env
cp sportspitch-backend/.env.example sportspitch-backend/.env
```

Run each app:

```bash
npm run dev:backend
npm run dev:customer
npm run dev:admin
```

The backend defaults to `http://localhost:3004`.

## Production Notes

- Deploy `sports-pitch-main/` and `sportspitch-admin/` as separate frontend projects.
- Deploy `sportspitch-backend/` as the API service.
- Set `VITE_API_BASE_URL` in both frontends to the backend origin.
- Set backend `MONGODB_URI`, `CORS_ORIGINS`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `JWT_SECRET`.
- `CORS_ORIGINS` must include the deployed customer and admin frontend origins.

## Sports Available

- Cricket
- Badminton
- Karate
- Kabaddi
- Football
- Box Cricket

## Useful Commands

```bash
npm run build
npm run build:customer
npm run build:admin
npm run start:backend
```
