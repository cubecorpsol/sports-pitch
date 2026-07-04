const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const sportFeeRoutes = require('./routes/sportFeeRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const connectDB = require('./config/db');

// Load env
dotenv.config();

const app = express();

/* =======================
   CORS FIX (IMPORTANT)
======================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

/* =======================
   BASIC MIDDLEWARE
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   REQUEST LOGGER
======================= */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

/* =======================
   CONNECT DB MIDDLEWARE
======================= */
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/health') {
    return next();
  }

  console.log(`[DB Middleware] Processing ${req.method} ${req.path}`);
  
  try {
    if (!process.env.MONGODB_URI) {
      console.error('[DB Middleware] MONGODB_URI not found');
      return res.status(500).json({
        success: false,
        error: 'MONGODB_URI not found'
      });
    }

    await connectDB();
    console.log(`[DB Middleware] DB connected for ${req.method} ${req.path}`);
    next();
  } catch (error) {
    console.error('[DB Middleware] MongoDB error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
});

/* =======================
   HEALTH ROUTES
======================= */
app.get('/', (req, res) => {
  res.json({
    message: 'Sports Booking API is running',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    status: 'healthy',
    database: mongoStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/* =======================
   ROUTES
======================= */
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/sport-fees', sportFeeRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/settings', settingsRoutes);

/* =======================
   404 HANDLER
======================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: err.message || 'Server error'
  });
});

/* =======================
   START SERVER
======================= */
if (require.main === module) {
  const PORT = process.env.PORT || 3004;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log('✅ Server started successfully');
        console.log(`   Port: ${PORT}`);
        console.log(`   URL: http://localhost:${PORT}`);
        console.log('📡 API ready');
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;