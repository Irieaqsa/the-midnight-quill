import nodemailer from 'nodemailer';

// Create a transporter config based on SMTP env variables
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const isGmail = host.toLowerCase().includes('gmail') || user.toLowerCase().includes('gmail');
    const transportConfig: any = {
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    };

    if (isGmail) {
      transportConfig.service = 'gmail';
      delete transportConfig.host;
      delete transportConfig.port;
    }

    return nodemailer.createTransport(transportConfig);
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

import https from 'https';

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
  const host = process.env.SMTP_HOST || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || 'The Midnight Quill <noreply@the-midnight-quill.onrender.com>';

  // Render free tier blocks standard SMTP ports (25, 465, 587) outbound.
  // If the user uses Resend (detected by host or API key prefix), we use their HTTP API on port 443.
  const isResend = host.includes('resend.com') || pass.startsWith('re_');
  const isSendGrid = host.includes('sendgrid') || pass.startsWith('SG.');

  if (isResend) {
    console.log(`Resend detected. Bypassing blocked SMTP ports and sending via HTTPS API...`);
    return new Promise<{ success: boolean; error?: any }>((resolve) => {
      const payload = JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
      });

      const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pass}`,
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Email sent via Resend API to ${to}`);
            resolve({ success: true });
          } else {
            const err = new Error(`Resend API returned ${res.statusCode}: ${data}`);
            console.error(`❌ Resend API error:`, err.message);
            resolve({ success: false, error: err });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`❌ HTTPS request error:`, err);
        resolve({ success: false, error: err });
      });

      req.write(payload);
      req.end();
    });
  }

  if (isSendGrid) {
    console.log(`SendGrid detected. Bypassing blocked SMTP ports and sending via HTTPS API...`);
    return new Promise<{ success: boolean; error?: any }>((resolve) => {
      // Extract clean email from "Name <email@domain.com>" format
      const fromEmail = from.includes('<') ? from.match(/<([^>]+)>/)?.[1] : from;
      const fromName = from.includes('<') ? from.split('<')[0].trim() : undefined;

      const payload = JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: fromName },
        subject,
        content: [
          { type: 'text/plain', value: text },
          ...(html ? [{ type: 'text/html', value: html }] : []),
        ],
      });

      const options = {
        hostname: 'api.sendgrid.com',
        port: 443,
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pass}`,
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Email sent via SendGrid API to ${to}`);
            resolve({ success: true });
          } else {
            const err = new Error(`SendGrid API returned status ${res.statusCode}: ${data}`);
            console.error(`❌ SendGrid API error:`, err.message);
            resolve({ success: false, error: err });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`❌ HTTPS SendGrid request error:`, err);
        resolve({ success: false, error: err });
      });

      req.write(payload);
      req.end();
    });
  }

  try {
    const transporter = await getTransporter();

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
      console.log(`🔗 Preview reset email at: ${nodemailer.getTestMessageUrl(info as any)}`);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
};
