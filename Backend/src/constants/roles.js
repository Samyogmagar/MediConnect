/**
 * System Roles for MediConnect Healthcare Platform
 * Only these four roles are supported
 */
export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  LAB: 'lab',
  ADMIN: 'admin',
};

// Array of all valid roles for validation
export const ALL_ROLES = Object.values(ROLES);

// Roles that require verification before accessing protected resources
export const VERIFICATION_REQUIRED_ROLES = [ROLES.DOCTOR, ROLES.LAB];

// Roles that can self-register publicly
export const PUBLIC_REGISTRATION_ROLES = [ROLES.PATIENT];

export default ROLES;