// src/jobs/index.ts
import './jobs/helloWorld.job';

import agenda from './agenda';

export async function scheduleHelloWorld(): Promise<void> {
  const immediateJob = agenda.create('helloWorld', {});
  immediateJob.schedule(new Date());
  await immediateJob.save();

  const recurringJob = agenda.create('helloWorld', {});
  recurringJob.repeatEvery('* * * * *', { skipImmediate: true });
  recurringJob.unique({ 'data.recurring': true });
  await recurringJob.save();
}

export { agenda };
