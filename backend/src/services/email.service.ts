import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !user) {
    return null; // Development mode fallback
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const from = process.env.EMAIL_FROM || '"Maison Noir Concierge" <concierge@maisonnoir.com>';
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`\n==================================================`);
    console.log(`  [DEV EMAIL PREVIEW — SMTP NOT CONFIGURED]       `);
    console.log(`  To:      ${options.to}`);
    console.log(`  From:    ${from}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  ------------------------------------------------`);
    console.log(`  HTML Content Snippet:`);
    console.log(`  ${options.html.replace(/<[^>]*>?/gm, "").slice(0, 300)}...`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ""),
    });
    console.log(`[Email Service] Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${options.to}:`, error);
    // Gracefully handle email failure without crashing application
    return false;
  }
};

/**
 * Send Password Reset Email with luxury Maison Noir HTML styling
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> => {
  const subject = "Reset your Maison Noir password";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0b0b; color: #f4f4f4; margin: 0; padding: 40px 20px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #121212; border: 1px solid #262626; padding: 40px; }
        .brand { font-size: 14px; letter-spacing: 0.4em; text-transform: uppercase; font-weight: 300; text-align: center; padding-bottom: 30px; border-bottom: 1px solid #262626; }
        .content { padding: 30px 0; font-size: 14px; line-height: 1.7; color: #a3a3a3; }
        .title { font-size: 22px; font-weight: 300; color: #ffffff; margin-bottom: 16px; letter-spacing: -0.02em; }
        .button-container { text-align: center; margin: 35px 0; }
        .button { display: inline-block; background-color: #ffffff; color: #000000; padding: 14px 32px; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; font-weight: 600; transition: background-color 0.2s; }
        .footer { font-size: 11px; color: #525252; text-align: center; padding-top: 30px; border-top: 1px solid #262626; margin-top: 30px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">MAISON&nbsp;NOIR</div>
        <div class="content">
          <div class="title">Password Reset Request</div>
          <p>Dear ${name || "Client"},</p>
          <p>We received a request to reset the password associated with your Maison Noir account. Please click the button below to set a new password:</p>
          <div class="button-container">
            <a href="${resetUrl}" class="button">RESET PASSWORD</a>
          </div>
          <p>This reset link will expire in <strong>1 hour</strong>. For security purposes, it can only be used once.</p>
          <p>If you did not request a password reset, you can safely disregard this message. Your account security remains uncompromised.</p>
        </div>
        <div class="footer">
          Paris — Milan — Tokyo<br>
          © ${new Date().getFullYear()} Maison Noir. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Account Email Verification Email
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verifyUrl: string
): Promise<boolean> => {
  const subject = "Verify your Maison Noir client account";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0b0b; color: #f4f4f4; margin: 0; padding: 40px 20px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #121212; border: 1px solid #262626; padding: 40px; }
        .brand { font-size: 14px; letter-spacing: 0.4em; text-transform: uppercase; font-weight: 300; text-align: center; padding-bottom: 30px; border-bottom: 1px solid #262626; }
        .content { padding: 30px 0; font-size: 14px; line-height: 1.7; color: #a3a3a3; }
        .title { font-size: 22px; font-weight: 300; color: #ffffff; margin-bottom: 16px; letter-spacing: -0.02em; }
        .button-container { text-align: center; margin: 35px 0; }
        .button { display: inline-block; background-color: #ffffff; color: #000000; padding: 14px 32px; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; font-weight: 600; }
        .footer { font-size: 11px; color: #525252; text-align: center; padding-top: 30px; border-top: 1px solid #262626; margin-top: 30px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">MAISON&nbsp;NOIR</div>
        <div class="content">
          <div class="title">Welcome to Maison Noir</div>
          <p>Dear ${name || "Client"},</p>
          <p>Thank you for creating an account with Maison Noir. Please verify your email address to complete your registration:</p>
          <div class="button-container">
            <a href="${verifyUrl}" class="button">VERIFY EMAIL ADDRESS</a>
          </div>
          <p>This verification link will remain active for 24 hours.</p>
        </div>
        <div class="footer">
          Paris — Milan — Tokyo<br>
          © ${new Date().getFullYear()} Maison Noir. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};
