# Sports Booking System

Complete sports booking system with customer frontend, backend API, and admin panel.

## Project Structure

```
├── sports-pitch-main/          # Customer frontend (existing, unchanged UI)
│   ├── src/
│   │   ├── components/site/    # BookingForm updated with backend API
│   │   └── lib/
│   │       └── sports-data.ts  # Updated sports list
│   └── package.json
│
├── backend/                    # Backend API (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   └── Booking.js         # Mongoose schema
│   ├── routes/
│   │   └── bookingRoutes.js   # API routes
│   ├── controllers/
│   │   └── bookingController.js  # Business logic
│   ├── server.js              # Express server setup
│   ├── .env                   # Environment variables
│   └── package.json
│
└── admin-panel/               # Admin Panel (React)
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── BookingManagement.js
    │   │   └── PaymentManagement.js
    │   ├── services/
    │   │   └── api.js        # API service
    │   ├── App.js            # Router setup
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure MongoDB in `backend/.env`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/sports-booking
```

Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### 2. Admin Panel Setup

```bash
cd admin-panel
npm install
npm start
```

Admin panel will run on `http://localhost:3000`

**Login credentials:**
- Username: `admin`
- Password: `admin123`

### 3. Customer Frontend

The existing customer frontend has been updated to connect to the backend API.

```bash
cd sports-pitch-main
npm run dev
```

Customer frontend will run on its default port.

## Sports Available

1. Cricket
2. Badminton
3. Karate
4. Volleyball

## API Endpoints

### POST /api/bookings
Create a new booking
```json
{
  "name": "John Doe",
  "sport": "Cricket",
  "date": "2024-01-15",
  "time": "9-10"
}
```

### GET /api/bookings
Get all bookings

### GET /api/bookings/:id
Get single booking

### PUT /api/bookings/:id/status
Update booking status (Pending/Approved/Rejected)

### PUT /api/bookings/:id/payment
Update payment status (Paid/Unpaid)

### DELETE /api/bookings/:id
Delete booking

## Features

### Customer Frontend
- Book sports turfs
- Select from 4 sports
- Choose date and time slots
- Automatic WhatsApp notification on booking
- Form validation

### Admin Panel
- Dashboard with statistics
- Booking management (approve/reject/delete)
- Payment management (mark paid/unpaid)
- Protected routes with login
- Responsive design

### Backend
- RESTful API
- MongoDB database
- CORS enabled
- Error handling
- Input validation

## Testing

1. Start the backend server
2. Start the admin panel
3. Start the customer frontend
4. Make a booking from customer frontend
5. Login to admin panel
6. Approve/reject bookings
7. Manage payments

## Notes

- Backend runs on port 3001
- Admin panel runs on port 3000
- Customer frontend runs on its default port
- MongoDB can be local or MongoDB Atlas
- All admin panel data is fetched from backend API
