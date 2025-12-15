export const PatientCategory = {
  ADULT: 'Adult',
  MINOR: 'Minor',
  SENIOR: 'Senior',
};

export const Gender = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const patientTypes = {
  PatientDto: {
    patientId: 'string (Guid)',
    userId: 'string (Guid)',
    patientIDNumber: 'string',
    dateOfBirth: 'DateTime',
    age: 'number',
    gender: 'Gender',
    category: 'PatientCategory',
    address: 'string',
    emergencyContact: 'string',
    emergencyContactPhone: 'string',
    email: 'string',
    fullName: 'string',
    phone: 'string',
    createdAt: 'DateTime',
  },
  CreatePatientDto: {
    userId: 'string (Guid)',
    patientIDNumber: 'string',
    dateOfBirth: 'DateTime',
    gender: 'Gender',
    category: 'PatientCategory',
    address: 'string',
    emergencyContact: 'string',
    emergencyContactPhone: 'string',
  },
};

export default patientTypes;

