export const UserRole = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  ADMIN: 'Admin',
};

export const Gender = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const PatientCategory = {
  ADULT: 'Adult',
  MINOR: 'Minor',
  SENIOR: 'Senior',
};

export const userTypes = {
  User: {
    userId: 'string (Guid)',
    email: 'string',
    passwordHash: 'string',
    fullName: 'string',
    phone: 'string',
    role: 'UserRole',
    isActive: 'boolean',
    createdAt: 'DateTime',
    updatedAt: 'DateTime',
  },
  Patient: {
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
  Doctor: {
    doctorId: 'string (Guid)',
    userId: 'string (Guid)',
    doctorIDNumber: 'string',
    specialty: 'string',
    licenseNumber: 'string',
    yearsOfExperience: 'number',
    bio: 'string',
    consultationFee: 'number',
    averageRating: 'number',
    totalReviews: 'number',
    isApproved: 'boolean',
    email: 'string',
    fullName: 'string',
    phone: 'string',
    createdAt: 'DateTime',
  },
};

export default userTypes;

