const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('bookings');

    // Drop the bookingId index if it exists
    try {
      await collection.dropIndex('bookingId_1');
      console.log('Dropped bookingId_1 index');
    } catch (error) {
      console.log('bookingId_1 index does not exist or already dropped');
    }

    // Drop the bookingCode index if it exists
    try {
      await collection.dropIndex('bookingCode_1');
      console.log('Dropped bookingCode_1 index');
    } catch (error) {
      console.log('bookingCode_1 index does not exist or already dropped');
    }

    // Update existing documents to have bookingId
    const result = await collection.updateMany(
      { bookingId: null },
      { $set: { bookingId: 'BK' + Date.now() + Math.random().toString(36).substr(2, 9) } }
    );
    console.log(`Updated ${result.modifiedCount} documents with bookingId`);

    console.log('Database fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
};

fixDatabase();
