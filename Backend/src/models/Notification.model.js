import mongoose from 'mongoose';

/**
 * Notification Schema
 * Centralized notification system for all user activities
 */
const notificationSchema = new mongoose.Schema(
  {
    // References
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    
    // Notification Details
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: [
          'appointment_created',
          'appointment_approved',
          'appointment_rejected',
          'appointment_cancelled',
          'appointment_completed',
          'diagnostic_assigned',
          'diagnostic_in_progress',
          'diagnostic_completed',
          'diagnostic_cancelled',
          'diagnostic_report_uploaded',
          'medication_prescribed',
          'medication_discontinued',
          'medication_reminder',
          'role_application_approved',
          'role_application_rejected',
          'account_verified',
          'system_message',
        ],
        message: 'Invalid notification type',
      },
      index: true,
    },
    notificationType: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    
    // Priority
    priority: {
      type: String,
      enum: {
        values: ['low', 'normal', 'high', 'urgent'],
        message: 'Invalid priority level',
      },
      default: 'normal',
      index: true,
    },
    
    // Status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    
    // Related Resources (optional)
    relatedResource: {
      resourceType: {
        type: String,
        enum: ['Appointment', 'DiagnosticTest', 'Medication', 'RoleApplication', 'User'],
      },
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceModel: {
      type: String,
      enum: ['Appointment', 'DiagnosticTest', 'Medication', 'RoleApplication', 'User'],
    },
    
    // Action Data (optional - for clickable notifications)
    actionUrl: {
      type: String,
      trim: true,
      // e.g., "/appointments/123", "/diagnostics/456"
    },
    actionLabel: {
      type: String,
      trim: true,
      // e.g., "View Details", "Download Report"
    },
    
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      // Additional data specific to notification type
    },
    
    // Expiry (auto-delete old notifications)
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, priority: 1, isRead: 1 });

// TTL index to auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Static method to mark multiple notifications as read
notificationSchema.statics.markManyAsRead = async function (notificationIds, userId) {
  return await this.updateMany(
    {
      _id: { $in: notificationIds },
      userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );
};

// Static method to mark all user notifications as read
notificationSchema.statics.markAllAsRead = async function (userId) {
  return await this.updateMany(
    {
      userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ userId, isRead: false });
};

// Static method to delete old read notifications
notificationSchema.statics.deleteOldNotifications = async function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await this.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate },
  });
  
  return result.deletedCount;
};

// Pre-save middleware to set default expiry (90 days from now)
notificationSchema.pre('save', function () {
  if (!this.recipientId && this.userId) {
    this.recipientId = this.userId;
  }

  if (!this.userId && this.recipientId) {
    this.userId = this.recipientId;
  }

  if (!this.notificationType && this.type) {
    this.notificationType = this.type;
  }

  if (!this.type && this.notificationType) {
    this.type = this.notificationType;
  }

  if (!this.referenceId && this.relatedResource?.resourceId) {
    this.referenceId = this.relatedResource.resourceId;
  }

  if (!this.referenceModel && this.relatedResource?.resourceType) {
    this.referenceModel = this.relatedResource.resourceType;
  }

  if (!this.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days default expiry
    this.expiresAt = expiryDate;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
