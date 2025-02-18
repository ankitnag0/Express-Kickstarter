import { ZodValidationError } from '@lib/ValidationError';
import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';

// Load environment variables from .env files
dotenvFlow.config();

// Define the schema for environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.preprocess((val) => Number(val), z.number().default(3000)),
  CORS_ORIGIN: z
    .string()
    .default('*')
    .transform((val) => val.split(',').map((origin) => origin.trim())),
  MONGODB_URL: z.string().default('mongodb://localhost:27017/mydatabase'), // Add MONGODB_URL here
  JWT_SECRET: z.string().default('your-secret-key'),
  JWT_EXPIRATION: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .min(1, 'JWT expiration must be a positive number in seconds') // Ensures a valid positive number
      .default(3600), // Default to 1 hour (3600 seconds)
  ),
});

// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env);

// Throw an error if validation fails
if (!parsedEnv.success) {
  throw new ZodValidationError(parsedEnv.error);
}

// Export the validated environment variables
export const env = parsedEnv.data;
