import { Resend } from 'resend';
import env from '../config/env.js';

class EmailService {
  constructor() {
    this.client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
  }

  isConfigured() {
    return Boolean(this.client && env.EMAIL_FROM);
  }

  async sendNotificationEmail({ to, subject, title, message, actionUrl, actionLabel }) {
    if (!this.isConfigured() || !to) {
      return { skipped: true, reason: 'Email service not configured or recipient missing' };
    }

    const html = this._notificationTemplate({
      title,
      message,
      actionUrl,
      actionLabel,
    });

    await this.client.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return { sent: true };
  }

  async sendPasswordResetOtp({ to, otp, appName }) {
    if (!this.isConfigured() || !to) {
      return { skipped: true, reason: 'Email service not configured or recipient missing' };
    }

    const html = this._passwordResetTemplate({ otp, appName });

    await this.client.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: `${appName || 'MediConnect'} password reset OTP`,
      html,
    });

    return { sent: true };
  }

  _notificationTemplate({ title, message, actionUrl, actionLabel }) {
    const actionBlock = actionUrl
      ? `<p style="margin:24px 0 0;"><a href="${actionUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;">${actionLabel || 'View details'}</a></p>`
      : '';

    return `
      <div style="font-family:Manrope,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:28px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
          <h2 style="margin:0 0 12px;color:#0f172a;">${title}</h2>
          <p style="margin:0;color:#334155;line-height:1.6;">${message}</p>
          ${actionBlock}
          <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
          <p style="margin:0;color:#64748b;font-size:12px;">This is an automated message from MediConnect hospital system.</p>
        </div>
      </div>
    `;
  }

  _passwordResetTemplate({ otp, appName }) {
    return `
      <div style="font-family:Manrope,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:28px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
          <h2 style="margin:0 0 12px;color:#0f172a;">Reset your ${appName || 'MediConnect'} password</h2>
          <p style="margin:0 0 16px;color:#334155;line-height:1.6;">
            Use the OTP below to verify your account. This code expires in 10 minutes.
          </p>
          <div style="font-size:24px;font-weight:700;letter-spacing:4px;color:#2563eb;">${otp}</div>
          <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
          <p style="margin:0;color:#64748b;font-size:12px;">If you did not request a password reset, you can ignore this email.</p>
        </div>
      </div>
    `;
  }
}

export default new EmailService();
