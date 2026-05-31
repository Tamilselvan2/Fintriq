import nodemailer from 'nodemailer';
import logger from './logger';



const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify().then(() => {
  console.log("SMTP verified");
}).catch(error => {
  console.error("SMTP verify error:", error);
});

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  const fromEmail = process.env.EMAIL_FROM || 'support@fintriq.com';

  try {
    const info = await transporter.sendMail({
      from: `"Fintriq" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    console.error("SMTP ERROR:", error);
    logger.error(`Failed to send email to ${to}: ${error}`);
    throw error;
  }
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const subject = 'Reset Your Fintriq Password';
  const text = `You requested a password reset. Please use the following link to reset your password: ${resetLink}\n\nThis link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1e293b;">Reset Your Password</h2>
      <p>You requested a password reset. Please click the button below to set a new password:</p>
      <div style="margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${resetLink}" style="color: #3b82f6;">${resetLink}</a></p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="color: #64748b; font-size: 14px;">This link will expire in <strong>15 minutes</strong>.</p>
      <p style="color: #64748b; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.</p>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};

export const sendInvitationEmail = async (to: string, orgName: string, role: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const inviteLink = `${frontendUrl}/accept-invitation?token=${token}`;

  const subject = `You have been invited to join ${orgName} on Fintriq`;
  const text = `You have been invited to join ${orgName} as a ${role}. Please use the following link to accept your invitation: ${inviteLink}\n\nThis invitation will expire in 24 hours.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1e293b;">Join ${orgName} on Fintriq</h2>
      <p>You have been invited to join the <strong>${orgName}</strong> team as a <strong>${role}</strong>.</p>
      <p>Please click the button below to accept your invitation and set up your account:</p>
      <div style="margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${inviteLink}" style="color: #3b82f6;">${inviteLink}</a></p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="color: #64748b; font-size: 14px;">This invitation will expire in <strong>24 hours</strong>.</p>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};
