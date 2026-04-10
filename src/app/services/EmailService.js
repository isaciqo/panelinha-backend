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
}

module.exports = EmailService;
