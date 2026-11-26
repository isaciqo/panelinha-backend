const crypto = require('crypto');
const AppError = require('../../../interfaces/http/errors/AppError');

function generateProtocol() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
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

    // O email para a equipe é o que importa: se falhar, a solicitação falha.
    try {
      await this.emailService.sendSupportEmail({
        type,
        subject,
        message,
        userName: user.name,
        userEmail: user.email,
        userId,
        protocol,
        sentAt,
      });
    } catch (err) {
      console.error('[Support] Falha ao enviar email para a equipe:', err.message);
      throw new AppError('SUPPORT_SEND_FAILED', 'Não foi possível enviar sua mensagem agora. Tente novamente.', 502);
    }

    // A confirmação para o usuário é cortesia: falha só é registrada.
    try {
      await this.emailService.sendSupportConfirmation({
        type,
        subject,
        protocol,
        userName: user.name,
        userEmail: user.email,
        sentAt,
      });
    } catch (err) {
      console.error('[Support] Falha ao enviar confirmação ao usuário:', err.message);
    }

    return { success: true, protocol };
  }
}

module.exports = SendSupportOperation;
