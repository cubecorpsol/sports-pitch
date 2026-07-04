const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partially Paid'],
    default: 'Unpaid'
  },
  amount: {
    type: Number,
    default: 500
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  editedBy: {
    type: String,
    default: null
  },
  editedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one payment record per customer per month
paymentSchema.index({ customerId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
