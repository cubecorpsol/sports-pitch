const Settings = require('../models/Settings');
const { hashSecret, verifySecret } = require('../utils/auth');

async function getOrCreateSettings() {
  let settings = await Settings.findOne().select('+adminPin +adminPinHash');
  if (!settings) {
    settings = await Settings.create({ adminPinHash: hashSecret('0000') });
  } else if (!settings.adminPinHash) {
    settings.adminPinHash = hashSecret(settings.adminPin || '0000');
    settings.adminPin = undefined;
    await settings.save();
  }
  return settings;
}

function publicSettings(settings) {
  const data = settings.toObject();
  delete data.adminPin;
  delete data.adminPinHash;
  return data;
}

// @desc Get the single settings document (created with defaults on first access)
// @route GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, settings: publicSettings(settings) });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Update settings (partial update, any subset of fields)
// @route PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const allowedFields = [
      'turfName', 'contactNumber', 'address', 'workingHours', 'bookingRules',
      'upiId', 'bankDetails', 'notifyWhatsapp', 'notifyEmail', 'notifyPush',
      'adminName', 'adminEmail', 'adminMobile'
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) settings[field] = req.body[field];
    });
    await settings.save();
    res.json({ success: true, settings: publicSettings(settings) });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Change the admin PIN (requires current PIN to match)
// @route PUT /api/settings/pin
exports.changeAdminPin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    if (!currentPin || !newPin) {
      return res.status(400).json({ success: false, error: 'Current PIN and new PIN are required' });
    }

    const settings = await getOrCreateSettings();
    if (!verifySecret(currentPin, settings.adminPinHash || settings.adminPin)) {
      return res.status(401).json({ success: false, error: 'Incorrect current PIN' });
    }

    settings.adminPinHash = hashSecret(newPin);
    settings.adminPin = undefined;
    await settings.save();
    res.json({ success: true, message: 'Admin PIN updated successfully' });
  } catch (error) {
    console.error('Error changing admin PIN:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Verify a PIN without changing anything (used by the in-app PIN gate)
// @route POST /api/settings/verify-pin
exports.verifyAdminPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const settings = await getOrCreateSettings();
    res.json({ success: true, valid: verifySecret(pin, settings.adminPinHash || settings.adminPin) });
  } catch (error) {
    console.error('Error verifying admin PIN:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
