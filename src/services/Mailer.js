const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Helper function to get logo SVG code
function getLogoSvg() {
  return `<svg width="219" height="40" viewBox="0 0 219 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.0964 20.3536L17.6262 22.4473L17.046 27.6527L8.94876 36.8282C4.2486 33.8023 0.898178 28.8615 0 23.108L13.0964 20.3536Z" fill="#15E3FF"></path>
<path d="M25.183 25.94L31.2414 36.3789C27.992 38.6605 24.0331 40 19.7612 40C18.3744 40 17.0206 39.8587 15.7133 39.59L17.046 27.6527L20.4765 23.7656L25.183 25.94Z" fill="#348DFC"></path>
<path d="M39.1022 14.881C39.5332 16.5143 39.763 18.2294 39.763 19.9982C39.763 24.1145 38.5192 27.9403 36.3874 31.1207L25.184 25.9405L22.5551 21.4123L25.8574 17.6692L39.1022 14.881Z" fill="#FD4873"></path>
<path d="M17.046 27.6524L17.0458 27.6527L17.1686 26.552L17.046 27.6524Z" fill="#FFC700"></path>
<path d="M20.132 0C26.1505 0.109415 31.5194 2.877 35.1148 7.17842L25.8561 17.6694L20.9792 18.6959L18.519 14.4574L20.132 0Z" fill="#FFC700"></path>
<path d="M18.519 14.4574L17.9745 19.3269L13.0991 20.353L0.514709 14.5347C2.09964 8.94044 6.05794 4.3436 11.2327 1.9007L18.519 14.4574Z" fill="#00E7B9"></path>
<path d="M192.913 29.338V19.7624C192.913 14.2857 196.088 11.8746 200.228 11.8746C202.644 11.8746 204.68 12.8046 205.957 14.5957C207.233 12.8046 209.235 11.8746 211.685 11.8746C215.825 11.8746 219 14.2857 219 19.7624V29.338H213.824V19.7624C213.824 17.4891 212.72 16.6969 211.167 16.6969C209.649 16.6969 208.545 17.4891 208.545 19.7624V29.338H203.369V19.7624C203.369 17.4891 202.264 16.6969 200.746 16.6969C199.193 16.6969 198.089 17.4891 198.089 19.7624V29.338H192.913Z" fill="#002469"></path>
<path d="M182.298 29.6268C177.26 29.6268 173.878 26.7334 173.878 20.9812V12.1634H179.054V20.9812C179.054 23.6679 180.365 24.8045 182.298 24.8045C184.23 24.8045 185.541 23.6679 185.541 20.9812V12.1634H190.717V20.9812C190.717 26.699 187.336 29.6268 182.298 29.6268Z" fill="#002469"></path>
<path d="M165.073 29.627C160.69 29.627 157.861 27.2848 157.792 24.0125H162.899C162.933 24.9081 163.589 25.3559 165.004 25.3559C166.591 25.3559 167.109 24.8048 167.109 24.0814C167.109 22.9448 165.866 22.8414 164.279 22.6003C161.933 22.2559 158.068 21.6703 158.068 17.5714C158.068 14.1269 160.794 11.7158 165.038 11.7158C169.283 11.7158 171.905 14.1614 172.009 17.227H166.971C166.833 16.4347 166.142 15.9869 165.107 15.9869C163.831 15.9869 163.313 16.6414 163.313 17.3303C163.313 18.3636 164.555 18.5014 166.143 18.7425C168.592 19.087 172.354 19.7414 172.354 23.7714C172.354 27.2848 169.455 29.627 165.073 29.627Z" fill="#002469"></path>
<path d="M138.672 36.4471V20.8436C138.672 15.1258 142.536 11.7158 147.747 11.7158C153.164 11.7158 156.96 15.4014 156.96 20.8781C156.96 26.8026 152.543 29.627 148.679 29.627C146.643 29.627 144.917 28.8348 143.848 27.3192V36.4471H138.672ZM147.781 24.8048C150.128 24.8048 151.715 23.117 151.715 20.6714C151.715 18.2258 150.128 16.5381 147.781 16.5381C145.435 16.5381 143.848 18.2258 143.848 20.6714C143.848 23.117 145.435 24.8048 147.781 24.8048Z" fill="#002469"></path>
<path d="M133.324 10.6134C131.426 10.6134 130.011 9.20114 130.011 7.30668C130.011 5.41223 131.426 4 133.324 4C135.221 4 136.636 5.41223 136.636 7.30668C136.636 9.20114 135.221 10.6134 133.324 10.6134ZM130.736 29.179V12.1634H135.912V29.179H130.736Z" fill="#002469"></path>
<path d="M119.502 29.627C114.119 29.627 110.323 25.8381 110.323 20.6714C110.323 15.5047 114.119 11.7158 119.502 11.7158C124.885 11.7158 128.681 15.5047 128.681 20.6714C128.681 25.8381 124.885 29.627 119.502 29.627ZM119.502 24.8048C121.849 24.8048 123.436 23.117 123.436 20.6714C123.436 18.2258 121.849 16.5381 119.502 16.5381C117.156 16.5381 115.568 18.2258 115.568 20.6714C115.568 23.117 117.156 24.8048 119.502 24.8048Z" fill="#002469"></path>
<path d="M100.332 29.627C94.9488 29.627 91.1531 25.8381 91.1531 20.6714C91.1531 15.5047 94.9488 11.7158 100.332 11.7158C105.715 11.7158 109.511 15.5047 109.511 20.6714C109.511 25.8381 105.715 29.627 100.332 29.627ZM100.332 24.8048C102.678 24.8048 104.266 23.117 104.266 20.6714C104.266 18.2258 102.678 16.5381 100.332 16.5381C97.9854 16.5381 96.3981 18.2258 96.3981 20.6714C96.3981 23.117 97.9854 24.8048 100.332 24.8048Z" fill="#002469"></path>
<path d="M81.1619 29.627C75.7789 29.627 71.9832 25.8381 71.9832 20.6714C71.9832 15.5047 75.7789 11.7158 81.1619 11.7158C86.5449 11.7158 90.3406 15.5047 90.3406 20.6714C90.3406 25.8381 86.5449 29.627 81.1619 29.627ZM81.1619 24.8048C83.5084 24.8048 85.0957 23.117 85.0957 20.6714C85.0957 18.2258 83.5084 16.5381 81.1619 16.5381C78.8155 16.5381 77.2282 18.2258 77.2282 20.6714C77.2282 23.117 78.8155 24.8048 81.1619 24.8048Z" fill="#002469"></path>
<path d="M55 29.1791V6.6523H60.5901V24.0124H71.2526V29.1791H55Z" fill="#002469"></path>
<path d="M108.824 30.7737C108.302 35.5561 105.083 38 100.481 38C95.8755 38 92.656 35.5824 92.1365 30.7737H97.3874C97.7828 32.4472 98.9316 33.1776 100.481 33.1776C102.029 33.1776 103.178 32.4473 103.574 30.7737H108.824Z" fill="#002469"></path>
</svg>`;
}

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

