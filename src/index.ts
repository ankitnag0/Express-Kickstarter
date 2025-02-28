import { cache } from '@config/cache';
import { connectDB, disconnectDB } from '@config/database';
import { env } from '@config/env';
import { logger } from '@config/logger';
import agenda from '@jobs/agenda';

import app from '@/app';

import { scheduleHelloWorld } from './jobs';

const PORT = Number(env.PORT);

const startServer = async () => {
  try {
    await connectDB();
    await cache.connect();
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });

    await agenda.start();
    logger.info('Agenda started');

    await scheduleHelloWorld();

    const gracefulShutdown = () => {
      logger.info('Shutting down gracefully...');
      server.close(async (err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        await agenda.stop();
        await disconnectDB();
        await cache.disconnect();
        logger.info('Server closed. Exiting...');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Failed to start the server:', error);
    }
    process.exit(1);
  }
};

startServer();
