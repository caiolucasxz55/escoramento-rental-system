const esmCompat = require('../jest.esm-compat.cjs');

/** @type {import('jest').Config} */
module.exports = {
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
