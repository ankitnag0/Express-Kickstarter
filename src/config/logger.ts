import { env } from '@config/env';
import pino from 'pino';

const baseLogger = pino({
  level: (env.NODE_ENV ?? 'development') === 'production' ? 'info' : 'debug',
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'req.body.token'],
    censor: '***',
  },
  ...(env.NODE_ENV === 'production'
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      }),
});

// Set default level to 'warn' for test environment to reduce verbosity
const testLevel = 'warn';

export const logger =
  env.NODE_ENV === 'test' ? pino({ level: testLevel }) : baseLogger;