async function sendPasswordResetEmail({ to, resetUrl, userName = 'Pengguna' }) {
  const { transport, from } = createTransportFromEnv();
  const logoSvg = getLogoSvg();

  // Plain text version for email clients that don't support HTML
  const text =
    `Reset Password Anda\n\n` +
    `Hi ${userName},\n\n` +
    `Kami menerima sebuah permintaan untuk reset password Anda.\n\n` +
    `Klik link berikut untuk mereset password Anda:\n${resetUrl}\n\n` +
    `Link akan kadaluarsa dalam 30 menit. Jika Anda tidak melakukan permintaan ini harap abaikan pesan ini dan jangan melakukan reset password.\n\n` +
    `Email ini dikirim secara otomatis, mohon tidak membalas email ini.\n\n` +
    `© 2025 PT Peruri Property. All rights reserved.`;

  // HTML email template matching Figma design
  const html = `
    <!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - PERURI PROPERTY</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8F9FA;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F8F9FA; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Logo Section -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
              <div style="display: inline-block; margin: 0 auto;">
                <svg width="219" height="40" viewBox="0 0 219 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.0964 20.3536L17.6262 22.4473L17.046 27.6527L8.94876 36.8282C4.2486 33.8023 0.898178 28.8615 0 23.108L13.0964 20.3536Z" fill="#15E3FF"></path>
                  <path d="M25.183 25.94L31.2414 36.3789C27.992 38.6605 24.0331 40 19.7612 40C18.3744 40 17.0206 39.8587 15.7133 39.59L17.046 27.6527L20.4765 23.7656L25.183 25.94Z" fill="#348DFC"></path>
                  <path d="M39.1022 14.881C39.5332 16.5143 39.763 18.2294 39.763 19.9982C39.763 24.1145 38.5192 27.9403 36.3874 31.1207L25.184 25.9405L22.5551 21.4123L25.8574 17.6692L39.1022 14.881Z" fill="#FD4873"></path>
                  <path d="M17.046 27.6524L17.0458 27.6527L17.1686 26.552L17.046 27.6524Z" fill="#FFC700"></path>
                  <path d="M20.132 0C26.1505 0.109415 31.5194 2.877 35.1148 7.17842L25.8561 17.6694L20.9792 18.6959L18.519 14.4574L20.132 0Z" fill="#FFC700"></path>
                  <path d="M18.519 14.4574L17.9745 19.3269L13.0991 20.353L0.514709 14.5347C2.09964 8.94044 6.05794 4.3436 11.2327 1.9007L18.519 14.4574Z" fill="#00E7B9"></path>
                  <path d="M192.913 29.338V19.7624C192.913 14.2857 196.088 11.8746 200.228 11.8746C202.644 11.8746 204.68 12.8046 205.957 14.5957C207.233 12.8046 209.235 11.8746 211.685 11.8746C215.825 11.8746 219 14.2857 219 19.7624V29.338H213.824V19.7624C213.824 17.4891 212.72 16.6969 211.167 16.6969C209.649 16.6969 208.545 17.4891 208.545 19.7624V29.338H203.369V19.7624C203.369 17.4891 202.264 16.6969 200.746 16.6969C199.193 16.6969 198.089 17.4891 198.089 19.7624V29.338H192.913Z" fill="#002469"></path>
                  <path d="M182.298 29.6268C177.26 29.6268 173.878 26.7334 173.878 20.9812V12.1634H179.054V20.9812C179.054 23.6679 180.365 24.8045 182.298 24.8045C184.23 24.8045 185.541 23.6679 185.541 20.9812V12.1634H190.717V20.9812C190.717 26.699 187.336 29.6268 182.298 29.6268Z" fill="#002469"></path>
                  <path d="M165.073 29.627C160.69 29.627 157.861 27.2848 157.792 24.0125H162.899C162.933 24.9081 163.589 25.3559 165.004 25.3559C166.591 25.3559 167.109 24.8048 167.109 24.0814C167.109 22.9448 165.866 22.8414 164.279 22.6003C161.933 22.2559 158.068 21.6703 158.068 17.5714C158.068 14.1269 160.794 11.7158 165.038 11.7158C169.283 11.7158 171.905 14.1614 172.009 17.227H166.971C166.833 16.4347 166.142 15.9869 165.107 15.9869C163.831 15.9869 163.313 16.6414 163.313 17.3303C163.313 18.3636 164.555 18.5014 166.143 18.7425C168.592 19.087 172.354 19.7414 172.354 23.7714C172.354 27.2848 169.455 29.627 165.073 29.627Z" fill="#002469"></path>
                  <path d="M138.672 36.4471V20.8436C138.672 15.1258 142.536 11.7158 147.747 11.7158C153.164 11.7158 156.96 15.4014 156.96 20.8781C156.96 26.8026 152.543 29.627 148.679 29.627C146.643 29.627 144.917 28.8348 143.848 27.3192V36.4471H138.672ZM147.781 24.8048C150.128 24.8048 151.715 23.117 151.715 20.6714C151.715 18.2258 150.128 16.5381 147.781 16.5381C145.435 16.5381 143.848 18.2258 143.848 20.6714C143.848 23.117 145.435 24.8048 147.781 24.8048Z" fill="#002469"></path>
                  <path d="M133.324 10.6134C131.426 10.6134 130.011 9.20114 130.011 7.30668C130.011 5.41223 131.426 4 133.324 4C135.221 4 136.636 5.41223 136.636 7.30668C136.636 9.20114 135.221 10.6134 133.324 10.6134ZM130.736 29.179V12.1634H135.912V29.179H130.736Z" fill="#002469"></path>
                  <path d="M119.502 29.627C114.119 29.627 110.323 25.8381 110.323 20.6714C110.323 15.5047 114.119 11.7158 119.502 11.7158C124.885 11.7158 128.681 15.5047 128.681 20.6714C128.681 25.8381 124.885 29.627 119.502 29.627ZM119.502 24.8048C121.849 24.8048 123.436 23.117 123.436 20.6714C123.436 18.2258 121.849 16.5381 119.502 16.5381C117.156 16.5381 115.568 18.2258 115.568 20.6714C115.568 23.117 117.156 24.8048 119.502 24.8048Z" fill="#002469"></path>
                  <path d="M100.332 29.627C94.9488 29.627 91.1531 25.8381 91.1531 20.6714C91.1531 15.5047 94.9488 11.7158 100.332 11.7158C105.715 11.7158 109.511 15.5047 109.511 20.6714C109.511 25.8381 105.715 29.627 100.332 29.627ZM100.332 24.8048C102.678 24.8048 104.266 23.117 104.266 20.6714C104.266 18.2258 102.678 16.5381 100.332 16.5381C97.9854 16.5381 96.3981 18.2258 96.3981 20.6714C96.3981 23.117 97.9854 24.8048 100.332 24.8048Z" fill="#002469"></path>
                  <path d="M81.1619 29.627C75.7789 29.627 71.9832 25.8381 71.9832 20.6714C71.9832 15.5047 75.7789 11.7158 81.1619 11.7158C86.5449 11.7158 90.3406 15.5047 90.3406 20.6714C90.3406 25.8381 86.5449 29.627 81.1619 29.627ZM81.1619 24.8048C83.5084 24.8048 85.0957 23.117 85.0957 20.6714C85.0957 18.2258 83.5084 16.5381 81.1619 16.5381C78.8155 16.5381 77.2282 18.2258 77.2282 20.6714C77.2282 23.117 78.8155 24.8048 81.1619 24.8048Z" fill="#002469"></path>
                  <path d="M55 29.1791V6.6523H60.5901V24.0124H71.2526V29.1791H55Z" fill="#002469"></path>
                  <path d="M108.824 30.7737C108.302 35.5561 105.083 38 100.481 38C95.8755 38 92.656 35.5824 92.1365 30.7737H97.3874C97.7828 32.4472 98.9316 33.1776 100.481 33.1776C102.029 33.1776 103.178 32.4473 103.574 30.7737H108.824Z" fill="#002469"></path>
                </svg>
              </div>
            </td>
          </tr>
          
          <!-- Blue Header Bar with Title -->
          <tr>
            <td style="padding: 20px 40px; background-color: #2F70FF; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">Reset Password</h1>
            </td>
          </tr>
          
          <!-- Main Content Section -->
          <tr>
            <td style="padding: 40px 40px 30px; background-color: #ffffff;">
              <!-- Greeting -->
              <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a1a1a; line-height: 1.5;">Hi ${userName},</p>
              
              <!-- Instruction Text -->
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #1a1a1a;">
                Kami menerima sebuah permintaan untuk reset password Anda.
              </p>
              
              <!-- Reset Password Button -->
              <table role="presentation" style="width: 100%; margin: 0 0 32px;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="#" style="display: inline-block; padding: 14px 40px; background-color: #2F70FF; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; text-align: center;">Reset Password</a>
                  </td>
                </tr>
              </table>
              
              <!-- Expiration Notice -->
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #1a1a1a;">
                Link akan kadaluarsa dalam <strong style="font-weight: 700;">30 menit</strong>. Jika Anda tidak melakukan permintaan ini harap abaikan pesan ini dan jangan melakukan reset password.
              </p>
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f3f4f6; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                © 2025 PT Peruri Property. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>


  `;

  await transport.sendMail({
    from,
    to,
    subject: 'Reset Password - PERURI PROPERTY',
    text,
    html
  });
}

