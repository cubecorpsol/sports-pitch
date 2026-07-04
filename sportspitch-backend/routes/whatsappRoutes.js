const express = require('express');
const router = express.Router();
const {
  sendFeeReminder,
  sendBulkReminders,
  sendPaymentSuccessNotification,
  sendPendingPaymentNotification,
  sendPartialPaymentNotification
} = require('../controllers/whatsappController');

// Send reminder to a specific customer
router.post('/send-reminder', sendFeeReminder);

// Get bulk reminders for all customers with outstanding balance
router.get('/bulk-reminders', sendBulkReminders);

// Send payment success notification
router.post('/payment-success', sendPaymentSuccessNotification);

// Send pending payment notification
router.post('/pending-payment', sendPendingPaymentNotification);

// Send partial payment notification
router.post('/partial-payment', sendPartialPaymentNotification);

module.exports = router;
