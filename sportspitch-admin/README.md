# SportsPitch Admin Portal

Mobile-first admin portal for SportsPitch, connected to the live SportsPitch
backend (Node/Express + MongoDB). No mock data remains -- every module reads
and writes through the real API.

## Setup

```
npm install
cp .env.example .env   # points at the live Render API by default
npm run dev
```

## Login

Reuses the exact credentials the existing admin-panel-new already used
(there is no backend auth endpoint to call):

- Username: `sportspitch`
- Password: `new2580` (changeable from Profile -> Change password; stored
  locally, same trust model as the original)

## Admin PIN

Default `0000`, now persisted server-side in the new `Settings` collection
(`/api/settings`). Required to delete a player, edit a payment, or save any
Settings tab. Change it from Settings -> Security.

## What's wired to real data

Every module (Dashboard, Bookings, Players, Payments, Sports management
[sport fees only], Reports, Announcements, Settings, Profile) reads from
and writes to the live backend at `VITE_API_URL` (defaults to
`https://sports-pitch-2-ootl.onrender.com`). See `src/lib/api/` for one
file per domain -- that's the complete list of endpoints this app calls.

Coach management, Court availability, and Attendance were built in an
earlier pass and have been removed (backend models/routes and frontend
pages both deleted) -- postponed to a future version per product decision.

## Known product-level decisions baked into this integration

- **Sports** are the fixed backend enum: Cricket, Badminton, Karate, Kabaddi.
- **One sport per player** (backend technically supports an array; this UI
  only ever sends/reads a single value, per your instruction).
- **Overdue / Due soon** are computed client-side from a due-day rule since
  the backend has no due-date field -- see `src/lib/paymentStatus.ts` for
  the exact logic and how to tune it.
- **Batches** are free text on the backend (no separate collection), so the
  "Batches" tab under Sports management is a local suggestion list only,
  clearly labeled as such in the UI.
- **Edit Payment** now edits the real `PaymentTransaction` record (or
  records the first one if none exists yet) with a full audit trail
  (`editedBy` / `editedAt` / `editHistory`) stored on the backend.

## Not yet load-tested against production data

This was built and type/build-checked in a sandbox with no network path to
your MongoDB Atlas cluster or Render deployment, so I could not personally
click through every CRUD path against live data before handing this off.
Please run through each module once against the real backend before
considering this fully verified -- the "Testing checklist" section below
is exactly what to click through.

## Testing checklist

- [ ] Login with real credentials
- [ ] Dashboard loads today's bookings and needs-attention list
- [ ] Approve / reject / delete a booking, confirm WhatsApp link opens
- [ ] Add / edit / delete a player
- [ ] Record a payment, edit it (PIN), confirm audit trail appears in View
- [ ] Send an individual and a bulk WhatsApp reminder
- [ ] Edit a sport's monthly fee
- [ ] Create / edit / publish / delete an announcement
- [ ] Save each Settings tab (PIN required) and change the PIN itself
- [ ] Export PDF and Excel from Reports
