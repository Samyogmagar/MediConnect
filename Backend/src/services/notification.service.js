import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import MESSAGES from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';
import emailService from './email.service.js';
import pushService from './push.service.js';
import env from '../config/env.js';

/**
 * Notification Service
 * Handles all notification-related business logic
 */
class NotificationService {
  _normalizeId(value) {
    if (!value) return value;
    if (typeof value === 'object' && value._id) return value._id;
    return value;
  }

  _getPreferenceKeyForType(type) {
    if (!type) return 'system';
    if (type.startsWith('appointment_')) {
      return type.includes('cancelled') || type.includes('rejected') || type.includes('rescheduled')
        ? 'cancellations'
        : 'appointments';
    }
    if (type.startsWith('diagnostic_')) return 'labReports';
    if (type.startsWith('medication_')) {
      return type === 'medication_reminder' ? 'medicationReminders' : 'prescriptions';
    }
    if (type.startsWith('prescription_')) return 'prescriptions';
    if (type.startsWith('follow_up_')) return 'followUps';
    return 'system';
  }

  _isEventEnabled(user, type) {
    const prefs = user?.notificationPreferences || {};
    const key = this._getPreferenceKeyForType(type);
    if (typeof prefs[key] === 'boolean') return prefs[key];
    return true;
  }

  _shouldSendEmail(user, type, priority, channels) {
    const channelPrefs = user?.notificationPreferences?.channels || {};
    if (channelPrefs.email === false) return false;
    if (channels?.email === true) return true;

    // Prevent spam: only important updates are emailed by default.
    const importantTypes = new Set([
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_rejected',
      'appointment_rescheduled',
      'diagnostic_report_uploaded',
      'prescription_issued',
      'medication_prescribed',
      'medication_reminder',
      'follow_up_reminder',
      'account_verified',
    ]);

    return importantTypes.has(type) || ['high', 'urgent'].includes(priority);
  }

  _resolveActionUrl(actionUrl) {
    if (!actionUrl) return null;
    if (actionUrl.startsWith('http://') || actionUrl.startsWith('https://')) return actionUrl;
    return `${env.FRONTEND_URL}${actionUrl}`;
  }

