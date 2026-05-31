import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  await resend.emails.send({
    from: `Fintriq Support <${fromEmail}>`,
    to,
    subject: 'Reset Your Fintriq Password',
    text: `You requested a password reset. Please use the following link to reset your password: ${resetLink}\n\nThis link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.`,
    html: `
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
    `,
  });
};
