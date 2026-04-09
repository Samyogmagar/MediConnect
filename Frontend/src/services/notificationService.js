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
};

export default notificationService;
