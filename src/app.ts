import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import hpp from 'hpp';
// import csrf from 'csrf';
import responseEnhancer from './middlewares/response-enhancer';
import errorHandler from './middlewares/error-handler';
import { env } from './config/env';

const app = express();

// Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(
  cors({
    origin: env.CORS_ORIGIN, // Allow specific origins or '*' for all
    credentials: true,
  }),
);
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Cookie Parsing
app.use(cookieParser());

// Data Sanitization
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeRequestBody(req.body); // Use xss to sanitize user input
  }
  next();
});

// Define a type for the request body
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

app.use(hpp()); // Prevent HTTP Parameter Pollution

// CSRF Protection
// const tokens = new csrf();
// app.use((req, res, next) => {
//   const token = req.headers['x-csrf-token'] || req.body._csrf;
//   if (!token || !tokens.verify('your-secret-key', token)) {
//     return res
//       .status(403)
//       .json({ success: false, message: 'Invalid CSRF token' });
//   }
//   next();
// });

// Custom Middleware
app.use(responseEnhancer); // Enhance response format

// Basic Route
app.get('/', (req, res) => {
  res.success({ message: 'Hello, World!' }, 200, 'API is working!');
});

// Error Handling Middleware
app.use(errorHandler); // Add error handler here

export default app;
