import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * @route   GET /api/notifications/unread/count
 * @desc    Get unread notification count
 * @access  Private
 * Note: This route must come before /:id to avoid treating 'unread' as an ID
 */
router.get('/unread/count', notificationController.getUnreadCount);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences for current user
 * @access  Private
 */
router.get('/preferences', notificationController.getPreferences);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences for current user
 * @access  Private
 */
router.put('/preferences', notificationController.updatePreferences);

/**
 * @route   POST /api/notifications/push-subscriptions
 * @desc    Subscribe current device for push notifications
 * @access  Private
 */
router.post('/push-subscriptions', notificationController.subscribePush);

/**
 * @route   DELETE /api/notifications/push-subscriptions
 * @desc    Unsubscribe current device from push notifications
 * @access  Private
 */
router.delete('/push-subscriptions', notificationController.unsubscribePush);

/**
 * @route   POST /api/notifications/test-push
 * @desc    Send test push notification to current user's subscribed devices
 * @access  Private
 */
router.post('/test-push', notificationController.sendTestPush);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user (with pagination and filters)
 * @query   page, limit, isRead, type, priority, sortBy, sortOrder
 * @access  Private
 */
router.get('/', notificationController.getNotifications);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get a single notification by ID
 * @access  Private
 */
router.get('/:id', notificationController.getNotificationById);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/mark-many-read
 * @desc    Mark multiple notifications as read
 * @body    { notificationIds: [id1, id2, ...] }
 * @access  Private
 */
router.put('/mark-many-read', notificationController.markManyAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for the authenticated user
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications for the authenticated user
 * @access  Private
 */
router.delete('/read', notificationController.deleteAllRead);

/**
 * @route   DELETE /api/notifications/cleanup
 * @desc    Clean up old notifications (Admin only)
 * @query   daysOld (default: 30)
 * @access  Private (Admin only)
 */
router.delete('/cleanup', adminOnly, notificationController.cleanupOldNotifications);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', notificationController.deleteNotification);

export default router;
