import type { Config } from 'jest';
import { esmCompat } from '../jest.config';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  ...esmCompat,
  testEnvironment: 'node',
  globalSetup: '<rootDir>/test/support/global-setup.ts',
  globalTeardown: '<rootDir>/test/support/global-teardown.ts',
  setupFiles: ['<rootDir>/test/support/setup-env.ts'],
  // primeira execucao baixa o binario do Mongo
  testTimeout: 60_000,
};

export default config;
