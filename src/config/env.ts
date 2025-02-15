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
    .default('*') // Default to '*' to allow all origins if not specified
    .transform((val) => val.split(',').map((origin) => origin.trim())), // Split into an array if multiple origins are provided
});

// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new ZodValidationError(parsedEnv.error);
}

export const env = parsedEnv.data;
