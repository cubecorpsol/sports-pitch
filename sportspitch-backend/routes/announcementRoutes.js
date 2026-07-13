const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const requireAuth = require('../middleware/auth');

// Get all announcements
router.get('/', getAnnouncements);

// Create announcement
router.post('/', requireAuth, createAnnouncement);

// Update announcement
router.put('/:id', requireAuth, updateAnnouncement);

// Delete announcement
router.delete('/:id', requireAuth, deleteAnnouncement);

module.exports = router;
