const Announcement = require('../models/Announcement');

// Get all announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description, priority, publishDate, expiryDate, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    const announcement = await Announcement.create({
      title,
      description,
      priority: priority || 'Normal',
      publishDate: publishDate || new Date(),
      expiryDate: expiryDate || null,
      status: status || 'Active'
    });

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, publishDate, expiryDate, status } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        description,
        priority,
        publishDate,
        expiryDate,
        status
      },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
