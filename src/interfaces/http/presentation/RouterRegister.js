const authRoutes = require('./auth/authRoutes');
const userRoutes = require('./user/userRoutes');
const eventRoutes = require('./event/eventRoutes');
const feedbackRoutes = require('./feedback/feedbackRoutes');
const supportRoutes = require('./support/supportRoutes');
const validationMiddleware = require('../middlewares/validationMiddleware');

const API_PREFIX = '/api/v1';

const registerRoutes = (app, routes, container) => {
  routes.forEach(route => {
    const [controllerName, methodName] = route.handler.split('.');
    const controller = container.resolve(controllerName);

    const middlewares = route.middlewares || [];
    const validate = validationMiddleware(route.validation);
    const fullPath = `${API_PREFIX}${route.path}`;

    app[route.method](fullPath, ...middlewares, validate, (req, res, next) => {
      Promise.resolve(controller[methodName](req, res, next)).catch(next);
    });
  });
};

const routerRegister = (app, container) => {
  registerRoutes(app, authRoutes, container);
  registerRoutes(app, userRoutes, container);
  registerRoutes(app, eventRoutes, container);
  registerRoutes(app, feedbackRoutes, container);
  registerRoutes(app, supportRoutes, container);
};

module.exports = routerRegister;
