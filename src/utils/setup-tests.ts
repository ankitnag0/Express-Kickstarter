import { cache } from '@config/cache';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

const testTypes = ['repo', 'e2e'];

const isIntegrationOrE2eTest = (testPath: string): boolean => {
  return testTypes.some((type) => testPath.includes(`.${type}.test.ts`));
};

beforeAll(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2eTest(testPath)) {
    mongoServer = await MongoMemoryServer.create();

    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
  }
});

afterAll(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2eTest(testPath)) {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
});

afterAll(async () => {
  await cache.disconnect();
});

beforeEach(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2eTest(testPath)) {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  }
});
