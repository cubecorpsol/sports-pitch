const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  updatePaymentAmount,
  deleteBooking
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/payment', updatePaymentStatus);
router.put('/:id/amount', updatePaymentAmount);
router.delete('/:id', deleteBooking);

module.exports = router;
