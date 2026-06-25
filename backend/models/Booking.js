const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => 'BK' + Date.now() + Math.random().toString(36).substr(2, 9)
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    enum: {
      values: ['Cricket', 'Badminton', 'Karate', 'Kabaddi'],
      message: '{VALUE} is not a valid sport'
    }
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  },
  amount: {
    type: Number,
    default: 500
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
