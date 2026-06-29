const SportFee = require('../models/SportFee');

// Get all sport fees
exports.getAllSportFees = async (req, res) => {
  try {
    const sportFees = await SportFee.find({ isActive: true });
    res.json({
      success: true,
      sportFees
    });
  } catch (error) {
    console.error('Error fetching sport fees:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get fee for a specific sport
exports.getSportFee = async (req, res) => {
  try {
    const { sport } = req.params;
    const sportFee = await SportFee.findOne({ sport, isActive: true });
    
    if (!sportFee) {
      return res.json({
        success: true,
        monthlyFee: 500 // Default fee
      });
    }
    
    res.json({
      success: true,
      monthlyFee: sportFee.monthlyFee
    });
  } catch (error) {
    console.error('Error fetching sport fee:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update sport fee
exports.updateSportFee = async (req, res) => {
  try {
    const { sport } = req.params;
    const { monthlyFee } = req.body;
    
    if (!monthlyFee || monthlyFee <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid monthly fee is required'
      });
    }
    
    const sportFee = await SportFee.findOneAndUpdate(
      { sport },
      { monthlyFee, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      sportFee
    });
  } catch (error) {
    console.error('Error updating sport fee:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Initialize default sport fees
exports.initializeDefaultFees = async (req, res) => {
  try {
    const defaultFees = [
      { sport: 'Badminton', monthlyFee: 500 },
      { sport: 'Karate', monthlyFee: 600 },
      { sport: 'Cricket', monthlyFee: 700 },
      { sport: 'Kabaddi', monthlyFee: 550 }
    ];
    
    for (const fee of defaultFees) {
      await SportFee.findOneAndUpdate(
        { sport: fee.sport },
        { monthlyFee: fee.monthlyFee },
        { upsert: true }
      );
    }
    
    res.json({
      success: true,
      message: 'Default sport fees initialized'
    });
  } catch (error) {
    console.error('Error initializing default fees:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
