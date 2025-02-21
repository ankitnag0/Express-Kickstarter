import { env } from '@config/env';
import { logger } from '@config/logger';
import mongoose from 'mongoose';

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
