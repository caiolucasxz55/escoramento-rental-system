// Nest 12 e so ESM: os @nestjs viram CommonJS no teste (arquivo proprio: dentro do jest.config o Jest acusava opcao desconhecida)
/** @type {Pick<import('jest').Config, 'transform' | 'transformIgnorePatterns'>} */
module.exports = {
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
