const nodemailer = require('nodemailer');

function createTransportFromEnv() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const from = process.env.MAIL_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error('SMTP config missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM');
  }

  const transport = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return { transport, from };
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const { transport, from } = createTransportFromEnv();
  await transport.sendMail({
    from,
    to,
    subject: 'Reset your password',
    text: `Click the link to reset your password: ${resetUrl}`,
    html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  });
}

module.exports = { sendPasswordResetEmail };


