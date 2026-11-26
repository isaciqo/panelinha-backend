const { escapeHtml } = require('../utils/escape');

const DEFAULT_FROM = 'Panelinha <noreply@panelinha.app>';

class EmailService {
  constructor() {
    this._resend = null;
  }

  _client() {
    if (!process.env.RESEND_API_KEY) return null;
    if (!this._resend) {
      const { Resend } = require('resend');
      this._resend = new Resend(process.env.RESEND_API_KEY);
    }
    return this._resend;
  }

  /**
   * Envia o email. O SDK do Resend não lança exceção em falha — devolve { error } —
   * então convertemos isso em exceção para quem chama poder reagir.
   */
  async _send({ to, subject, html }, devLog) {
    const client = this._client();
    if (!client) {
      console.log(`[EMAIL DEV] ${devLog}`);
      return;
    }
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to,
      subject,
      html,
    });
    if (error) {
      const err = new Error(`Falha ao enviar email: ${error.message || error.name || 'erro desconhecido'}`);
      err.cause = error;
      throw err;
    }
    console.log(`[EMAIL] Enviado (${subject}) id=${data?.id}`);
  }

  async sendPasswordReset(email, resetUrl) {
    const url = escapeHtml(resetUrl);
    await this._send(
      {
        to: email,
        subject: 'Recuperação de senha - Panelinha',
        html: `
          <p>Você solicitou a recuperação de senha da sua conta Panelinha.</p>
          <p>Clique no link abaixo para redefinir sua senha. O link é válido por 1 hora.</p>
          <p><a href="${url}">${url}</a></p>
          <p>Se você não solicitou isso, ignore este email.</p>
        `,
      },
      `Para: ${email} | Link: ${resetUrl}`,
    );
  }

  async sendSupportEmail({ type, subject, message, userName, userEmail, userId, protocol, sentAt }) {
    const adminEmail = process.env.SUPPORT_EMAIL;
    const typeLabel = type === 'support' ? 'Suporte' : 'Sugestão de Melhoria';
    const e = escapeHtml;
    // Remove quebras de linha do assunto (evita bagunçar o cabeçalho do email)
    const safeSubject = String(subject).replace(/[\r\n]+/g, ' ');

    await this._send(
      {
        to: adminEmail,
        subject: `[Panelinha ${typeLabel}] ${safeSubject} — Protocolo ${protocol}`,
        html: `
          <h2>Nova solicitação de ${typeLabel}</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px">
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Protocolo</td><td style="padding:8px">${e(protocol)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Tipo</td><td style="padding:8px">${typeLabel}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Assunto</td><td style="padding:8px">${e(subject)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Usuário</td><td style="padding:8px">${e(userName)} (${e(userEmail)})</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">User ID</td><td style="padding:8px">${e(userId)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Enviado em</td><td style="padding:8px">${e(sentAt)}</td></tr>
          </table>
          <h3 style="margin-top:24px">Mensagem</h3>
          <p style="white-space:pre-wrap;background:#f9f9f9;padding:16px;border-radius:4px">${e(message)}</p>
        `,
      },
      `Suporte para ${adminEmail} | Protocolo: ${protocol} | De: ${userName} (${userEmail}) | Tipo: ${typeLabel} | Assunto: ${safeSubject}`,
    );
  }

  async sendSupportConfirmation({ type, subject, protocol, userName, userEmail, sentAt }) {
    const typeLabel = type === 'support' ? 'Suporte' : 'Sugestão de Melhoria';
    const e = escapeHtml;
    const safeSubject = String(subject).replace(/[\r\n]+/g, ' ');

    const bodyHtml = type === 'support'
      ? `
        <p>Olá, <strong>${e(userName)}</strong>!</p>
        <p>Recebemos sua solicitação de suporte e já estamos analisando. Retornaremos em breve com uma resposta.</p>
        <p>Fique tranquilo(a), nossa equipe está trabalhando para resolver seu problema o mais rápido possível.</p>
      `
      : `
        <p>Olá, <strong>${e(userName)}</strong>!</p>
        <p>Agradecemos muito pela sua sugestão! Adoramos receber ideias dos nossos usuários para tornar o Panelinha cada vez melhor.</p>
        <p>Sua ideia será analisada com carinho pela nossa equipe.</p>
      `;

    await this._send(
      {
        to: userEmail,
        subject: `Recebemos sua ${typeLabel} — Protocolo ${protocol}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            ${bodyHtml}
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <table style="border-collapse:collapse;width:100%;background:#f9f9f9;border-radius:4px">
              <tr><td style="padding:8px 12px;font-weight:bold;color:#555">Protocolo</td><td style="padding:8px 12px;font-weight:bold;color:#333">${e(protocol)}</td></tr>
              <tr><td style="padding:8px 12px;color:#555">Tipo</td><td style="padding:8px 12px">${typeLabel}</td></tr>
              <tr><td style="padding:8px 12px;color:#555">Assunto</td><td style="padding:8px 12px">${e(safeSubject)}</td></tr>
              <tr><td style="padding:8px 12px;color:#555">Enviado em</td><td style="padding:8px 12px">${e(sentAt)}</td></tr>
            </table>
            <p style="margin-top:24px;color:#888;font-size:12px">
              Guarde o número do protocolo caso precise referenciar este atendimento.<br>
              Este é um email automático — por favor não responda diretamente a ele.
            </p>
          </div>
        `,
      },
      `Confirmação para ${userEmail} | Protocolo: ${protocol} | Tipo: ${typeLabel}`,
    );
  }
}

module.exports = EmailService;
