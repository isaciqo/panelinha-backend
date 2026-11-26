const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class ForgotPasswordOperation {
  constructor({ userRepository, passwordResetTokenRepository, emailService }) {
    this.userRepository = userRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.emailService = emailService;
  }

  /**
   * Sempre termina sem erro para quem chama: responder diferente para email
   * inexistente (ou falha de envio) permitiria descobrir quem tem conta.
   */
  async execute({ email }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    await this.passwordResetTokenRepository.invalidateByUserId(user.user_id);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.passwordResetTokenRepository.create({
      token_id: uuidv4(),
      userId: user.user_id,
      token,
      expiresAt,
    });

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.emailService.sendPasswordReset(user.email, resetUrl);
    } catch (err) {
      console.error('[ForgotPassword] Falha ao enviar email de recuperação:', err.message);
    }
  }
}

module.exports = ForgotPasswordOperation;
