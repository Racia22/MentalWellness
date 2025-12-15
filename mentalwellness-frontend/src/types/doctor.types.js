export const doctorTypes = {
  DoctorDto: {
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
  CreateDoctorDto: {
    userId: 'string (Guid)',
    doctorIDNumber: 'string',
    specialty: 'string',
    licenseNumber: 'string',
    yearsOfExperience: 'number',
    bio: 'string',
    consultationFee: 'number',
  },
  UpdateDoctorDto: {
    specialty: 'string',
    bio: 'string',
    consultationFee: 'number',
    yearsOfExperience: 'number',
  },
};

export default doctorTypes;

