const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  changeAdminPin,
  verifyAdminPin
} = require('../controllers/settingsController');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/pin', changeAdminPin);
router.post('/verify-pin', verifyAdminPin);

module.exports = router;
