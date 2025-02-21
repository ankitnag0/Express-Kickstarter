import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src/modules'],

  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts'],

  preset: 'ts-jest',

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  collectCoverage: true,
  collectCoverageFrom: [
    'src/modules/**/*.ts',
    '!src/modules/**/*.d.ts',
    '!src/modules/**/tests/**',
  ],

  setupFilesAfterEnv: ['<rootDir>/src/utils/setup-tests.ts'],

  coverageDirectory: '<rootDir>/coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  testEnvironment: 'node',

  moduleDirectories: ['node_modules', 'src'],

  testTimeout: 10000,

  verbose: true,

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};

export default config;
