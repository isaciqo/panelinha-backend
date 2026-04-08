const AppError = require('../../../interfaces/http/errors/AppError');

class ValidateResetTokenOperation {
  constructor({ passwordResetTokenRepository }) {
    this.passwordResetTokenRepository = passwordResetTokenRepository;
  }

  async execute({ token }) {
    const entry = await this.passwordResetTokenRepository.findByToken(token);

    if (!entry) {
      throw new AppError('INVALID_TOKEN', 'Token não encontrado', 404);
    }

    if (entry.usedAt) {
      throw new AppError('TOKEN_ALREADY_USED', 'Token já utilizado', 400);
    }

    if (new Date() > entry.expiresAt) {
      throw new AppError('TOKEN_EXPIRED', 'Token expirado', 400);
    }

    return { valid: true };
  }
}

module.exports = ValidateResetTokenOperation;
