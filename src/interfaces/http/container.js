const path = require('path');
const awilix = require('awilix');
const { InjectionMode } = awilix;

const container = awilix.createContainer({ injectionMode: InjectionMode.PROXY });

container.loadModules(
  [
    'src/app/operations/**/*.js',
    'src/app/services/**/*.js',
    'src/infrastructure/repositories/**/*.js',
    'src/interfaces/http/presentation/**/*Controller.js',
  ],
  {
    // Os globs são relativos à raiz do backend, não à pasta de onde o node foi chamado
    cwd: path.resolve(__dirname, '../../..'),
    formatName: 'camelCase',
    resolverOptions: {
      injectionMode: InjectionMode.PROXY,
      lifetime: awilix.Lifetime.SINGLETON,
    },
  }
);

module.exports = container;
