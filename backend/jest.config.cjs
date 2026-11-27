// .cjs: o Node 22.18+ le config .ts sozinho e exige extensao nos imports; CommonJS carrega igual em todo Node 22

// Nest 12 e so ESM: os pacotes @nestjs viram CommonJS no teste para rodar no Node 22
/** @type {Pick<import('jest').Config, 'transform' | 'transformIgnorePatterns'>} */
const esmCompat = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        plugins: [
          // ES6: o modo padrao injeta require('url'), que colide com o `const require` do swagger-ui
          ['babel-plugin-transform-import-meta', { module: 'ES6' }],
          '@babel/plugin-transform-modules-commonjs',
        ],
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!@nestjs/)'],
};

/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  ...esmCompat,
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

module.exports = config;
module.exports.esmCompat = esmCompat;
