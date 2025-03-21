import { ZodValidationError } from '@lib/ValidationError';
import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';

dotenvFlow.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.preprocess((val) => Number(val), z.number().default(3000)),
  CORS_ORIGIN: z
    .string()
    .default('*')
    .transform((val) => val.split(',').map((origin) => origin.trim())),
  MONGODB_URL: z.string().default('mongodb://localhost:27017/mydatabase'),
  JWT_SECRET: z.string().default('your-secret-key'),
  JWT_EXPIRATION: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .min(1, 'JWT expiration must be a positive number in seconds')
      .default(3600), // 1 hour default, adjust as needed
  ),
  JWT_REFRESH_SECRET: z.string().default('your-refresh-secret-key'), // Add refresh token secret
  JWT_REFRESH_EXPIRATION: z.preprocess(
    // Add refresh token expiration
    (val) => Number(val),
    z
      .number()
      .min(1, 'JWT refresh expiration must be a positive number in seconds')
      .default(86400 * 7), // 7 days default, adjust as needed
  ),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CACHE_TTL: z.preprocess(
    (val) => Number(val),
    z.number().min(1).default(3600),
  ),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID cannot be empty'),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, 'GOOGLE_CLIENT_SECRET cannot be empty'),
  GOOGLE_CALLBACK_URL: z.string().min(1, 'GOOGLE_CALLBACK_URL cannot be empty'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new ZodValidationError(parsedEnv.error);
}

export const env = parsedEnv.data;
