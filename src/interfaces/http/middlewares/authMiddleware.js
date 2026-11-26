const jwt = require('jsonwebtoken');
const User = require('../../../database/models/user/userModel');

const unauthorized = (res, message) =>
  res.status(401).json({ error: 'UNAUTHORIZED', message });

/**
 * Valida o JWT e confirma que o usuário ainda existe e não trocou a senha
 * depois que o token foi emitido (troca/reset de senha derruba sessões antigas).
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Token de autorização ausente');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return unauthorized(res, 'Token inválido ou expirado');
  }

  try {
    const user = await User.findOne({ user_id: decoded.user_id })
      .select('user_id passwordChangedAt')
      .lean();

    if (!user) {
      return unauthorized(res, 'Usuário não encontrado');
    }

    if (user.passwordChangedAt && decoded.iat < Math.floor(new Date(user.passwordChangedAt).getTime() / 1000)) {
      return unauthorized(res, 'Sessão expirada após troca de senha. Entre novamente.');
    }

    req.user = decoded;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = authMiddleware;