  async _sendPushNotifications(user, notificationPayload) {
    if (!pushService.isReady()) {
      return {
        sentCount: 0,
        failedCount: 0,
        skipped: true,
        reason: 'vapid_not_configured',
      };
    }

    const subscriptions = user.pushSubscriptions || [];
    if (!subscriptions.length) {
      return {
        sentCount: 0,
        failedCount: 0,
        skipped: true,
        reason: 'no_subscriptions',
      };
    }

    let sentCount = 0;
    let failedCount = 0;
    const expiredEndpoints = [];

    for (const sub of subscriptions) {
      const result = await pushService.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys?.p256dh,
            auth: sub.keys?.auth,
          },
        },
        notificationPayload
      );

      if (result.sent) {
        sentCount += 1;
      } else {
        failedCount += 1;
        if (result.isExpired) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }

    if (expiredEndpoints.length) {
      user.pushSubscriptions = subscriptions.filter(
        (sub) => !expiredEndpoints.includes(sub.endpoint)
      );
      if (!user.pushSubscriptions.length && user.notificationPreferences?.channels) {
        user.notificationPreferences.channels.push = false;
      }
      await user.save();
    }

    return {
      sentCount,
      failedCount,
      skipped: false,
    };
  }

  /**
   * Create a new notification
   * @param {Object} notificationData - Notification details
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    const {
      recipientId,
      senderId,
      userId,
      type,
      notificationType,
      title,
      message,
      priority = 'normal',
      relatedResource,
      referenceId,
      referenceModel,
      actionUrl,
      actionLabel,
      metadata,
      expiresAt,
      channels,
    } = notificationData;

    const resolvedRecipientId = recipientId || userId;
    const resolvedType = notificationType || type;
    const resolvedReferenceId = referenceId || relatedResource?.resourceId;
    const resolvedReferenceModel = referenceModel || relatedResource?.resourceType;

    // Validate user exists
    const user = await User.findById(resolvedRecipientId);
    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    if (!this._isEventEnabled(user, resolvedType)) {
      return null;
    }

    const channelPreferences = user.notificationPreferences?.channels || {};
    const resolvedChannels = {
      inApp: channels?.inApp ?? channelPreferences.inApp ?? true,
      email: this._shouldSendEmail(user, resolvedType, priority, channels),
      push: channels?.push ?? channelPreferences.push ?? false,
    };

    let notification = null;

    if (resolvedChannels.inApp) {
      notification = await Notification.create({
        userId: resolvedRecipientId,
        recipientId: resolvedRecipientId,
        senderId,
        type: resolvedType,
        notificationType: resolvedType,
        title,
        message,
        priority,
        relatedResource,
        referenceId: resolvedReferenceId,
        referenceModel: resolvedReferenceModel,
        actionUrl,
        actionLabel,
        metadata,
        expiresAt,
        channels: resolvedChannels,
        delivery: {
          email: {
            status: resolvedChannels.email ? 'pending' : 'skipped',
          },
          push: {
            status: resolvedChannels.push ? 'pending' : 'skipped',
          },
        },
      });
    }

    if (resolvedChannels.email && user.email) {
      try {
        await emailService.sendNotificationEmail({
          to: user.email,
          subject: `[MediConnect] ${title}`,
          title,
          message,
          actionUrl: this._resolveActionUrl(actionUrl),
          actionLabel,
        });

        if (notification) {
          notification.delivery.email.status = 'sent';
          notification.delivery.email.lastAttemptAt = new Date();
          await notification.save();
        }
      } catch (error) {
        if (notification) {
          notification.delivery.email.status = 'failed';
          notification.delivery.email.error = error.message;
          notification.delivery.email.lastAttemptAt = new Date();
          await notification.save();
        }
      }
    }

    if (resolvedChannels.push) {
      const pushResult = await this._sendPushNotifications(user, {
        title,
        message,
        actionUrl: this._resolveActionUrl(actionUrl),
        actionLabel,
        type: resolvedType,
        priority,
      });

      if (notification) {
        notification.delivery.push.lastAttemptAt = new Date();

        if (pushResult.skipped) {
          notification.delivery.push.status = 'skipped';
          notification.delivery.push.error = pushResult.reason;
        } else if (pushResult.sentCount > 0) {
          notification.delivery.push.status = 'sent';
          notification.delivery.push.error = undefined;
        } else {
          notification.delivery.push.status = 'failed';
          notification.delivery.push.error = 'push_delivery_failed';
        }

        await notification.save();
      }
    }

    return notification;
  }

  /**
   * Create multiple notifications at once
   * @param {Array} notificationDataArray - Array of notification data
   * @returns {Promise<Array>} Created notifications
   */
  async createBulkNotifications(notificationDataArray) {
    if (!notificationDataArray || notificationDataArray.length === 0) {
      return [];
    }

    const notifications = [];
    for (const item of notificationDataArray) {
      const created = await this.createNotification(item);
      if (created) notifications.push(created);
    }

    return notifications;
  }

  /**
   * Get notifications for a user with pagination and filters
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Notifications with pagination
   */
  async getNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      isRead,
      type,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build query
    const query = { userId };
    
    if (typeof isRead !== 'undefined') {
      query.isRead = isRead;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query with pagination
    const [notifications, totalCount] = await Promise.all([
      Notification.find(query)
        .sort(sortOptions)
        .limit(limit)
        .skip(skip)
        .lean(),
      Notification.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      notifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  /**
   * Get a single notification by ID
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID (for authorization)
   * @returns {Promise<Object>} Notification
   */
  async getNotificationById(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error(MESSAGES.NOTIFICATION.NOT_FOUND);
    }

    // Verify user access
    if (notification.userId.toString() !== userId) {
      throw new Error(MESSAGES.NOTIFICATION.ACCESS_DENIED);
    }

    return notification;
  }

  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error(MESSAGES.NOTIFICATION.NOT_FOUND);
    }

    // Verify user access
    if (notification.userId.toString() !== userId) {
      throw new Error(MESSAGES.NOTIFICATION.ACCESS_DENIED);
    }

    // Mark as read using model method
    await notification.markAsRead();

    return notification;
  }

  /**
   * Mark multiple notifications as read
   * @param {Array} notificationIds - Array of notification IDs
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async markManyAsRead(notificationIds, userId) {
    const result = await Notification.markManyAsRead(notificationIds, userId);
    return result;
  }

  /**
   * Mark all notifications as read for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(userId) {
    const result = await Notification.markAllAsRead(userId);
    return result;
  }

  /**
   * Get unread notification count
   * @param {String} userId - User ID
   * @returns {Promise<Number>} Unread count
   */
  async getUnreadCount(userId) {
    const count = await Notification.getUnreadCount(userId);
    return count;
  }

  /**
   * Delete a notification
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error(MESSAGES.NOTIFICATION.NOT_FOUND);
    }

    // Verify user access
    if (notification.userId.toString() !== userId) {
      throw new Error(MESSAGES.NOTIFICATION.ACCESS_DENIED);
    }

    await Notification.findByIdAndDelete(notificationId);
  }

  /**
   * Delete all read notifications for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteAllRead(userId) {
    const result = await Notification.deleteMany({
      userId,
      isRead: true,
    });

    return result;
  }

  /**
   * Clean up old notifications (admin only)
   * @param {Number} daysOld - Delete notifications older than this many days
   * @returns {Promise<Number>} Number of deleted notifications
   */
  async cleanupOldNotifications(daysOld = 30) {
    const deletedCount = await Notification.deleteOldNotifications(daysOld);
    return deletedCount;
  }

  /**
   * Get user notification preferences and push subscription status.
   */
  async getPreferences(userId) {
    const user = await User.findById(userId).select('notificationPreferences pushSubscriptions');
    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    return {
      notificationPreferences: user.notificationPreferences || {},
      pushSubscriptions: user.pushSubscriptions || [],
      hasPushSubscriptions: Boolean(user.pushSubscriptions?.length),
    };
  }

  /**
   * Update user notification preferences.
   */
  async updatePreferences(userId, updates = {}) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    const allowedTopLevel = [
      'appointments',
      'cancellations',
      'prescriptions',
      'labReports',
      'medicationReminders',
      'followUps',
      'system',
    ];

    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }

    allowedTopLevel.forEach((key) => {
      if (typeof updates[key] === 'boolean') {
        user.notificationPreferences[key] = updates[key];
      }
    });

    if (updates.channels && typeof updates.channels === 'object') {
      const channels = user.notificationPreferences.channels || {};
      ['inApp', 'email', 'push'].forEach((channelKey) => {
        if (typeof updates.channels[channelKey] === 'boolean') {
          channels[channelKey] = updates.channels[channelKey];
        }
      });
      user.notificationPreferences.channels = channels;
    }

    await user.save();

    return {
      notificationPreferences: user.notificationPreferences,
    };
  }

  /**
   * Save or refresh push subscription for the current user/device.
   */
  async savePushSubscription(userId, subscription, meta = {}) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    if (!subscription?.endpoint) {
      throw new Error(MESSAGES.NOTIFICATION.PUSH_ENDPOINT_REQUIRED);
    }

    const existingIndex = (user.pushSubscriptions || []).findIndex(
      (item) => item.endpoint === subscription.endpoint
    );

    const normalized = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      },
      userAgent: meta.userAgent,
      deviceLabel: meta.deviceLabel,
      lastSeenAt: new Date(),
    };

    if (existingIndex >= 0) {
      user.pushSubscriptions[existingIndex] = {
        ...user.pushSubscriptions[existingIndex].toObject(),
        ...normalized,
      };
    } else {
      user.pushSubscriptions.push(normalized);
    }

    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }
    user.notificationPreferences.channels = {
      ...(user.notificationPreferences.channels || {}),
      push: true,
    };

    await user.save();

    return {
      subscriptions: user.pushSubscriptions,
      count: user.pushSubscriptions.length,
    };
  }

  /**
   * Remove push subscription by endpoint.
   */
  async removePushSubscription(userId, endpoint) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    if (!endpoint) {
      throw new Error(MESSAGES.NOTIFICATION.PUSH_ENDPOINT_REQUIRED);
    }

    user.pushSubscriptions = (user.pushSubscriptions || []).filter(
      (item) => item.endpoint !== endpoint
    );

    if (user.pushSubscriptions.length === 0 && user.notificationPreferences?.channels) {
      user.notificationPreferences.channels.push = false;
    }

    await user.save();

    return {
      subscriptions: user.pushSubscriptions,
      count: user.pushSubscriptions.length,
    };
  }

  /**
   * Send a test push notification to the authenticated user's active subscriptions.
   */
  async sendTestPush(userId, payload = {}) {
    const user = await User.findById(userId).select('notificationPreferences pushSubscriptions');
    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    const title = payload.title || 'MediConnect Test Notification';
    const message = payload.message || 'Push delivery is working for this device.';
    const actionUrl = this._resolveActionUrl(payload.actionUrl || '/notifications');

    const result = await this._sendPushNotifications(user, {
      title,
      message,
      actionUrl,
      actionLabel: payload.actionLabel || 'Open MediConnect',
      type: 'system_message',
      priority: 'normal',
    });

    return {
      ...result,
      title,
      message,
      actionUrl,
    };
  }

  // ===== SPECIFIC NOTIFICATION CREATORS =====

  /**
   * Notify appointment-related events
   */
  async notifyAppointmentCreated(appointmentData) {
    const { patientId, doctorId, dateTime, reason } = appointmentData;

    await this.createBulkNotifications([
      {
        userId: patientId,
        type: 'appointment_created',
        title: 'Appointment Booking Successful',
        message: `Your appointment request for ${new Date(dateTime).toLocaleString('en-GB', { 
          dateStyle: 'medium', 
          timeStyle: 'short' 
        })} has been submitted. Waiting for doctor confirmation.`,
        priority: 'normal',
        relatedResource: {
          resourceType: 'Appointment',
          resourceId: appointmentData._id,
        },
        actionUrl: `/appointments/${appointmentData._id}`,
        actionLabel: 'View Appointment',
        metadata: { dateTime, reason },
        channels: {
          email: true,
        },
      },
      {
        userId: doctorId,
        type: 'appointment_created',
        title: 'New Appointment Request',
        message: `You have a new appointment request for ${new Date(dateTime).toLocaleString('en-GB', { 
          dateStyle: 'medium', 
          timeStyle: 'short' 
        })}. Please review and confirm.`,
        priority: 'high',
        relatedResource: {
          resourceType: 'Appointment',
          resourceId: appointmentData._id,
        },
        actionUrl: `/appointments/${appointmentData._id}`,
        actionLabel: 'Review Request',
        metadata: { dateTime, reason },
      },
    ]);
  }

  async notifyAppointmentApproved(appointmentData) {
    const { patientId, dateTime } = appointmentData;

    await this.createNotification({
      userId: patientId,
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment for ${new Date(dateTime).toLocaleString('en-GB', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })} has been confirmed by the doctor.`,
      priority: 'high',
      relatedResource: {
        resourceType: 'Appointment',
        resourceId: appointmentData._id,
      },
      actionUrl: `/appointments/${appointmentData._id}`,
      actionLabel: 'View Appointment',
    });
  }

  async notifyAppointmentRejected(appointmentData, rejectionReason) {
    const { patientId, dateTime } = appointmentData;

    await this.createNotification({
      userId: patientId,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Your appointment request for ${new Date(dateTime).toLocaleString('en-GB', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })} has been cancelled by the doctor. Reason: ${rejectionReason}`,
      priority: 'normal',
      relatedResource: {
        resourceType: 'Appointment',
        resourceId: appointmentData._id,
      },
      actionUrl: `/appointments/${appointmentData._id}`,
      actionLabel: 'View Details',
      metadata: { rejectionReason },
    });
  }

  async notifyAppointmentCancelled(appointmentData, cancelledBy) {
    const { patientId, doctorId, dateTime } = appointmentData;
    
    // Notify the other party
    const recipientId = cancelledBy === patientId.toString() ? doctorId : patientId;
    const isCancelledByPatient = cancelledBy === patientId.toString();

    await this.createNotification({
      userId: recipientId,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `The appointment scheduled for ${new Date(dateTime).toLocaleString('en-GB', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })} has been cancelled by the ${isCancelledByPatient ? 'patient' : 'doctor'}.`,
      priority: 'high',
      relatedResource: {
        resourceType: 'Appointment',
        resourceId: appointmentData._id,
      },
      actionUrl: `/appointments/${appointmentData._id}`,
      actionLabel: 'View Details',
    });
  }

  async notifyAppointmentCompleted(appointmentData) {
    const { patientId, dateTime, notes } = appointmentData;

    await this.createNotification({
      userId: patientId,
      type: 'appointment_completed',
      title: 'Appointment Completed',
      message: `Your appointment from ${new Date(dateTime).toLocaleString('en-GB', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })} has been marked as completed.`,
      priority: 'normal',
      relatedResource: {
        resourceType: 'Appointment',
        resourceId: appointmentData._id,
      },
      actionUrl: `/appointments/${appointmentData._id}`,
      actionLabel: 'View Details',
      metadata: { notes },
    });
  }

  async notifyAppointmentRescheduled(appointmentData, previousDateTime, rescheduledBy, reason = '') {
    const { patientId, doctorId, dateTime } = appointmentData;
    const isByDoctor = rescheduledBy === doctorId.toString();
    const recipientId = isByDoctor ? patientId : doctorId;

    const message = `Appointment moved from ${new Date(previousDateTime).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })} to ${new Date(dateTime).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })}.${reason ? ` Reason: ${reason}` : ''}`;

    await this.createNotification({
      userId: recipientId,
      type: 'appointment_rescheduled',
      title: 'Appointment Rescheduled',
      message,
      priority: 'high',
      relatedResource: {
        resourceType: 'Appointment',
        resourceId: appointmentData._id,
      },
      actionUrl: `/appointments/${appointmentData._id}`,
      actionLabel: 'View Appointment',
      metadata: {
        previousDateTime,
        newDateTime: dateTime,
        reason,
      },
    });
  }

  /**
   * Notify diagnostic test events
   */
  async notifyDiagnosticAssigned(testData) {
    const { patientId, labId, testName, testType, instructions } = testData;

    await this.createBulkNotifications([
      {
        userId: patientId,
        type: 'diagnostic_assigned',
        title: 'Diagnostic Test Assigned',
        message: `A ${testName} (${testType}) test has been assigned to you. Please contact the lab to schedule.`,
        priority: 'high',
        relatedResource: {
          resourceType: 'DiagnosticTest',
          resourceId: testData._id,
        },
        actionUrl: `/diagnostics/${testData._id}`,
        actionLabel: 'View Test Details',
        metadata: { testName, testType, instructions },
      },
      {
        userId: labId,
        type: 'diagnostic_assigned',
        title: 'New Test Assignment',
        message: `You have been assigned a new ${testName} (${testType}) test. Patient will contact you to schedule.`,
        priority: 'high',
        relatedResource: {
          resourceType: 'DiagnosticTest',
          resourceId: testData._id,
        },
        actionUrl: `/diagnostics/${testData._id}`,
        actionLabel: 'View Assignment',
        metadata: { testName, testType },
      },
    ]);
  }

  async notifyDiagnosticCompleted(testData) {
    const { patientId, doctorId, testName } = testData;

    await this.createBulkNotifications([
      {
        userId: patientId,
        type: 'diagnostic_completed',
        title: 'Test Completed',
        message: `Your ${testName} test has been completed. Results will be available shortly.`,
        priority: 'high',
        relatedResource: {
          resourceType: 'DiagnosticTest',
          resourceId: testData._id,
        },
        actionUrl: `/diagnostics/${testData._id}`,
        actionLabel: 'View Status',
      },
      {
        userId: doctorId,
        type: 'diagnostic_completed',
        title: 'Test Completed',
        message: `The ${testName} test for your patient has been completed.`,
        priority: 'normal',
        relatedResource: {
          resourceType: 'DiagnosticTest',
          resourceId: testData._id,
        },
        actionUrl: `/diagnostics/${testData._id}`,
        actionLabel: 'View Results',
      },
    ]);
  }

  async notifyReportUploaded(testData) {
    const { patientId, doctorId, testName, report } = testData;
    const patientUserId = this._normalizeId(patientId);
    const doctorUserId = this._normalizeId(doctorId);

    await this.createBulkNotifications([
      {
        userId: patientUserId,
        type: 'diagnostic_report_uploaded',
        title: 'Test Report Available',
        message: `Your ${testName} test report is now available for download.`,
        priority: 'urgent',
        relatedResource: {
          resourceType: 'DiagnosticTest',
          resourceId: testData._id,
        },
        actionUrl: `/diagnostics/${testData._id}`,
        actionLabel: 'Download Report',
        metadata: { reportUrl: report?.url || null },
      },
      {
        userId: doctorUserId,
        type: 'diagnostic_report_uploaded',
        title: 'Test Report Uploaded',
        message: `The ${testName} test report for your patient is now available.`,
        priority: 'high',
        relatedResource: {
          resourceType: 'DiagnosticTest',
          resourceId: testData._id,
        },
        actionUrl: `/diagnostics/${testData._id}`,
        actionLabel: 'View Report',
        metadata: { reportUrl: report?.url || null },
      },
    ]);
  }

  async notifyDiagnosticCancelled(testData, cancellationReason) {
    const { patientId, labId, testName } = testData;

    await this.createBulkNotifications([
      {
        userId: patientId,
        type: 'diagnostic_cancelled',
        title: 'Test Cancelled',
        message: `Your ${testName} test has been cancelled. Reason: ${cancellationReason}`,
        priority: 'normal',
        relatedResource: {
          resourceType: 'DiagnosticTest',
          resourceId: testData._id,
        },
        actionUrl: `/diagnostics/${testData._id}`,
        actionLabel: 'View Details',
        metadata: { cancellationReason },
      },
      {
        userId: labId,
        type: 'diagnostic_cancelled',
        title: 'Test Assignment Cancelled',
        message: `The ${testName} test assignment has been cancelled. Reason: ${cancellationReason}`,
        priority: 'normal',
        relatedResource: {
          resourceType: 'DiagnosticTest',
          resourceId: testData._id,
        },
        actionUrl: `/diagnostics/${testData._id}`,
        actionLabel: 'View Details',
        metadata: { cancellationReason },
      },
    ]);
  }

  /**
   * Notify medication events
   */
  async notifyMedicationPrescribed(medicationData) {
    const { patientId, doctorId, medicationName, dosage, frequency, duration } = medicationData;
    const patientUserId = this._normalizeId(patientId);
    const doctorUserId = this._normalizeId(doctorId);

    await this.createBulkNotifications([
      {
        userId: patientUserId,
        type: 'medication_prescribed',
        title: 'New Medication Prescribed',
        message: `You have been prescribed ${medicationName} (${dosage}). Take ${frequency} for ${duration} days.`,
        priority: 'high',
        relatedResource: {
          resourceType: 'Medication',
          resourceId: medicationData._id,
        },
        actionUrl: `/medications/${medicationData._id}`,
        actionLabel: 'View Details',
        metadata: { medicationName, dosage, frequency, duration },
      },
      {
        userId: doctorUserId,
        type: 'medication_prescribed',
        title: 'Prescription Created',
        message: `You prescribed ${medicationName} (${dosage}) for your patient.`,
        priority: 'normal',
        relatedResource: {
          resourceType: 'Medication',
          resourceId: medicationData._id,
        },
        actionUrl: `/medications/${medicationData._id}`,
        actionLabel: 'View Prescription',
        metadata: { medicationName, dosage, frequency, duration },
      },
    ]);
  }

  async notifyMedicationDiscontinued(medicationData, reason) {
    const { patientId, medicationName } = medicationData;

    await this.createNotification({
      userId: patientId,
      type: 'medication_discontinued',
      title: 'Medication Discontinued',
      message: `Your medication ${medicationName} has been discontinued. Reason: ${reason}`,
      priority: 'urgent',
      relatedResource: {
        resourceType: 'Medication',
        resourceId: medicationData._id,
      },
      actionUrl: `/medications/${medicationData._id}`,
      actionLabel: 'View Details',
      metadata: { reason },
    });
  }

  async notifyMedicationReminder(reminderData, medicationData) {
    const { patientId } = reminderData;
    const { medicationName, dosage } = medicationData;

    await this.createNotification({
      userId: patientId,
      type: 'medication_reminder',
      title: 'Medication Reminder',
      message: `Time to take your medication: ${medicationName} (${dosage})`,
      priority: 'urgent',
      relatedResource: {
        resourceType: 'Medication',
        resourceId: medicationData._id,
      },
      actionUrl: `/medications/${medicationData._id}`,
      actionLabel: 'Mark as Taken',
      metadata: { medicationName, dosage, reminderId: reminderData._id },
    });
  }

  /**
   * Notify role application events
   */
  async notifyRoleApplicationApproved(userId, role) {
    await this.createNotification({
      userId,
      type: 'role_application_approved',
      title: 'Role Application Approved',
      message: `Congratulations! Your application for ${role} role has been approved. You can now access ${role} features.`,
      priority: 'urgent',
      actionUrl: '/profile',
      actionLabel: 'View Profile',
      metadata: { role },
    });
  }

  async notifyRoleApplicationRejected(userId, role, rejectionReason) {
    await this.createNotification({
      userId,
      type: 'role_application_rejected',
      title: 'Role Application Rejected',
      message: `Your application for ${role} role has been rejected. Reason: ${rejectionReason}`,
      priority: 'high',
      actionUrl: '/role-applications',
      actionLabel: 'View Application',
      metadata: { role, rejectionReason },
    });
  }

  /**
   * Notify account verification
   */
  async notifyAccountVerified(userId) {
    await this.createNotification({
      userId,
      type: 'account_verified',
      title: 'Account Verified',
      message: 'Your account has been verified by admin. You can now access all features.',
      priority: 'urgent',
      actionUrl: '/dashboard',
      actionLabel: 'Go to Dashboard',
    });
  }

  /**
   * Notify admins when a new doctor/lab user registers.
   */
  async notifyProfessionalRegistrationSubmitted(userData) {
    const { _id, name, email, role } = userData;

    if (![ROLES.DOCTOR, ROLES.LAB].includes(role)) {
      return [];
    }

    const admins = await User.find({ role: ROLES.ADMIN }).select('_id');
    if (!admins.length) {
      return [];
    }

    const roleLabel = role === ROLES.DOCTOR ? 'doctor' : 'lab admin';

    const payload = admins.map((admin) => ({
      userId: admin._id,
      type: 'system_message',
      title: 'New Professional Registration',
      message: `${name} (${email}) registered as ${roleLabel} and is awaiting verification.`,
      priority: 'high',
      relatedResource: {
        resourceType: 'User',
        resourceId: _id,
      },
      actionUrl: '/admin/pending-verifications',
      actionLabel: 'Review Request',
      metadata: {
        registeredUserId: _id,
        registeredRole: role,
      },
    }));

    return this.createBulkNotifications(payload);
  }
}

export default new NotificationService();
