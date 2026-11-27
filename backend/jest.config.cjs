// CommonJS de proposito: o Node 22.18+ le .ts sozinho e exige extensao nos imports,
// o 22.13 nao; .cjs carrega igual em qualquer versao
const { pathsToModuleNameMapper } = require('ts-jest');
const ts = require('typescript');

// Path aliases (e.g. the ones added by `nest g library`) live in tsconfig.json,
// so they are read from there instead of being duplicated here.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

// Nest 12 e ESM-only; o Jest so carrega ESM via require no Node >= 24.9.
// Converter os pacotes @nestjs para CommonJS deixa os testes rodarem no Node 22.
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
          // ES6: importa `url` no topo; o modo padrao injeta require('url'),
          // que colide com modulos que declaram `const require` (swagger-ui)
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
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    'apps/**/*.(t|j)s',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

module.exports = config;
module.exports.esmCompat = esmCompat;
