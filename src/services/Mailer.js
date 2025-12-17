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

async function sendTenantPaymentDueSoonEmail({ to, tenantName, tenantCode, paymentId, amount, deadline, daysLeft }) {
  const { transport, from } = createTransportFromEnv();
  const subject = `Pengingat Pembayaran: tersisa ${daysLeft} hari`;

  const deadlineStr = deadline ? new Date(deadline).toISOString().slice(0, 10) : '-';
  const safeTenant = tenantName || tenantCode || 'Tenant';
  const safeAmount = amount != null ? String(amount) : '-';

  const text =
    `Halo ${safeTenant},\n\n` +
    `Ini adalah pengingat bahwa pembayaran Anda akan segera jatuh tempo.\n\n` +
    `ID Pembayaran: ${paymentId}\n` +
    `Jumlah: ${safeAmount}\n` +
    `Batas Akhir Pembayaran: ${deadlineStr}\n` +
    `Sisa Hari: ${daysLeft}\n\n` +
    `Terima kasih.`;

  const html =
    `<p>Halo <b>${safeTenant}</b>,</p>` +
    `<p>Ini adalah pengingat bahwa pembayaran Anda akan segera jatuh tempo.</p>` +
    `<ul>` +
    `<li><b>ID Pembayaran</b>: ${paymentId}</li>` +
    `<li><b>Jumlah</b>: ${safeAmount}</li>` +
    `<li><b>Batas Akhir Pembayaran</b>: ${deadlineStr}</li>` +
    `<li><b>Sisa Hari</b>: ${daysLeft}</li>` +
    `</ul>` +
    `<p>Terima kasih.</p>`;

  await transport.sendMail({ from, to, subject, text, html });
}

module.exports = { sendPasswordResetEmail, sendTenantPaymentDueSoonEmail };


