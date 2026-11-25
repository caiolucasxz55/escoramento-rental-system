import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// Path aliases (e.g. the ones added by `nest g library`) live in tsconfig.json,
// so they are read from there instead of being duplicated here.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

// Nest 12 e ESM-only; o Jest so carrega ESM via require no Node >= 24.9.
// Converter os pacotes @nestjs para CommonJS deixa os testes rodarem no Node 22.
export const esmCompat: Pick<Config, 'transform' | 'transformIgnorePatterns'> =
  {
    transform: {
      '^.+\\.ts$': 'ts-jest',
      '^.+\\.js$': [
        'babel-jest',
        {
          babelrc: false,
          configFile: false,
          plugins: [
            'babel-plugin-transform-import-meta',
            '@babel/plugin-transform-modules-commonjs',
          ],
        },
      ],
    },
    transformIgnorePatterns: ['/node_modules/(?!@nestjs/)'],
  };

const config: Config = {
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

export default config;
