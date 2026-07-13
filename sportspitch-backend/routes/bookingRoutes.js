const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getAvailability,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  updatePaymentAmount,
  deleteBooking
} = require('../controllers/bookingController');
const requireAuth = require('../middleware/auth');

router.post('/', createBooking);
router.get('/availability', getAvailability);
router.get('/', requireAuth, getAllBookings);
router.get('/:id', requireAuth, getBookingById);
router.put('/:id/status', requireAuth, updateBookingStatus);
router.put('/:id/payment', requireAuth, updatePaymentStatus);
router.put('/:id/amount', requireAuth, updatePaymentAmount);
router.delete('/:id', requireAuth, deleteBooking);

module.exports = router;
