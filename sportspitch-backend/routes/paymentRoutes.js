const express = require('express');
const router = express.Router();
const {
  getCustomersWithPayments,
  createOrUpdateCustomer,
  updatePaymentStatus,
  createMonthlyRecords,
  sendReminder,
  deleteCustomer,
  updatePaymentAmount,
  getPaymentStats,
  getRevenueStats,
  recordPayment,
  getPaymentHistory,
  getMonthlyCollectionReport,
  getPendingFeeReport,
  getSportWiseRevenueReport,
  updateTransaction
} = require('../controllers/paymentController');

// Get all customers with their payment status
router.get('/customers', getCustomersWithPayments);

// Create or update customer
router.post('/customer', createOrUpdateCustomer);

// Update payment status
router.post('/payment/update-status', updatePaymentStatus);

// Create monthly payment records for all customers
router.post('/payment/create-monthly-records', createMonthlyRecords);

// Send payment reminder
router.post('/payment/send-reminder', sendReminder);

// Update payment amount
router.post('/payment/update-amount', updatePaymentAmount);

// Get payment statistics
router.get('/payment/stats', getPaymentStats);

// Get revenue statistics
router.get('/payment/revenue-stats', getRevenueStats);

// Record payment
router.post('/payment/record', recordPayment);

// Edit an existing payment transaction (audit-tracked)
router.put('/transaction/:id', updateTransaction);

// Get payment history for a customer
router.get('/payment/history/:customerId', getPaymentHistory);

// Reports
router.get('/reports/monthly-collection', getMonthlyCollectionReport);
router.get('/reports/pending-fees', getPendingFeeReport);
router.get('/reports/sport-wise-revenue', getSportWiseRevenueReport);

// Delete customer
router.delete('/customer/:customerId', deleteCustomer);

module.exports = router;
