import { env } from '@config/env';
import { errorHandler } from '@middlewares/error-handler';
import { responseEnhancer } from '@middlewares/response-enhancer';
import { indexRouter } from '@modules/index';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(cookieParser());

app.use(mongoSanitize());
app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeRequestBody(req.body);
  }
  next();
});

type SanitizedBody = Record<string, unknown>;

function sanitizeRequestBody(body: SanitizedBody): SanitizedBody {
  if (typeof body === 'object' && !Array.isArray(body)) {
    return Object.keys(body).reduce((acc, key) => {
      const value = body[key];
      acc[key] = typeof value === 'string' ? xss(value) : value;
      return acc;
    }, {} as SanitizedBody);
  }
  return body;
}

app.use(hpp());

app.use(responseEnhancer);

app.get('/', (req, res) => {
  res.success({ message: 'Hello, World!' }, 200, 'API is working!');
});

app.use('/api', indexRouter);

app.use(errorHandler);

export default app;
