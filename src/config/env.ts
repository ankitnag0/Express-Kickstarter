import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';
import { ZodValidationError } from '../lib/ValidationError';

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
});

// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env);

// Throw an error if validation fails
if (!parsedEnv.success) {
  throw new ZodValidationError(parsedEnv.error);
}

// Export the validated environment variables
export const env = parsedEnv.data;
