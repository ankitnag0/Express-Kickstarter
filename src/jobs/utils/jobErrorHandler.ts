import { logger } from '@config/logger';
import { Job } from 'agenda';

import { moveJobToDLQ } from './dlqHandler';

const MAX_ATTEMPTS = 5;
const BASE_DELAY = 1000;

export async function handleJobExecution(
  job: Job,
  jobFn: () => Promise<void>,
): Promise<void> {
  try {
    await jobFn();
  } catch (error: unknown) {
    const failCount = job.attrs.failCount || 0;
    if (failCount + 1 >= MAX_ATTEMPTS) {
      logger.error(
        `Job [${job.attrs.name}] failed after ${failCount + 1} attempts. Moving to DLQ.`,
      );
      await moveJobToDLQ(job);
      await job.remove();
    } else {
      const nextDelay = BASE_DELAY * Math.pow(2, failCount);
      if (error instanceof Error) {
        logger.error(
          `Job [${job.attrs.name}] failed attempt ${failCount + 1}: ${error.message}. Retrying in ${nextDelay}ms.`,
        );
      } else {
        logger.error(
          `Job [${job.attrs.name}] failed attempt ${failCount + 1}. Retrying in ${nextDelay}ms.`,
        );
      }
      job.schedule(new Date(Date.now() + nextDelay));
      await job.save();
    }
    // Throw the error so Agenda marks this attempt as failed (won't crash the server).
    throw error;
  }
}
