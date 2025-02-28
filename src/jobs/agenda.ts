import { env } from '@config/env';
import { logger } from '@config/logger';
import Agenda, { Job } from 'agenda';

const agenda = new Agenda({
  db: { address: env.MONGODB_URL, collection: 'jobs' },
  processEvery: '30 seconds',
  maxConcurrency: 20,
  defaultConcurrency: 5,
  defaultLockLifetime: 10000,
});

agenda.on('start', (job: Job) => {
  logger.info(`Job [${job.attrs.name}] started, id: ${job.attrs._id}`);
});
agenda.on('complete', (job: Job) => {
  logger.info(`Job [${job.attrs.name}] completed`);
});
agenda.on('fail', (error: Error, job: Job) => {
  logger.error(`Job [${job.attrs.name}] failed with error: ${error.message}`);
});

export default agenda;
