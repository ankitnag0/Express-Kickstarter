import { logger } from '@config/logger';
import { Job } from 'agenda';
import { model, Schema } from 'mongoose';

export interface IDeadLetter {
  jobName: string;
  jobData: unknown;
  failedAt: Date;
  failCount: number;
  error: string;
}

const deadLetterSchema = new Schema<IDeadLetter>({
  jobName: { type: String, required: true },
  jobData: { type: Schema.Types.Mixed, required: true },
  failedAt: { type: Date, default: Date.now },
  failCount: { type: Number, required: true },
  error: { type: String, required: true },
});

export const DeadLetterModel = model<IDeadLetter>(
  'DeadLetter',
  deadLetterSchema,
);

export async function moveJobToDLQ(job: Job): Promise<void> {
  try {
    await DeadLetterModel.create({
      jobName: job.attrs.name,
      jobData: job.attrs.data as unknown,
      failedAt: new Date(),
      failCount: job.attrs.failCount || 0,
      error: job.attrs.failReason || 'Unknown error',
    });
    logger.info(`Job [${job.attrs.name}] moved to DLQ`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(
        `Failed to move job [${job.attrs.name}] to DLQ: ${err.message}`,
      );
    }
  }
}
