const { sanitize } = require('../utils/sanitize');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const { method, originalUrl, body, query } = req;
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(`${color}[${method}] ${originalUrl} → ${status} (${ms}ms)${reset}`);

    if (query && Object.keys(query).length > 0) {
      console.log('  query:', JSON.stringify(sanitize(query)));
    }

    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      console.log('  body:', JSON.stringify(sanitize(body)));
    }
  });

  next();
};

module.exports = requestLogger;
