const Booking = require('../models/Booking');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  console.log('[createBooking] Received request');
  console.log('[createBooking] Request body:', req.body);
  
  try {
    const { name, phone, sport, date, time } = req.body;

    console.log('[createBooking] Extracted data:', { name, phone, sport, date, time });

    // Validation
    if (!name || !phone || !sport || !date || !time) {
      console.error('[createBooking] Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, phone, sport, date, time'
      });
    }

    // Validate sport
    const validSports = ['Cricket', 'Badminton', 'Karate', 'Kabaddi'];
    if (!validSports.includes(sport)) {
      console.error('[createBooking] Invalid sport:', sport);
      return res.status(400).json({
        success: false,
        error: `Invalid sport. Must be one of: ${validSports.join(', ')}`
      });
    }

    console.log('[createBooking] Checking for existing booking...');
    // Check for time slot conflict
    const existingBooking = await Booking.findOne({
      sport,
      date,
      time,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingBooking) {
      console.error('[createBooking] Time slot already booked');
      return res.status(400).json({
        success: false,
        error: 'This time slot is already booked. Please choose a different time.'
      });
    }

    console.log('[createBooking] Creating booking...');
    const booking = await Booking.create({
      name,
      phone,
      sport,
      date,
      time
    });

    console.log('[createBooking] Booking created successfully:', booking._id);

    // Send WhatsApp notification on booking confirmation
    if (phone) {
      const message = `Hey ${name}, your sports have been booked successfully!\n\nSport: ${sport}\nDate: ${date}\nTime: ${time}\n\nThank you for booking with Sports Pitch!`;
      const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      
      console.log('WhatsApp notification URL:', whatsappUrl);
      // Note: In production, you would use a WhatsApp Business API to send this automatically
      // For now, we return the URL so the admin can open it
    }

    console.log('[createBooking] Sending success response');
    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully',
      booking,
      whatsappUrl: phone ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hey ${name}, your sports have been booked successfully!\n\nSport: ${sport}\nDate: ${date}\nTime: ${time}\n\nThank you for booking with Sports Pitch!`)}` : null
    });
  } catch (error) {
    console.error('[createBooking] Error:', error);
    console.error('[createBooking] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: error.message
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Public
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Public
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Public
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: Pending, Approved, Rejected'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Send WhatsApp notification when booking is approved
    if (status === 'Approved' && booking.phone) {
      const message = `Hey ${booking.name}, your sports booking is successful!\n\nSport: ${booking.sport}\nDate: ${booking.date}\nTime: ${booking.time}\n\nThank you for booking with Sports Pitch!`;
      const whatsappUrl = `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      
      console.log('WhatsApp notification URL:', whatsappUrl);
      // Note: In production, you would use a WhatsApp Business API to send this automatically
      // For now, we return the URL so the admin can open it
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
      whatsappUrl: status === 'Approved' && booking.phone ? `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hey ${booking.name}, your sports booking is successful!\n\nSport: ${booking.sport}\nDate: ${booking.date}\nTime: ${booking.time}\n\nThank you for booking with Sports Pitch!`)}` : null
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Public
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus || !['Paid', 'Unpaid'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment status. Must be one of: Paid, Unpaid'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      booking
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Update payment amount
// @route   PUT /api/bookings/:id/amount
// @access  Public
const updatePaymentAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || amount === null || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { amount },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment amount updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating payment amount:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Public
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      booking
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  updatePaymentAmount,
  deleteBooking
};
