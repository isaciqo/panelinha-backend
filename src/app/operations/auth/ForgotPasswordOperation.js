const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const AppError = require('../../../interfaces/http/errors/AppError');

class ForgotPasswordOperation {
  constructor({ userRepository, passwordResetTokenRepository, emailService }) {
    this.userRepository = userRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.emailService = emailService;
  }

  async execute({ email }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('EMAIL_NOT_FOUND', 'Email não cadastrado', 404);
    }

    await this.passwordResetTokenRepository.invalidateByUserId(user.user_id);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.passwordResetTokenRepository.create({
      token_id: uuidv4(),
      userId: user.user_id,
      token,
      expiresAt,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.sendPasswordReset(user.email, resetUrl);
  }
}

module.exports = ForgotPasswordOperation;
