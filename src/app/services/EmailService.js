class EmailService {
  async sendPasswordReset(email, resetUrl) {
    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Panelinha <noreply@panelinha.app>',
        to: email,
        subject: 'Recuperação de senha - Panelinha',
        html: `
          <p>Você solicitou a recuperação de senha da sua conta Panelinha.</p>
          <p>Clique no link abaixo para redefinir sua senha. O link é válido por 1 hora.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Se você não solicitou isso, ignore este email.</p>
        `,
      });
      console.log('[EMAIL] Resend result:', JSON.stringify(result));
    } else {
      console.log(`[EMAIL DEV] Para: ${email} | Link: ${resetUrl}`);
    }
  }

  async sendSupportEmail({ type, subject, message, userName, userEmail, userId, protocol, sentAt }) {
    const adminEmail = process.env.SUPPORT_EMAIL;
    const typeLabel = type === 'support' ? 'Suporte' : 'Sugestão de Melhoria';

    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Panelinha <noreply@panelinha.app>',
        to: adminEmail,
        subject: `[Panelinha ${typeLabel}] ${subject} — Protocolo ${protocol}`,
        html: `
          <h2>Nova solicitação de ${typeLabel}</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px">
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Protocolo</td><td style="padding:8px">${protocol}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Tipo</td><td style="padding:8px">${typeLabel}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Assunto</td><td style="padding:8px">${subject}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Usuário</td><td style="padding:8px">${userName} (${userEmail})</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">User ID</td><td style="padding:8px">${userId}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Enviado em</td><td style="padding:8px">${sentAt}</td></tr>
          </table>
          <h3 style="margin-top:24px">Mensagem</h3>
          <p style="white-space:pre-wrap;background:#f9f9f9;padding:16px;border-radius:4px">${message}</p>
        `,
      });
      console.log('[EMAIL] Support email result:', JSON.stringify(result));
    } else {
      console.log(`[EMAIL DEV] Suporte para ${adminEmail} | Protocolo: ${protocol} | De: ${userName} (${userEmail}) | Tipo: ${typeLabel} | Assunto: ${subject}`);
    }
  }

  async sendSupportConfirmation({ type, subject, protocol, userName, userEmail, sentAt }) {
    const typeLabel = type === 'support' ? 'Suporte' : 'Sugestão de Melhoria';

    const bodyHtml = type === 'support'
      ? `
        <p>Olá, <strong>${userName}</strong>!</p>
        <p>Recebemos sua solicitação de suporte e já estamos analisando. Retornaremos em breve com uma resposta.</p>
        <p>Fique tranquilo(a), nossa equipe está trabalhando para resolver seu problema o mais rápido possível.</p>
      `
      : `
        <p>Olá, <strong>${userName}</strong>!</p>
        <p>Agradecemos muito pela sua sugestão! Adoramos receber ideias dos nossos usuários para tornar o Panelinha cada vez melhor.</p>
        <p>Sua ideia será analisada com carinho pela nossa equipe.</p>
      `;

    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Panelinha <noreply@panelinha.app>',
        to: userEmail,
        subject: `Recebemos sua ${typeLabel} — Protocolo ${protocol}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            ${bodyHtml}
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <table style="border-collapse:collapse;width:100%;background:#f9f9f9;border-radius:4px">
              <tr><td style="padding:8px 12px;font-weight:bold;color:#555">Protocolo</td><td style="padding:8px 12px;font-weight:bold;color:#333">${protocol}</td></tr>
              <tr><td style="padding:8px 12px;color:#555">Tipo</td><td style="padding:8px 12px">${typeLabel}</td></tr>
              <tr><td style="padding:8px 12px;color:#555">Assunto</td><td style="padding:8px 12px">${subject}</td></tr>
              <tr><td style="padding:8px 12px;color:#555">Enviado em</td><td style="padding:8px 12px">${sentAt}</td></tr>
            </table>
            <p style="margin-top:24px;color:#888;font-size:12px">
              Guarde o número do protocolo caso precise referenciar este atendimento.<br>
              Este é um email automático — por favor não responda diretamente a ele.
            </p>
          </div>
        `,
      });
      console.log('[EMAIL] Support confirmation result:', JSON.stringify(result));
    } else {
      console.log(`[EMAIL DEV] Confirmação para ${userEmail} | Protocolo: ${protocol} | Tipo: ${typeLabel}`);
    }
  }
}

module.exports = EmailService;
