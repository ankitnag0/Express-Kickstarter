import { env } from '@config/env';
import pino from 'pino';

export const logger = pino({
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
