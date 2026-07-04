const mongoose = require('mongoose');

const sportFeeSchema = new mongoose.Schema({
  sport: {
    type: String,
    enum: ['Badminton', 'Karate', 'Cricket', 'Kabaddi'],
    required: true,
    unique: true
  },
  monthlyFee: {
    type: Number,
    required: true,
    default: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SportFee', sportFeeSchema);
