require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./src/database/connection');
const container = require('./src/interfaces/http/container');
const routerRegister = require('./src/interfaces/http/presentation/RouterRegister');
const errorHandler = require('./src/interfaces/http/middlewares/errorHandler');
const requestLogger = require('./src/interfaces/http/middlewares/requestLogger');
const setupSwagger = require('./src/interfaces/http/presentation/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Atrás de proxy reverso (nginx, Render, Railway...) defina TRUST_PROXY=1 para o
// rate limit enxergar o IP real do cliente em vez do IP do proxy.
if (process.env.TRUST_PROXY) {
  const value = process.env.TRUST_PROXY;
  app.set('trust proxy', /^\d+$/.test(value) ? Number(value) : value);
}

// CORS_ORIGIN aceita uma lista separada por vírgula. Sem configuração, libera só o front local.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8080')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const rateLimitHandler = (req, res) =>
  res.status(429).json({ error: 'TOO_MANY_REQUESTS', message: 'Muitas requisições. Tente novamente em alguns minutos.' });

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
}));

// Limite mais apertado onde há risco de força bruta ou spam de email
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
app.use([
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/support',
], (req, res, next) => (req.method === 'POST' ? sensitiveLimiter(req, res, next) : next()));

app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

setupSwagger(app);
routerRegister(app, container);
app.use(errorHandler);

if (require.main === module) {
  connectDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Panelinha API running on port ${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  });
}

module.exports = app;
