const mongoose = require('mongoose');
const { dbConnectionGauge } = require('../utils/metrics');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shekhawat_dhaba';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    dbConnectionGauge.set(1);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    isConnected = false;
    dbConnectionGauge.set(0);
    console.warn(`⚠️  MongoDB connection warning: ${err.message}. Operating with resilient hybrid fallback.`);
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    dbConnectionGauge.set(0);
  });
  mongoose.connection.on('connected', () => {
    isConnected = true;
    dbConnectionGauge.set(1);
  });
}

function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isMongoConnected };
