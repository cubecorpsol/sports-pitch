const mongoose = require('mongoose');

// Cache the connection for serverless functions
let cachedConnection = null;

const connectDB = async () => {
  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI environment variable is not defined');
    console.error('Please set MONGODB_URI in your .env file or environment variables');
    throw new Error('MONGODB_URI is not defined');
  }

  // Return cached connection if available
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    console.log('[MongoDB] Attempting to connect...');
    console.log('[MongoDB] Connection string:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      tlsAllowInvalidCertificates: true, // Allow for development
      tls: true,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port || 'default'}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      cachedConnection = null; // Reset cache on disconnect
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    // Cache the connection
    cachedConnection = conn;
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('   Reason: Could not connect to MongoDB server');
      console.error('   Please check:');
      console.error('   - MongoDB is running');
      console.error('   - MONGODB_URI is correct');
      console.error('   - Network connectivity');
    } else if (error.name === 'MongoParseError') {
      console.error('   Reason: Invalid MongoDB connection string');
      console.error('   Please check MONGODB_URI format');
    } else {
      console.error('   Stack trace:', error.stack);
    }
    
    throw error; // Throw instead of process.exit for serverless
  }
};

module.exports = connectDB;
