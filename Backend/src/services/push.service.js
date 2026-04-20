import webpush from 'web-push';
import env from '../config/env.js';

class PushService {
  constructor() {
    this.isConfigured = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);

    if (this.isConfigured) {
      webpush.setVapidDetails(
        env.VAPID_SUBJECT || 'mailto:support@mediconnect.local',
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );
    }
  }

  isReady() {
    return this.isConfigured;
  }

  async sendNotification(subscription, payload) {
    if (!this.isConfigured) {
      return { sent: false, skipped: true, reason: 'vapid_not_configured' };
    }

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return { sent: true, skipped: false };
    } catch (error) {
      const statusCode = error?.statusCode;
      const isExpired = statusCode === 404 || statusCode === 410;

      return {
        sent: false,
        skipped: false,
        isExpired,
        statusCode,
        error: error?.body || error?.message || 'Push send failed',
      };
    }
  }
}

export default new PushService();