// src/config/db.ts
import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URL);
    logger.info('MongoDB connected successfully.');
  } catch (error) {
    logger.info('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected.');
};
