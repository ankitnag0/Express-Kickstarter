// src/index.ts
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

const PORT = Number(env.PORT);

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });

    const gracefulShutdown = () => {
      logger.info('Shutting down gracefully...');
      server.close(async (err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        await disconnectDB();
        logger.info('Server closed. Exiting...');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
