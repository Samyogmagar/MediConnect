import notificationService from '../services/notification.service.js';
import MESSAGES from '../constants/messages.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

/**
 * Notification Controller
 * Handles HTTP requests for notification operations
 */
class NotificationController {
  /**
   * Get all notifications for the authenticated user
   * @route GET /api/notifications
   * @access Private
   */
  async getNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const {
        page = 1,
        limit = 20,
        isRead,
        type,
        priority,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Parse isRead to boolean if provided
      let isReadBoolean;
      if (typeof isRead !== 'undefined') {
        isReadBoolean = isRead === 'true';
      }

      const result = await notificationService.getNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        isRead: isReadBoolean,
        type,
        priority,
        sortBy,
        sortOrder,
      });

      return successResponse(res, 200, MESSAGES.NOTIFICATION.FETCH_SUCCESS, result);
    } catch (error) {
      console.error('Get notifications error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get a single notification by ID
   * @route GET /api/notifications/:id
   * @access Private
   */
  async getNotificationById(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const notification = await notificationService.getNotificationById(id, userId);

      return successResponse(res, 200, MESSAGES.NOTIFICATION.FETCH_SUCCESS, { notification });
    } catch (error) {
      console.error('Get notification by ID error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get unread notification count
   * @route GET /api/notifications/unread/count
   * @access Private
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.userId;

      const unreadCount = await notificationService.getUnreadCount(userId);

      return successResponse(
        res,
        200,
        MESSAGES.NOTIFICATION.UNREAD_COUNT_SUCCESS,
        { unreadCount }
      );
    } catch (error) {
      console.error('Get unread count error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Mark a notification as read
   * @route PUT /api/notifications/:id/read
   * @access Private
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const notification = await notificationService.markAsRead(id, userId);

      return successResponse(res, 200, MESSAGES.NOTIFICATION.MARKED_AS_READ, { notification });
    } catch (error) {
      console.error('Mark as read error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Mark multiple notifications as read
   * @route PUT /api/notifications/mark-many-read
   * @access Private
   */
  async markManyAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { notificationIds } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return errorResponse(res, 400, 'notificationIds array is required');
      }

      const result = await notificationService.markManyAsRead(
        notificationIds,
        userId
      );

      return successResponse(
        res,
        200,
        MESSAGES.NOTIFICATION.MARKED_AS_READ,
        {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
        }
      );
    } catch (error) {
      console.error('Mark many as read error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Mark all notifications as read
   * @route PUT /api/notifications/mark-all-read
   * @access Private
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;

      const result = await notificationService.markAllAsRead(userId);

      return successResponse(
        res,
        200,
        MESSAGES.NOTIFICATION.MARKED_ALL_AS_READ,
        {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
        }
      );
    } catch (error) {
      console.error('Mark all as read error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Delete a notification
   * @route DELETE /api/notifications/:id
   * @access Private
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      await notificationService.deleteNotification(id, userId);

      return successResponse(res, 200, MESSAGES.NOTIFICATION.DELETED);
    } catch (error) {
      console.error('Delete notification error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Delete all read notifications
   * @route DELETE /api/notifications/read
   * @access Private
   */
  async deleteAllRead(req, res) {
    try {
      const userId = req.user.userId;

      const result = await notificationService.deleteAllRead(userId);

      return successResponse(
        res,
        200,
        MESSAGES.NOTIFICATION.DELETED,
        { deletedCount: result.deletedCount }
      );
    } catch (error) {
      console.error('Delete all read error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Clean up old notifications (Admin only)
   * @route DELETE /api/notifications/cleanup
   * @access Private (Admin only)
   */
  async cleanupOldNotifications(req, res) {
    try {
      const { daysOld = 30 } = req.query;

      const deletedCount = await notificationService.cleanupOldNotifications(
        parseInt(daysOld)
      );

      return successResponse(
        res,
        200,
        `Deleted ${deletedCount} old notifications`,
        { deletedCount }
      );
    } catch (error) {
      console.error('Cleanup old notifications error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get notification preferences for authenticated user
   * @route GET /api/notifications/preferences
   * @access Private
   */
  async getPreferences(req, res) {
    try {
      const userId = req.user.userId;
      const result = await notificationService.getPreferences(userId);

      return successResponse(
        res,
        200,
        MESSAGES.NOTIFICATION.PREFERENCES_FETCH_SUCCESS,
        result
      );
    } catch (error) {
      console.error('Get notification preferences error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Update notification preferences for authenticated user
   * @route PUT /api/notifications/preferences
   * @access Private
   */
  async updatePreferences(req, res) {
    try {
      const userId = req.user.userId;
      const result = await notificationService.updatePreferences(userId, req.body || {});

      return successResponse(
        res,
        200,
        MESSAGES.NOTIFICATION.PREFERENCES_UPDATED,
        result
      );
    } catch (error) {
      console.error('Update notification preferences error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Subscribe current device for push notifications
   * @route POST /api/notifications/push-subscriptions
   * @access Private
   */
  async subscribePush(req, res) {
    try {
      const userId = req.user.userId;
      const { subscription, deviceLabel } = req.body || {};

      if (!subscription) {
        return errorResponse(res, 400, MESSAGES.NOTIFICATION.PUSH_SUBSCRIPTION_REQUIRED);
      }

      const result = await notificationService.savePushSubscription(userId, subscription, {
        deviceLabel,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, 200, MESSAGES.NOTIFICATION.PUSH_SUBSCRIBED, result);
    } catch (error) {
      console.error('Subscribe push error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Unsubscribe current device from push notifications
   * @route DELETE /api/notifications/push-subscriptions
   * @access Private
   */
  async unsubscribePush(req, res) {
    try {
      const userId = req.user.userId;
      const { endpoint } = req.body || {};

      if (!endpoint) {
        return errorResponse(res, 400, MESSAGES.NOTIFICATION.PUSH_ENDPOINT_REQUIRED);
      }

      const result = await notificationService.removePushSubscription(userId, endpoint);
      return successResponse(res, 200, MESSAGES.NOTIFICATION.PUSH_UNSUBSCRIBED, result);
    } catch (error) {
      console.error('Unsubscribe push error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Send test push notification to current user's active subscriptions.
   * @route POST /api/notifications/test-push
   * @access Private
   */
  async sendTestPush(req, res) {
    try {
      const userId = req.user.userId;
      const result = await notificationService.sendTestPush(userId, req.body || {});

      return successResponse(res, 200, MESSAGES.NOTIFICATION.TEST_PUSH_SENT, result);
    } catch (error) {
      console.error('Test push error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }
}

export default new NotificationController();
