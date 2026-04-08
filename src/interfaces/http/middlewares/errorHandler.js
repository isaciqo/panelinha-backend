const errorHandler = (err, req, res, next) => {
  const { method, originalUrl, body } = req;
  const context = `[${method}] ${originalUrl}`;

  if (err.isAppError) {
    console.warn(`\x1b[33m[AppError] ${context} → ${err.statusCode} ${err.code}: ${err.message}\x1b[0m`);
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  if (err.isJoi || err.name === 'ValidationError') {
    const details = err.details ? err.details.map(d => d.message) : [err.message];
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '***';
    console.warn(`\x1b[33m[Validation] ${context}\x1b[0m`);
    console.warn('  body:', JSON.stringify(sanitized));
    console.warn('  details:', details);
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'Dados inválidos',
      details,
    });
  }

  if (err.code === 11000) {
    console.warn(`\x1b[33m[DuplicateKey] ${context}\x1b[0m`, err.keyValue);
    return res.status(409).json({
      error: 'DUPLICATE_KEY',
      message: 'Registro duplicado',
    });
  }

  console.error(`\x1b[31m[UnhandledError] ${context}\x1b[0m`, err);
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
