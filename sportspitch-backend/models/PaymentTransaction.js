const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque'],
    default: 'Cash'
  },
  remarks: {
    type: String,
    default: ''
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  monthlyFee: {
    type: Number,
    required: true
  },
  balanceAfterPayment: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  editedBy: {
    type: String,
    default: null
  },
  editedAt: {
    type: Date,
    default: null
  },
  editHistory: [{
    editedBy: String,
    editedAt: { type: Date, default: Date.now },
    previousAmount: Number,
    previousPaymentMethod: String,
    previousRemarks: String
  }]
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
