export const normalizeAppointmentStatus = (status) => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'approved') return 'confirmed';
  if (normalized === 'rejected') return 'cancelled';
  return normalized;
};

export const isAppointmentReschedulableByDoctor = (status) => {
  return ['pending', 'confirmed', 'approved'].includes((status || '').toLowerCase());
};

export const normalizeDiagnosticStatus = (status) => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'completed') return 'report_uploaded';
  return normalized;
};

export const isDiagnosticReportReady = (test) => {
  if (!test?.report?.url) return false;
  const normalized = normalizeDiagnosticStatus(test.status);
  return normalized === 'report_uploaded';
};