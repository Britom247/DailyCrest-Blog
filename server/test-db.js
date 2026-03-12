const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test creating a collection
    const db = mongoose.connection.db;
    await db.createCollection('test_connection');
    console.log('✅ Successfully created test collection');
    
    // Clean up
    await db.collection('test_connection').drop();
    console.log('✅ Test collection removed');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();