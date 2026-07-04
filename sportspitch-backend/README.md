# Sports Booking Backend API

Backend API for Sports Booking System using Node.js, Express, and MongoDB.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure MongoDB connection:
   - Open `.env` file
   - Update `MONGODB_URI` with your MongoDB connection string
   - For local MongoDB: `mongodb://localhost:27017/sports-booking`
   - For MongoDB Atlas: Replace with your Atlas connection string

4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Bookings

- **POST /api/bookings** - Create a new booking
  - Body: `{ name, sport, date, time }`
  - Response: `{ success, message, booking }`

- **GET /api/bookings** - Get all bookings
  - Response: `{ success, count, bookings }`

- **GET /api/bookings/:id** - Get single booking
  - Response: `{ success, booking }`

- **PUT /api/bookings/:id/status** - Update booking status
  - Body: `{ status: "Pending" | "Approved" | "Rejected" }`
  - Response: `{ success, message, booking }`

- **PUT /api/bookings/:id/payment** - Update payment status
  - Body: `{ paymentStatus: "Paid" | "Unpaid" }`
  - Response: `{ success, message, booking }`

- **DELETE /api/bookings/:id** - Delete booking
  - Response: `{ success, message, booking }`

## Sports Available
- Cricket
- Badminton
- Karate
- Volleyball

## Booking Schema
```javascript
{
  name: String (required),
  sport: String (required, enum: ["Cricket", "Badminton", "Karate", "Volleyball"]),
  date: String (required),
  time: String (required),
  status: String (default: "Pending", enum: ["Pending", "Approved", "Rejected"]),
  paymentStatus: String (default: "Unpaid", enum: ["Paid", "Unpaid"]),
  amount: Number (default: 500),
  createdAt: Date (auto)
}
```

## CORS
The API is configured to accept requests from any origin (CORS enabled).

## New endpoints (added for the Admin Portal integration)

These are additive only — nothing above this line changed behavior.

### Settings (singleton document, auto-created with defaults on first read)
- `GET /api/settings`
- `PUT /api/settings` - partial update of any general/business/payment/notification field
- `PUT /api/settings/pin` - `{ currentPin, newPin }`, rejects if `currentPin` is wrong
- `POST /api/settings/verify-pin` - `{ pin }` → `{ valid: boolean }`, used by the in-app PIN gate

### Payment transaction edit (audit-tracked)
- `PUT /api/payment/transaction/:id` - `{ amount?, paymentMethod?, remarks?, editedBy }`. Recalculates that
  transaction's balance and appends the previous values to `editHistory` on the transaction document.
- `POST /api/payment/payment/update-status` now also accepts an optional `editedBy` field and stamps
  `editedAt` on the `Payment` document when present. The `Payment.status` enum also now allows
  `'Partially Paid'` in addition to `Paid`/`Unpaid`.
