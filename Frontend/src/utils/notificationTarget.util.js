const isAbsoluteUrl = (url = '') => /^https?:\/\//i.test(url);

const normalizeRolePath = (role = 'patient') => {
  const allowed = new Set(['patient', 'doctor', 'lab', 'admin']);
  return allowed.has(role) ? `/${role}` : '/patient';
};

export const resolveNotificationTarget = (notification, role = 'patient') => {
  if (!notification) return normalizeRolePath(role) + '/dashboard';

  const roleBase = normalizeRolePath(role);
  const type = notification.type || notification.notificationType;
  const referenceId = notification.referenceId || notification.relatedResource?.resourceId;

  // Backend-provided deep link has highest priority.
  if (notification.targetUrl && typeof notification.targetUrl === 'string') {
    if (isAbsoluteUrl(notification.targetUrl)) return notification.targetUrl;
    if (notification.targetUrl.startsWith(roleBase + '/')) return notification.targetUrl;
  }

  // Stored actionUrl is next best source.
  if (notification.actionUrl && typeof notification.actionUrl === 'string') {
    if (isAbsoluteUrl(notification.actionUrl)) return notification.actionUrl;
    if (notification.actionUrl.startsWith(roleBase + '/')) return notification.actionUrl;
  }

  if (type?.startsWith('appointment_')) {
    return `${roleBase}/appointments`;
  }

  if (type?.startsWith('diagnostic_')) {
    if (role === 'lab' && referenceId) {
      return `${roleBase}/tests/${referenceId}`;
    }
    if (role === 'doctor') {
      return `${roleBase}/patients`;
    }
    if (role === 'patient') {
      return `${roleBase}/records`;
    }
    return `${roleBase}/diagnostics`;
  }

  if (type?.startsWith('medication_') || type?.startsWith('prescription_')) {
    if (role === 'doctor') return `${roleBase}/prescriptions`;
    if (role === 'admin') return `${roleBase}/prescriptions`;
    return `${roleBase}/records`;
  }

  if (type?.startsWith('role_application_')) {
    if (role === 'admin') return `${roleBase}/doctor-applications`;
    return `${roleBase}/profile`;
  }

  if (type === 'account_verified') {
    return `${roleBase}/dashboard`;
  }

  return `${roleBase}/dashboard`;
};

export default resolveNotificationTarget;