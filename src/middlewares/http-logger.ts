import { logger } from '@config/logger';
import pinoHttp from 'pino-http';

const httpLogger = pinoHttp({ logger });

export default httpLogger;
