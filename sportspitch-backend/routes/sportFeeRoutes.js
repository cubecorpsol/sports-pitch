const express = require('express');
const router = express.Router();
const {
  getAllSportFees,
  getSportFee,
  updateSportFee,
  initializeDefaultFees
} = require('../controllers/sportFeeController');
const requireAuth = require('../middleware/auth');

// Get all sport fees
router.get('/', getAllSportFees);

// Get fee for a specific sport
router.get('/:sport', getSportFee);

// Update sport fee
router.put('/:sport', requireAuth, updateSportFee);

// Initialize default sport fees
router.post('/initialize', requireAuth, initializeDefaultFees);

module.exports = router;
