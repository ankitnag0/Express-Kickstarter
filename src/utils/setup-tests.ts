import Redis from 'ioredis-mock';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
jest.mock('ioredis', () => Redis);

import { cache } from '@config/cache';

let mongoServer: MongoMemoryServer;

const testTypes = ['repo', 'e2e'];

const isIntegrationOrE2ETest = (testPath: string): boolean => {
  return testTypes.some((type) => testPath.includes(`.${type}.test.ts`));
};

beforeAll(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2ETest(testPath)) {
    mongoServer = await MongoMemoryServer.create();

    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
  }

  await cache.connect();
});

afterAll(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2ETest(testPath)) {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
  await cache.disconnect();
});

beforeEach(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2ETest(testPath)) {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  }
  await cache.flush();
});
