import { logger } from '@config/logger';
import { Job } from 'agenda';

import agenda from '../agenda';
import { handleJobExecution } from '../utils/jobErrorHandler';

agenda.define('helloWorld', async (job: Job) => {
  await handleJobExecution(job, async () => {
    // Core business logic: simply log "Hello world"
    logger.info('Hello world from Agenda!');
  });
});
