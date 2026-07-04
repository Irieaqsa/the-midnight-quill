import nodemailer from 'nodemailer';

// Create a transporter config based on SMTP env variables
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    // Return standard production SMTP transporter
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // True for 465, false for other ports
      auth: { user, pass },
      connectionTimeout: 10000, // 10 seconds timeout
      socketTimeout: 10000,     // 10 seconds timeout
    });
  }

  // Fallback to local Ethereal Email test account in development
  console.log('⚠️ SMTP credentials missing. Generating an Ethereal Email test account...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  try {
    const transporter = await getTransporter();
    const from = process.env.SMTP_FROM || 'The Midnight Quill <noreply@the-midnight-quill.onrender.com>';

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`✉️ Email sent to ${to}. Message ID: ${info.messageId}`);
    
    // If using Ethereal in development, print the preview URL
    if (info.messageId && info.envelope && !process.env.SMTP_HOST) {
      console.log(`🔗 Preview reset email at: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
};
