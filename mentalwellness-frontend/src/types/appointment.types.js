export const AppointmentStatus = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const AppointmentType = {
  CONSULTATION: 'Consultation',
  FOLLOW_UP: 'FollowUp',
  EMERGENCY: 'Emergency',
};

export const appointmentTypes = {
  AppointmentDto: {
    appointmentId: 'string (Guid)',
    patientId: 'string (Guid)',
    doctorId: 'string (Guid)',
    appointmentDate: 'DateTime (date)',
    appointmentTime: 'TimeSpan (time)',
    duration: 'number',
    type: 'AppointmentType',
    status: 'AppointmentStatus',
    reason: 'string',
    notes: 'string',
    patientName: 'string',
    doctorName: 'string',
    createdAt: 'DateTime',
    updatedAt: 'DateTime',
  },
  CreateAppointmentDto: {
    patientId: 'string (Guid)',
    doctorId: 'string (Guid)',
    appointmentDate: 'DateTime (date)',
    appointmentTime: 'TimeSpan (time)',
    duration: 'number',
    type: 'AppointmentType',
    reason: 'string',
  },
  UpdateAppointmentDto: {
    appointmentDate: 'DateTime (date)',
    appointmentTime: 'TimeSpan (time)',
    duration: 'number',
    status: 'AppointmentStatus',
    notes: 'string',
  },
};

export default appointmentTypes;

