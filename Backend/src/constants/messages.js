/**
 * Standardized API response messages
 */
const MESSAGES = {
  // Authentication
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    PENDING_VERIFICATION: 'Account pending admin approval',
    INVALID_CREDENTIALS: 'Invalid email or password',
    INACTIVE_ACCOUNT: 'Your account is inactive. Please contact the hospital administrator.',
    UNAUTHORIZED: 'Unauthorized access',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid authentication token',
    TOKEN_REQUIRED: 'Authentication token is required',
    SOCIAL_PROVIDER_UNSUPPORTED: 'Unsupported social login provider',
    SOCIAL_PROVIDER_NOT_CONFIGURED: 'This social login provider is not configured yet',
    SOCIAL_PROVIDER_DISABLED: 'This social login provider is disabled by server configuration',
    SOCIAL_AUTH_CODE_REQUIRED: 'Authorization code is required for social login',
    SOCIAL_AUTH_STATE_REQUIRED: 'State token is required for social login',
    SOCIAL_AUTH_STATE_INVALID: 'Invalid or expired social login state token',
    SOCIAL_AUTH_FAILED: 'Unable to complete social login at this time',
    SOCIAL_AUTH_EMAIL_REQUIRED: 'Your social account must provide an email address',
    SOCIAL_AUTH_ACCOUNT_ROLE_CONFLICT: 'This email is already linked to a non-patient account. Use standard login or contact admin.',
  },

  // User
  USER: {
    NOT_FOUND: 'User not found',
    ALREADY_EXISTS: 'User with this email already exists',
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
  },

  // Validation
  VALIDATION: {
    EMAIL_REQUIRED: 'Email is required',
    PASSWORD_REQUIRED: 'Password is required',
    CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
    PASSWORDS_NOT_MATCH: 'Passwords do not match',
    NAME_REQUIRED: 'Name is required',
    ROLE_REQUIRED: 'Role is required',
    ROLE_INVALID: 'Invalid role specified',
    PROFESSIONAL_DETAILS_REQUIRED: 'Professional details are required for doctors and labs',
  },

  // Authorization
  AUTHORIZATION: {
    ACCESS_DENIED: 'Access denied',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
    ADMIN_ONLY: 'This action requires admin privileges',
    UNVERIFIED_ACCOUNT: 'Your account is pending verification. Please wait for admin approval.',
  },

  // Admin
  ADMIN: {
    CANNOT_SELF_REGISTER: 'Admin accounts cannot be self-registered',
    USER_VERIFIED: 'User has been verified successfully',
    USER_REJECTED: 'User verification has been rejected',
  },

  // Appointments
  APPOINTMENT: {
    CREATED: 'Appointment request created successfully',
    UPDATED: 'Appointment updated successfully',
    CANCELLED: 'Appointment cancelled successfully',
    APPROVED: 'Appointment confirmed successfully',
    REJECTED: 'Appointment cancelled by doctor',
    COMPLETED: 'Appointment completed successfully',
    NOT_FOUND: 'Appointment not found',
    ALREADY_BOOKED: 'Doctor is already booked for this time slot',
    PAST_DATE: 'Cannot create appointment for past date',
    INVALID_STATUS: 'Invalid appointment status',
    CANNOT_MODIFY: 'Cannot modify appointment in current status',
    PATIENT_ONLY: 'Only patients can create appointments',
    DOCTOR_ONLY: 'Only assigned doctor can perform this action',
    PATIENT_ACCESS_DENIED: 'You can only access your own appointments',
    DOCTOR_ACCESS_DENIED: 'You can only access your assigned appointments',
    DATETIME_REQUIRED: 'Appointment date and time is required',
    DOCTOR_REQUIRED: 'Doctor ID is required',
    REASON_REQUIRED: 'Appointment reason is required',
    PAYMENT_METHOD_REQUIRED: 'Payment method is required',
    PAYMENT_AMOUNT_REQUIRED: 'Payment amount is required',
    KHALTI_PIDX_REQUIRED: 'Khalti pidx is required for Khalti payment',
    PAYMENT_NOT_COMPLETED: 'Payment must be completed before booking appointment',
  },

  // Role Applications
  ROLE_APPLICATION: {
    SUBMITTED: 'Role application submitted successfully',
    APPROVED: 'Role application approved successfully',
    REJECTED: 'Role application rejected successfully',
    UPDATED: 'Role application updated successfully',
    NOT_FOUND: 'Role application not found',
    ALREADY_EXISTS: 'You already have a pending application',
    ALREADY_APPROVED: 'Your role application has already been approved',
    INVALID_ROLE: 'Can only apply for doctor or lab role',
    PATIENT_ONLY: 'Only patients can submit role applications',
    DETAILS_REQUIRED: 'Professional details are required',
    CANNOT_MODIFY: 'Cannot modify application in current status',
    ROLE_REQUIRED: 'Requested role is required',
    REJECTION_REASON_REQUIRED: 'Rejection reason is required',
    USER_ALREADY_PROFESSIONAL: 'User already has a professional role',
  },

  // Diagnostic Tests
  DIAGNOSTIC: {
    ASSIGNED: 'Diagnostic test assigned successfully',
    UPDATED: 'Test status updated successfully',
    REPORT_UPLOADED: 'Test report uploaded successfully',
    COMPLETED: 'Test completed successfully',
    CANCELLED: 'Test cancelled successfully',
    NOT_FOUND: 'Diagnostic test not found',
    TEST_NAME_REQUIRED: 'Test name is required',
    TEST_TYPE_REQUIRED: 'Test type is required',
    PATIENT_REQUIRED: 'Patient ID is required',
    LAB_REQUIRED: 'Lab ID is required',
    INVALID_STATUS: 'Invalid test status',
    CANNOT_MODIFY: 'Cannot modify test in current status',
    DOCTOR_ONLY: 'Only the assigned doctor can perform this action',
    LAB_ONLY: 'Only the assigned lab can perform this action',
    PATIENT_ACCESS_DENIED: 'You can only access your own test results',
    DOCTOR_ACCESS_DENIED: 'You can only access tests you assigned',
    LAB_ACCESS_DENIED: 'You can only access tests assigned to your lab',
    REPORT_REQUIRED: 'Report details are required',
    REPORT_URL_REQUIRED: 'Report URL is required',
    ALREADY_COMPLETED: 'Test is already completed',
    NOT_COMPLETED: 'Test must be completed before uploading report',
    INVALID_PATIENT: 'Invalid patient - must have patient role',
    INVALID_LAB: 'Invalid lab - must have lab role',
    CANCELLATION_REASON_REQUIRED: 'Cancellation reason is required',
  },

  // Medication
  MEDICATION: {
    PRESCRIBED: 'Medication prescribed successfully',
    UPDATED: 'Medication updated successfully',
    DISCONTINUED: 'Medication discontinued successfully',
    NOT_FOUND: 'Medication not found',
    MEDICATION_NAME_REQUIRED: 'Medication name is required',
    DOSAGE_REQUIRED: 'Dosage is required',
    FREQUENCY_REQUIRED: 'Frequency is required',
    DURATION_REQUIRED: 'Duration is required',
    START_DATE_REQUIRED: 'Start date is required',
    PATIENT_REQUIRED: 'Patient ID is required',
    INVALID_PATIENT: 'Invalid patient - must have patient role',
    INVALID_FREQUENCY: 'Invalid frequency specified',
    INVALID_DURATION: 'Invalid duration specified',
    DOCTOR_ONLY: 'Only the prescribing doctor can perform this action',
    PATIENT_ACCESS_DENIED: 'You can only access your own medications',
    DOCTOR_ACCESS_DENIED: 'You can only access medications you prescribed',
    ALREADY_DISCONTINUED: 'Medication is already discontinued',
    CANNOT_MODIFY_COMPLETED: 'Cannot modify completed medication',
    DISCONTINUATION_REASON_REQUIRED: 'Discontinuation reason is required',
  },

  // Reminders
  REMINDER: {
    GENERATED: 'Reminders generated successfully',
    ACKNOWLEDGED: 'Reminder acknowledged successfully',
    NOT_FOUND: 'Reminder not found',
    PATIENT_ACCESS_DENIED: 'You can only access your own reminders',
    ALREADY_ACKNOWLEDGED: 'Reminder already acknowledged',
    CANNOT_ACKNOWLEDGE_MISSED: 'Cannot acknowledge missed reminder',
  },

  // Notifications
  NOTIFICATION: {
    CREATED: 'Notification created successfully',
    MARKED_AS_READ: 'Notification marked as read',
    MARKED_ALL_AS_READ: 'All notifications marked as read',
    DELETED: 'Notification deleted successfully',
    NOT_FOUND: 'Notification not found',
    ACCESS_DENIED: 'You can only access your own notifications',
    FETCH_SUCCESS: 'Notifications retrieved successfully',
    UNREAD_COUNT_SUCCESS: 'Unread count retrieved successfully',
    INVALID_TYPE: 'Invalid notification type',
    INVALID_PRIORITY: 'Invalid priority level',
    TITLE_REQUIRED: 'Notification title is required',
    MESSAGE_REQUIRED: 'Notification message is required',
    USER_REQUIRED: 'User ID is required',
    TYPE_REQUIRED: 'Notification type is required',
    ALREADY_READ: 'Notification is already marked as read',
    PREFERENCES_FETCH_SUCCESS: 'Notification preferences retrieved successfully',
    PREFERENCES_UPDATED: 'Notification preferences updated successfully',
    PUSH_SUBSCRIBED: 'Push notifications enabled for this device',
    PUSH_UNSUBSCRIBED: 'Push notifications disabled for this device',
    TEST_PUSH_SENT: 'Test push notification processed',
    PUSH_SUBSCRIPTION_REQUIRED: 'Push subscription payload is required',
    PUSH_ENDPOINT_REQUIRED: 'Push subscription endpoint is required',
  },

  // Server
  SERVER: {
    ERROR: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Bad request',
  },
};

export default MESSAGES;
