const AppError = require('../../../interfaces/http/errors/AppError');

function generateProtocol() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `PNL-${date}-${suffix}`;
}

class SendSupportOperation {
  constructor({ userRepository, emailService }) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async execute({ type, subject, message }, userId) {
    if (!process.env.SUPPORT_EMAIL) {
      throw new AppError('SUPPORT_EMAIL_NOT_CONFIGURED', 'Suporte por email não configurado', 500);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const protocol = generateProtocol();
    const sentAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    await Promise.all([
      this.emailService.sendSupportEmail({
        type,
        subject,
        message,
        userName: user.name,
        userEmail: user.email,
        userId,
        protocol,
        sentAt,
      }),
      this.emailService.sendSupportConfirmation({
        type,
        subject,
        protocol,
        userName: user.name,
        userEmail: user.email,
        sentAt,
      }),
    ]);

    return { success: true, protocol };
  }
}

module.exports = SendSupportOperation;
