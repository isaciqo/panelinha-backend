const { sanitize } = require('../utils/sanitize');

// eslint-disable-next-line no-unused-vars
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

  // Erros do express.json(): JSON malformado ou corpo grande demais
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'INVALID_JSON', message: 'JSON inválido no corpo da requisição' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE', message: 'Corpo da requisição muito grande' });
  }

  if (err.isJoi || err.name === 'ValidationError') {
    const details = err.details ? err.details.map(d => d.message) : [err.message];
    console.warn(`\x1b[33m[Validation] ${context}\x1b[0m`);
    console.warn('  body:', JSON.stringify(sanitize(body || {})));
    console.warn('  details:', details);
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'Dados inválidos',
      details,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Dados inválidos' });
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
