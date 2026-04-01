const errorHandler = (err, req, res, next) => {
  if (err.isAppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'Dados inválidos',
      details: err.details ? err.details.map(d => d.message) : [err.message],
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'DUPLICATE_KEY',
      message: 'Registro duplicado',
    });
  }

  console.error('[Error]', err);
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
