// src/config/logger.ts
import pino from 'pino';
import { env } from './env';

const isProd = env.NODE_ENV === 'production';

const logger = pino({
  level: isProd ? 'info' : 'debug',
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'req.body.token'],
    censor: '***',
  },
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
});

export default logger;
