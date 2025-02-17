import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Specifies where to find your test files
  roots: ['<rootDir>/src/modules'], // All tests inside `src/modules/*/tests/`

  // Tell Jest how to match test files
  testMatch: [
    '**/tests/**/*.test.ts', // Match any `.test.ts` files under `tests/` folder
    '**/tests/**/*.spec.ts', // If you use `.spec.ts` too
  ],

  // Ensure TypeScript support
  preset: 'ts-jest', // Use `ts-jest` for TypeScript tests

  // Custom Jest transformer for TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Handles `.ts` files for Jest
  },

  // Coverage collection setup
  collectCoverage: true,
  collectCoverageFrom: [
    'src/modules/**/*.ts', // Collect coverage from all `.ts` files in `modules/`
    '!src/modules/**/*.d.ts', // Exclude TypeScript definition files
    '!src/modules/**/tests/**', // Exclude the test files themselves
  ],

  // Setup files for the environment, like your `setup-tests.ts`
  setupFilesAfterEnv: ['<rootDir>/src/utils/setup-tests.ts'],

  // Configure code coverage options
  coverageDirectory: '<rootDir>/coverage',
  coverageProvider: 'v8', // Choose coverage provider (v8 is more modern)
  coverageThreshold: {
    global: {
      branches: 80, // Minimum branches coverage threshold
      functions: 80, // Minimum functions coverage threshold
      lines: 80, // Minimum lines coverage threshold
      statements: 80, // Minimum statements coverage threshold
    },
  },

  // Test environment (default is `node`, but you may want to use `jsdom` for e2e tests)
  testEnvironment: 'node', // Change to 'jsdom' for front-end related e2e tests if necessary

  // Specify module paths for easy imports (optional)
  moduleDirectories: ['node_modules', 'src'], // Allows for absolute imports inside `src`

  // Timeout settings
  testTimeout: 10000, // Timeout for each test in ms (10 seconds)

  // Configure verbose output
  verbose: true,

  // Use `jest`'s built-in module for mocking
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // Mapping for imports
  },
};

export default config;
