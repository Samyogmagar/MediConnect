import API from '../config/api';

/**
 * Notification service — handles all notification API calls
 * Backend base: /api/notifications
 */
const notificationService = {
  /**
   * Get all notifications (paginated, filtered)
   * @param {Object} params - { page?, limit?, isRead?, type?, sortBy?, sortOrder? }
   */
  async getNotifications(params = {}) {
    const response = await API.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get a single notification by ID
   * @param {string} id
   */
  async getNotificationById(id) {
    const response = await API.get(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await API.get('/notifications/unread/count');
    return response.data;
  },

  /**
   * Mark a single notification as read
   * @param {string} id
   */
  async markAsRead(id) {
    const response = await API.put(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await API.put('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Delete a notification
   * @param {string} id
   */
  async deleteNotification(id) {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Get notification preferences and push subscription info for current user.
   */
  async getPreferences() {
    const response = await API.get('/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences for current user.
   */
  async updatePreferences(preferences) {
    const response = await API.put('/notifications/preferences', preferences);
    return response.data;
  },

  /**
   * Store web push subscription for this device.
   */
  async subscribePush(subscription, deviceLabel) {
    const response = await API.post('/notifications/push-subscriptions', {
      subscription,
      deviceLabel,
    });
    return response.data;
  },

  /**
   * Remove web push subscription for this device.
   */
  async unsubscribePush(endpoint) {
    const response = await API.delete('/notifications/push-subscriptions', {
      data: { endpoint },
    });
    return response.data;
  },

  /**
   * Trigger backend test push notification for current user subscriptions.
   */
  async sendTestPush(payload = {}) {
    const response = await API.post('/notifications/test-push', payload);
    return response.data;
  },

  /**
   * Request browser permission, create push subscription, and persist it in backend.
   */
  async enablePushOnCurrentDevice() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications are not supported on this browser.');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission was not granted.');
    }

    const swRegistration = await navigator.serviceWorker.register('/push-sw.js');
    const existing = await swRegistration.pushManager.getSubscription();
    if (existing) {
      await this.subscribePush(existing.toJSON(), 'Current Device');
      return existing.toJSON();
    }

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error('Missing VITE_VAPID_PUBLIC_KEY for push subscription.');
    }

    const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    await this.subscribePush(subscription.toJSON(), 'Current Device');
    return subscription.toJSON();
  },

  /**
   * Unsubscribe current device from push and remove server-side subscription.
   */
  async disablePushOnCurrentDevice() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration('/push-sw.js');
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await this.unsubscribePush(endpoint);
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  },
};

export default notificationService;
