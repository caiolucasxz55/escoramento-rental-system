// .cjs: o Node 22.18+ le config .ts sozinho e exige extensao nos imports; CommonJS carrega igual em todo Node 22
const esmCompat = require('./jest.esm-compat.cjs');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  ...esmCompat,
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
