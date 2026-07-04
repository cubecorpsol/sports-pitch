const mongoose = require('mongoose');

// Singleton document (one row) holding all admin-configurable settings that
// previously lived only in the frontend's local state. Fetched/updated as a
// whole via GET/PUT /api/settings.
const settingsSchema = new mongoose.Schema({
  turfName: { type: String, default: 'SportsPitch Arena' },
  contactNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  workingHours: { type: String, default: '6:00 AM - 10:00 PM' },
  bookingRules: { type: String, default: '' },
  upiId: { type: String, default: '' },
  bankDetails: { type: String, default: '' },
  notifyWhatsapp: { type: Boolean, default: true },
  notifyEmail: { type: Boolean, default: false },
  notifyPush: { type: Boolean, default: true },
  adminPin: { type: String, default: '0000' },
  adminName: { type: String, default: 'Admin' },
  adminEmail: { type: String, default: '' },
  adminMobile: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
