const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, body, query } = req;

  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(`${color}[${method}] ${originalUrl} → ${status} (${ms}ms)${reset}`);

    if (Object.keys(query).length > 0) {
      console.log('  query:', JSON.stringify(query));
    }

    if (body && Object.keys(body).length > 0) {
      const sanitized = { ...body };
      if (sanitized.password) sanitized.password = '***';
      console.log('  body:', JSON.stringify(sanitized));
    }
  });

  next();
};

module.exports = requestLogger;
