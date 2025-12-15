export const USER_ROLES = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  ADMIN: 'Admin',
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const PAYMENT_METHODS = {
  MOMO: 'MoMo',
  AIRTEL: 'AirtelMoney',
  BANK_CARD: 'BankCard',
};

export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const PATIENT_CATEGORY = {
  ADULT: 'Adult',
  MINOR: 'Minor',
  SENIOR: 'Senior',
};

export default {
  USER_ROLES,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  GENDER,
  PATIENT_CATEGORY,
};

