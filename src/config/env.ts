import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';
import { ZodValidationError } from '../lib/ValidationError';

dotenvFlow.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.preprocess((val) => Number(val), z.number().default(3000)),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new ZodValidationError(parsedEnv.error);
}

export const env = parsedEnv.data;
