import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Create a global variable to store the MongoDB server instance
let mongoServer: MongoMemoryServer;

// Check if the test is an integration or e2e test
const testTypes = ['repo', 'e2e'];

const isIntegrationOrE2eTest = (testPath: string): boolean => {
  // Check if the test path contains any of the test types in the array
  return testTypes.some((type) => testPath.includes(`.${type}.test.ts`));
};

beforeAll(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2eTest(testPath)) {
    // Start an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();

    // Get the URI of the in-memory MongoDB server
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory MongoDB server using Mongoose
    await mongoose.connect(mongoUri);
  }
});

afterAll(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2eTest(testPath)) {
    // Disconnect Mongoose from the in-memory server
    await mongoose.disconnect();

    // Stop the in-memory MongoDB server
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  const testPath = expect.getState().testPath;

  if (testPath && isIntegrationOrE2eTest(testPath)) {
    // Clear the database before each integration/e2e test
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  }
});
