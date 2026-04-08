const AppError = require('../../../interfaces/http/errors/AppError');

class ResetPasswordOperation {
  constructor({ userRepository, passwordResetTokenRepository, hashPasswordService }) {
    this.userRepository = userRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.hashPasswordService = hashPasswordService;
  }

  async execute({ token, password }) {
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

    const hashedPassword = await this.hashPasswordService.hash(password);
    await this.userRepository.update(entry.userId, { password: hashedPassword });
    await this.passwordResetTokenRepository.markUsed(entry.token_id);
  }
}

module.exports = ResetPasswordOperation;
