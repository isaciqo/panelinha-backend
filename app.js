require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./src/database/connection');
const container = require('./src/interfaces/http/container');
const routerRegister = require('./src/interfaces/http/presentation/RouterRegister');
const errorHandler = require('./src/interfaces/http/middlewares/errorHandler');
const setupSwagger = require('./src/interfaces/http/presentation/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));

setupSwagger(app);
routerRegister(app, container);
app.use(errorHandler);

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Panelinha API running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  });
});

module.exports = app;
