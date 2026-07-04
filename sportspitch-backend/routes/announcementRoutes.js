const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

// Get all announcements
router.get('/', getAnnouncements);

// Create announcement
router.post('/', createAnnouncement);

// Update announcement
router.put('/:id', updateAnnouncement);

// Delete announcement
router.delete('/:id', deleteAnnouncement);

module.exports = router;