async function sendTenantPaymentDueSoonEmail({ to, tenantName, tenantCode, paymentId, amount, deadline, daysLeft }) {
  const { transport, from } = createTransportFromEnv();
  const logoSvg = getLogoSvg();
  const subject = `Pengingat Pembayaran: tersisa ${daysLeft} hari`;

  const safeTenant = tenantName || tenantCode || 'Tenant';
  const safeAmount = amount != null ? Number(amount) : 0;

  // Format date to Indonesian format (e.g., "29 Desember 2025")
  const formatIndonesianDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Format amount to Indonesian Rupiah format (e.g., "Rp10.000.000")
  const formatRupiah = (num) => {
    if (num == null || isNaN(num)) return 'Rp0';
    return 'Rp' + Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const deadlineStr = formatIndonesianDate(deadline);
  const formattedAmount = formatRupiah(safeAmount);

  // Payment instructions and contact info from environment variables
  const bankAccount = process.env.PAYMENT_BANK_ACCOUNT || '1234567890';
  const bankAccountName = process.env.PAYMENT_BANK_ACCOUNT_NAME || 'PT Peruri Property';
  const paymentEmail = process.env.PAYMENT_EMAIL || 'payment@peruriproperty.com';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@peruriproperty.com';
  const supportPhone = process.env.SUPPORT_PHONE || '+62 21 1234 5678';

  const text =
    `Halo ${safeTenant},\n\n` +
    `Kami ingin mengingatkan Anda mengenai pembayaran sewa yang akan jatuh tempo.\n\n` +
    `Tanggal Jatuh Tempo: ${deadlineStr}\n` +
    `Nominal yang harus dibayar: ${formattedAmount}\n` +
    `ID Pembayaran: ${paymentId}\n\n` +
    `Cara Pembayaran:\n` +
    `1. Transfer ke rekening perusahaan: ${bankAccount} a.n ${bankAccountName}\n` +
    `2. Gunakan ID Pembayaran sebagai berita acara transfer\n` +
    `3. Kirim bukti transfer ke email: ${paymentEmail}\n\n` +
    `Jika Anda memiliki pertanyaan, silakan hubungi tim kami di:\n` +
    `Email: ${supportEmail}\n` +
    `Telepon: ${supportPhone}\n\n` +
    `Terima kasih.`;

  // HTML email template matching the design (table-based for email client compatibility)
  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder - PERURI PROPERTY</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-collapse: collapse;">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 40px; background-color: #ffffff; text-align: center;">
                  <div style="display: inline-block; margin: 0 auto;">
                    ${logoSvg}
                  </div>
                </td>
              </tr>

              <!-- Main Content (Blue Background) -->
              <tr>
                <td style="padding: 40px; background-color: #2563eb;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 24px; font-weight: bold; color: #ffffff; line-height: 1.3;">Hi ${safeTenant},</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 30px 0;">
                        <div style="font-size: 16px; color: #ffffff; line-height: 1.5; padding-right: 20px;">
                          Kami ingin mengingatkan Anda mengenai pembayaran sewa yang akan jatuh tempo.
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Payment Details Card (White Card) -->
                    <tr>
                      <td style="padding: 0;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px;">
                          <tr>
                            <td style="padding: 30px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <!-- Due Date Row -->
                                <tr>
                                  <td style="padding: 0 0 20px; border-bottom: 1px solid #e5e7eb;">
                                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                      <tr>
                                        <td style="padding: 0; vertical-align: middle;">
                                          <span style="font-size: 14px; color: #6b7280;">Tanggal Jatuh Tempo</span>
                                        </td>
                                        <td style="padding: 0; text-align: right; vertical-align: middle;">
                                          <span style="font-size: 16px; font-weight: bold; color: #1a365d;">${deadlineStr}</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                
                                <!-- Payment ID Row -->
                                <tr>
                                  <td style="padding: 0 0 20px; border-bottom: 1px solid #e5e7eb;">
                                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                      <tr>
                                        <td style="padding: 0; vertical-align: middle;">
                                          <span style="font-size: 14px; color: #6b7280;">ID Pembayaran</span>
                                        </td>
                                        <td style="padding: 0; text-align: right; vertical-align: middle;">
                                          <span style="font-size: 16px; font-weight: bold; color: #1a365d;">${paymentId}</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                
                                <!-- Amount Section -->
                                <tr>
                                  <td style="padding: 20px 0; border-bottom: 1px solid #e5e7eb; text-align: center;">
                                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Nominal yang harus dibayar</div>
                                    <div style="font-size: 36px; font-weight: bold; color: #2563eb; line-height: 1.2;">${formattedAmount}</div>
                                  </td>
                                </tr>
                                
                                <!-- Payment Note -->
                                <tr>
                                  <td style="padding: 20px 0 0; text-align: center;">
                                    <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
                                      Harap dibayar sebelum tanggal jatuh tempo
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Payment Instructions Section -->
              <tr>
                <td style="padding: 40px; background-color: #ffffff;">
                  <div style="font-size: 18px; font-weight: bold; color: #1a365d; margin-bottom: 24px;">Cara Pembayaran:</div>
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 0 0 20px; vertical-align: top;">
                        <table role="presentation" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 0 16px 0 0; vertical-align: top;">
                              <table role="presentation" style="width: 32px; height: 32px; background-color: #2563eb; border-radius: 50%; border-collapse: collapse;">
                                <tr>
                                  <td style="text-align: center; vertical-align: middle; padding: 0; height: 32px; width: 32px;">
                                    <span style="font-size: 14px; font-weight: bold; color: #ffffff; line-height: 1;">1</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding: 0; vertical-align: top;">
                              <div style="font-size: 14px; color: #374151; line-height: 1.6;">
                                Transfer ke rekening perusahaan: <strong>${bankAccount}</strong> a.n ${bankAccountName}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 20px; vertical-align: top;">
                        <table role="presentation" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 0 16px 0 0; vertical-align: top;">
                              <table role="presentation" style="width: 32px; height: 32px; background-color: #2563eb; border-radius: 50%; border-collapse: collapse;">
                                <tr>
                                  <td style="text-align: center; vertical-align: middle; padding: 0; height: 32px; width: 32px;">
                                    <span style="font-size: 14px; font-weight: bold; color: #ffffff; line-height: 1;">2</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding: 0; vertical-align: top;">
                              <div style="font-size: 14px; color: #374151; line-height: 1.6;">
                                Gunakan ID Pembayaran sebagai berita acara transfer
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0; vertical-align: top;">
                        <table role="presentation" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 0 16px 0 0; vertical-align: top;">
                              <table role="presentation" style="width: 32px; height: 32px; background-color: #2563eb; border-radius: 50%; border-collapse: collapse;">
                                <tr>
                                  <td style="text-align: center; vertical-align: middle; padding: 0; height: 32px; width: 32px;">
                                    <span style="font-size: 14px; font-weight: bold; color: #ffffff; line-height: 1;">3</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding: 0; vertical-align: top;">
                              <div style="font-size: 14px; color: #374151; line-height: 1.6;">
                                Kirim bukti transfer ke email: <a href="mailto:${paymentEmail}" style="color: #2563eb; text-decoration: none;">${paymentEmail}</a>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Contact Information Section -->
              <tr>
                <td style="padding: 0 40px 40px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px;">
                    <tr>
                      <td style="padding: 0 0 20px;">
                        <div style="font-size: 14px; color: #374151; line-height: 1.6;">
                          Jika Anda memiliki pertanyaan, silakan hubungi tim kami di:
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 12px;">
                        <a href="mailto:${supportEmail}" style="font-size: 14px; color: #2563eb; text-decoration: none;">${supportEmail}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0;">
                        <span style="font-size: 14px; color: #2563eb;">${supportPhone}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f3f4f6; text-align: center;">
                  <div style="font-size: 12px; color: #6b7280; line-height: 1.8;">
                    Email ini dikirim secara otomatis, mohon tidak membalas email ini.<br>
                    © 2025 PT Peruri Property. All rights reserved.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendPasswordResetEmail, sendTenantPaymentDueSoonEmail };


