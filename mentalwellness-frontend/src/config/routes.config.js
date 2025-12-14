export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ABOUT: '/about',
  SERVICES: '/services',
  CONTACT: '/contact',
  DOCTORS: '/doctors',
  NOT_FOUND: '/404',

  // Patient routes
  PATIENT: {
    DASHBOARD: '/patient/dashboard',
    APPOINTMENTS: '/patient/appointments',
    BOOK_APPOINTMENT: '/patient/appointments/book',
    DOCTORS: '/patient/doctors',
    MEDICAL_RECORDS: '/patient/medical-records',
    TREATMENT_PLANS: '/patient/treatment-plans',
    MOOD_TRACKING: '/patient/mood-tracking',
    MESSAGES: '/patient/messages',
    PAYMENTS: '/patient/payments',
    FEEDBACK: '/patient/feedback',
    PROFILE: '/patient/profile',
  },

  // Doctor routes
  DOCTOR: {
    DASHBOARD: '/doctor/dashboard',
    PATIENTS: '/doctor/patients',
    PATIENT_DETAILS: (id) => `/doctor/patients/${id}`,
    APPOINTMENTS: '/doctor/appointments',
    MEDICAL_RECORDS: '/doctor/medical-records',
    TREATMENT_PLANS: '/doctor/treatment-plans',
    MOOD_ANALYSIS: '/doctor/mood-analysis',
    MESSAGES: '/doctor/messages',
    FEEDBACK: '/doctor/feedback',
    PROFILE: '/doctor/profile',
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PATIENTS: '/admin/patients',
    DOCTORS: '/admin/doctors',
    APPOINTMENTS: '/admin/appointments',
    PAYMENTS: '/admin/payments',
    FEEDBACK: '/admin/feedback',
    AUDIT_LOGS: '/admin/audit-logs',
    SETTINGS: '/admin/settings',
  },

  // Shared routes
  SHARED: {
    SETTINGS: '/settings',
    NOTIFICATIONS: '/notifications',
    UNAUTHORIZED: '/unauthorized',
  },
};

export default ROUTES;

