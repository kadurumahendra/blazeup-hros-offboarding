import mongoose from 'mongoose';
import { config } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    // Attempt standard connection first
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Standard connection to ${config.mongoUri} failed (${error.message}).`);
    
    // In dev, fallback to MongoMemoryServer so the app runs smoothly without external setup
    if (config.nodeEnv === 'development' || !process.env.NODE_ENV) {
      try {
        console.log('[MongoDB] Starting MongoMemoryServer in-memory fallback...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const uri = mongodInstance.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[MongoDB] In-Memory DB connected successfully at: ${uri}`);
        return conn;
      } catch (memErr) {
        console.error('[MongoDB] In-memory DB fallback failed:', memErr.message);
        throw memErr;
      }
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
