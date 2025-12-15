import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import AboutPage from '../pages/public/AboutPage';
import ServicesPage from '../pages/public/ServicesPage';
import ContactPage from '../pages/public/ContactPage';
import DoctorsPage from '../pages/public/DoctorsPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import ResetPasswordPage from '../pages/public/ResetPasswordPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Patient pages
import PatientDashboardPage from '../pages/patient/PatientDashboardPage';
import AppointmentsPage from '../pages/patient/AppointmentsPage';
import BookAppointmentPage from '../pages/patient/BookAppointmentPage';
import PatientDoctorsPage from '../pages/patient/DoctorsPage';
import PatientMedicalRecordsPage from '../pages/patient/MedicalRecordsPage';
import PatientTreatmentPlansPage from '../pages/patient/TreatmentPlansPage';
import MoodTrackingPage from '../pages/patient/MoodTrackingPage';
import PatientMessagesPage from '../pages/patient/MessagesPage';
import PatientPaymentsPage from '../pages/patient/PaymentsPage';
import PatientFeedbackPage from '../pages/patient/FeedbackPage';
import PatientProfilePage from '../pages/patient/PatientProfilePage';

// Doctor pages
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import DoctorPatientsPage from '../pages/doctor/PatientsPage';
import PatientDetailsPage from '../pages/doctor/PatientDetailsPage';
import DoctorAppointmentsPage from '../pages/doctor/AppointmentsPage';
import DoctorMedicalRecordsPage from '../pages/doctor/MedicalRecordsPage';
import DoctorTreatmentPlansPage from '../pages/doctor/TreatmentPlansPage';
import DoctorMessagesPage from '../pages/doctor/MessagesPage';
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/UsersPage';
import AdminPatientsPage from '../pages/admin/PatientsPage';
import AdminDoctorsPage from '../pages/admin/DoctorApprovalsPage';
import AdminAppointmentsPage from '../pages/admin/AppointmentsPage';
import AdminMedicalRecordsPage from '../pages/admin/MedicalRecordsPage';
import AdminTreatmentPlansPage from '../pages/admin/TreatmentPlansPage';
import AdminMessagesPage from '../pages/admin/MessagesPage';
import AdminPaymentsPage from '../pages/admin/PaymentsPage';
import AdminFeedbackPage from '../pages/admin/FeedbackModerationPage';
import AdminSettingsPage from '../pages/admin/SettingsPage';
import AdminAuditLogsPage from '../pages/admin/AuditLogsPage';
import AdminProfilePage from '../pages/admin/ProfilePage';

// Shared pages
import NotificationsPage from '../pages/shared/NotificationsPage';
import SettingsPage from '../pages/shared/SettingsPage';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <PatientDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <AppointmentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/appointments/book"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <BookAppointmentPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/doctors"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <PatientDoctorsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/medical-records"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <PatientMedicalRecordsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/treatment-plans"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <PatientTreatmentPlansPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/mood-tracking"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <MoodTrackingPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/messages"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <PatientMessagesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/payments"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <PatientPaymentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/feedback"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <PatientFeedbackPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <PatientProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/settings"
        element={
          <PrivateRoute allowedRoles={['Patient']}>
            <SettingsPage />
          </PrivateRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <DoctorDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <DoctorPatientsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/patients/:id"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <PatientDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <DoctorAppointmentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/medical-records"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <DoctorMedicalRecordsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/treatment-plans"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <DoctorTreatmentPlansPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/messages"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <DoctorMessagesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <DoctorProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/settings"
        element={
          <PrivateRoute allowedRoles={['Doctor']}>
            <SettingsPage />
          </PrivateRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminUsersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminPatientsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminDoctorsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminAppointmentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/medical-records"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminMedicalRecordsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/treatment-plans"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminTreatmentPlansPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminMessagesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminPaymentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminFeedbackPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminSettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminAuditLogsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminProfilePage />
          </PrivateRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <NotificationsPage />
          </PrivateRoute>
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
