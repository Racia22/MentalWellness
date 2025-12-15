import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, DollarSign, CreditCard, Calendar, CheckCircle, Clock, XCircle, Plus, X } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { usePayments } from '../../hooks/usePayments';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import patientService from '../../api/services/patientService';
import paymentService from '../../api/services/paymentService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import toast from 'react-hot-toast';

const PaymentsPage = () => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [patientId, setPatientId] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const { payments = [], loading, fetchPayments, initiatePayment } = usePayments({});
  const { appointments = [] } = useAppointments({ patientUserId: user?.userId || user?.UserId });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('MoMo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchPatientId = async () => {
      if (!user) {
        setLoadingPatient(false);
        return;
      }

      try {
        const currentUserId = user?.userId || user?.UserId;
        if (!currentUserId) {
          setLoadingPatient(false);
          return;
        }

        const patientData = await patientService.getPatientByUserId(currentUserId);
        const id = patientData.patientId || patientData.PatientId;
        if (id) {
          setPatientId(id);
        }
      } catch (error) {
        console.error('Failed to get patient data:', error);
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientId();
  }, [user]);

  // Refresh payments when patientId is available
  useEffect(() => {
    if (patientId) {
      fetchPayments();
    }
  }, [patientId, fetchPayments]);

  // Get unpaid appointments
  const unpaidAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) {
      console.log('No appointments array available');
      return [];
    }
    console.log('Total appointments:', appointments.length);
    const unpaid = appointments.filter(apt => {
      const isPaid = apt.isPaid || apt.IsPaid || false;
      const status = (apt.status || apt.Status || '').toLowerCase();
      const amount = apt.amount || apt.Amount || 0;
      // Show appointments that are scheduled/ongoing but not paid and have an amount > 0
      const shouldShow = !isPaid && amount > 0 && ['scheduled', 'ongoing'].includes(status);
      if (shouldShow) {
        console.log('Found unpaid appointment:', apt);
      }
      return shouldShow;
    });
    console.log('Unpaid appointments count:', unpaid.length);
    return unpaid;
  }, [appointments]);

  const handleInitiatePayment = async (appointment) => {
    setSelectedAppointment(appointment);
    setPhoneNumber(user?.phone || user?.Phone || '');
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedAppointment) return;
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setProcessingPayment(true);
    try {
      const appointmentId = selectedAppointment.appointmentId || selectedAppointment.AppointmentId;
      const paymentData = {
        appointmentId: appointmentId,
        paymentMethod: paymentMethod,
        phoneNumber: phoneNumber.trim()
      };

      await initiatePayment(paymentData);
      toast.success('Payment initiated successfully! You will receive a payment prompt on your phone.');
      setShowPaymentModal(false);
      setSelectedAppointment(null);
      setPhoneNumber('');
      // Refresh payments list
      await fetchPayments();
    } catch (error) {
      handleError(error, 'Failed to initiate payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleRetryPayment = async (payment) => {
    const appointmentId = payment.appointmentId || payment.AppointmentId;
    const appointment = appointments.find(apt => {
      const aptId = apt.appointmentId || apt.AppointmentId;
      return aptId === appointmentId;
    });

    if (appointment) {
      handleInitiatePayment(appointment);
    } else {
      toast.error('Appointment not found for this payment');
    }
  };

  // Inline styles
  const styles = {
    page: {
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      backgroundColor: '#F5F5F0',
      display: 'flex',
      flexDirection: 'column',
    },
    body: {
      display: 'flex',
      flex: 1,
      width: '100%',
    },
    main: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      backgroundColor: '#F5F5F0',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#6B7280',
    },
    unpaidSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      marginBottom: '1.5rem',
    },
    unpaidTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    unpaidList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    unpaidCard: {
      backgroundColor: '#F9FAFB',
      borderRadius: '0.5rem',
      padding: '1rem',
      border: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    unpaidInfo: {
      flex: 1,
    },
    unpaidDoctor: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.25rem',
    },
    unpaidDate: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    unpaidAmount: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1E40AF',
      marginRight: '1rem',
    },
    filtersCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      marginBottom: '1.5rem',
    },
    filtersRow: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    searchWrapper: {
      flex: 1,
      minWidth: '200px',
      position: 'relative',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6B7280',
      width: '1.25rem',
      height: '1.25rem',
    },
    searchInput: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
    },
    select: {
      minWidth: '150px',
      padding: '0.5rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#FFFFFF',
      transition: 'all 0.3s',
    },
    paymentsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    paymentCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
    },
    paymentHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem',
    },
    paymentTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.25rem',
    },
    paymentDate: {
      fontSize: '0.875rem',
      color: '#6B7280',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    paymentDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem',
    },
    detailItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    detailLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      fontWeight: '500',
    },
    detailValue: {
      fontSize: '1rem',
      color: '#0A1D56',
      fontWeight: '600',
    },
    badge: {
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    badgeSuccess: {
      backgroundColor: '#D1FAE5',
      color: '#047857',
    },
    badgeWarning: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    },
    badgeDanger: {
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
    },
    actionButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0A1D56',
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6B7280',
      padding: 0,
      width: '2rem',
      height: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBody: {
      marginBottom: '1.5rem',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      fontSize: '1rem',
    },
    selectInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#FFFFFF',
      cursor: 'pointer',
    },
    modalActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    buttonSecondary: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#F3F4F6',
      color: '#374151',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    buttonPrimary: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
  };

  // Deduplicate payments - show only the most recent payment per appointment
  const uniquePayments = useMemo(() => {
    if (!payments || !Array.isArray(payments)) return [];
    
    // Group payments by appointmentId
    const paymentsByAppointment = new Map();
    
    payments.forEach(payment => {
      const appointmentId = payment.appointmentId || payment.AppointmentId;
      if (!appointmentId) return;
      
      const existing = paymentsByAppointment.get(appointmentId);
      
      if (!existing) {
        paymentsByAppointment.set(appointmentId, payment);
      } else {
        // Keep the most recent payment, or prioritize Completed > Processing > Pending > Failed
        const existingStatus = existing.paymentStatus || existing.PaymentStatus || '';
        const currentStatus = payment.paymentStatus || payment.PaymentStatus || '';
        const existingDate = new Date(existing.createdAt || existing.CreatedAt || 0);
        const currentDate = new Date(payment.createdAt || payment.CreatedAt || 0);
        
        const statusPriority = { 'Completed': 4, 'Processing': 3, 'Pending': 2, 'Failed': 1, 'Cancelled': 0 };
        const existingPriority = statusPriority[existingStatus] || 0;
        const currentPriority = statusPriority[currentStatus] || 0;
        
        // If same priority, keep the most recent; otherwise keep higher priority
        if (currentPriority > existingPriority || 
            (currentPriority === existingPriority && currentDate > existingDate)) {
          paymentsByAppointment.set(appointmentId, payment);
        }
      }
    });
    
    return Array.from(paymentsByAppointment.values());
  }, [payments]);

  const filteredPayments = useMemo(() => {
    if (!uniquePayments || !Array.isArray(uniquePayments)) return [];
    return uniquePayments.filter((payment) => {
      const transactionRef = payment.transactionReference || payment.TransactionReference || payment.transactionId || '';
      const paymentMethod = payment.paymentMethod || payment.PaymentMethod || '';
      const amount = payment.amount || payment.Amount || 0;
      const status = payment.paymentStatus || payment.PaymentStatus || payment.status || '';
      
      const matchesSearch =
        transactionRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatCurrency(amount, 'RWF').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'All' || status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [uniquePayments, searchTerm, filterStatus]);

  if (loading || loadingPatient) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={styles.main}>
            <LoadingScreen />
          </main>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badgeStyles = {
      Completed: { ...styles.badge, ...styles.badgeSuccess },
      Pending: { ...styles.badge, ...styles.badgeWarning },
      Failed: { ...styles.badge, ...styles.badgeDanger },
    };
    return badgeStyles[status] || styles.badge;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'Pending':
        return <Clock style={{ width: '1rem', height: '1rem' }} />;
      case 'Failed':
        return <XCircle style={{ width: '1rem', height: '1rem' }} />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>Payments</h1>
              <p style={styles.subtitle}>View and manage your payment records</p>
            </div>

            {/* Unpaid Appointments Section */}
            {unpaidAppointments.length > 0 && (
              <div style={styles.unpaidSection}>
                <h2 style={styles.unpaidTitle}>
                  <DollarSign style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B' }} />
                  Pending Payments
                </h2>
                <div style={styles.unpaidList}>
                  {unpaidAppointments.map((appointment) => {
                    const appointmentId = appointment.appointmentId || appointment.AppointmentId;
                    const doctorName = appointment.doctorName || appointment.DoctorName || 'Doctor';
                    const appointmentDate = appointment.appointmentDate || appointment.AppointmentDate;
                    const amount = appointment.amount || appointment.Amount || 0;
                    const dateObj = appointmentDate ? new Date(appointmentDate) : null;

                    return (
                      <div key={appointmentId} style={styles.unpaidCard}>
                        <div style={styles.unpaidInfo}>
                          <div style={styles.unpaidDoctor}>Appointment with {doctorName}</div>
                          <div style={styles.unpaidDate}>
                            <Calendar style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginRight: '0.25rem' }} />
                            {dateObj ? formatDate(dateObj) : 'Date not available'}
                          </div>
                        </div>
                        <div style={styles.unpaidAmount}>
                          {formatCurrency(amount, 'RWF')}
                        </div>
                        <button
                          onClick={() => handleInitiatePayment(appointment)}
                          style={styles.actionButton}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                        >
                          <Plus style={{ width: '1rem', height: '1rem' }} />
                          Pay Now
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div style={styles.filtersCard}>
              <div style={styles.filtersRow}>
                <div style={styles.searchWrapper}>
                  <Search style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by transaction ID, method, or amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '2px solid #1E40AF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '2px solid #e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Payments List */}
            {filteredPayments.length === 0 ? (
              <EmptyState
                message={payments?.length === 0 ? "No payment records found." : "No payments match your search criteria."}
                icon="💳"
              />
            ) : (
              <div style={styles.paymentsList}>
                {filteredPayments.map((payment) => {
                  const paymentId = payment.paymentId || payment.PaymentId;
                  const appointmentId = payment.appointmentId || payment.AppointmentId;
                  const transactionRef = payment.transactionReference || payment.TransactionReference || payment.transactionId || '';
                  const paymentMethod = payment.paymentMethod || payment.PaymentMethod || 'N/A';
                  const amount = payment.amount || payment.Amount || 0;
                  const status = payment.paymentStatus || payment.PaymentStatus || payment.status || '';
                  const createdAt = payment.createdAt || payment.CreatedAt || payment.paymentDate || '';
                  const paidAt = payment.paidAt || payment.PaidAt;

                  return (
                    <div
                      key={paymentId}
                      style={styles.paymentCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={styles.paymentHeader}>
                        <div>
                          <h3 style={styles.paymentTitle}>
                            {appointmentId ? 'Appointment Payment' : 'Payment'}
                          </h3>
                          <p style={styles.paymentDate}>
                            <Calendar style={{ width: '1rem', height: '1rem' }} />
                            {createdAt ? formatDate(createdAt) : (paidAt ? formatDate(paidAt) : 'Date not available')}
                          </p>
                        </div>
                        {status && (
                          <span style={getStatusBadge(status)}>
                            {getStatusIcon(status)}
                            {status}
                          </span>
                        )}
                      </div>
                      <div style={styles.paymentDetails}>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Amount</span>
                          <span style={{ ...styles.detailValue, color: '#1E40AF', fontSize: '1.5rem' }}>
                            {formatCurrency(amount, 'RWF')}
                          </span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Payment Method</span>
                          <span style={styles.detailValue}>
                            <CreditCard style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
                            {paymentMethod}
                          </span>
                        </div>
                        {transactionRef && (
                          <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Transaction ID</span>
                            <span style={styles.detailValue}>{transactionRef}</span>
                          </div>
                        )}
                      </div>
                      {status === 'Pending' && (
                        <button
                          onClick={() => handleRetryPayment(payment)}
                          style={styles.actionButton}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                        >
                          <DollarSign style={{ width: '1rem', height: '1rem' }} />
                          Retry Payment
                        </button>
                      )}
                      {status === 'Completed' && (
                        <button
                          style={{
                            ...styles.actionButton,
                            backgroundColor: 'transparent',
                            color: '#1E40AF',
                            border: '2px solid #1E40AF',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1E40AF';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#1E40AF';
                          }}
                        >
                          <Download style={{ width: '1rem', height: '1rem' }} />
                          Download Receipt
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAppointment && (
        <div style={styles.modal} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Make Payment</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAppointment(null);
                }}
                style={styles.closeButton}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Appointment</label>
                <div style={{ padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  {selectedAppointment.doctorName || selectedAppointment.DoctorName || 'Doctor'} - {formatDate(new Date(selectedAppointment.appointmentDate || selectedAppointment.AppointmentDate))}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount</label>
                <div style={{ padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', color: '#1E40AF' }}>
                  {formatCurrency(selectedAppointment.amount || selectedAppointment.Amount || 0, 'RWF')}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="MoMo">Mobile Money (MoMo)</option>
                  <option value="Airtel">Airtel Money</option>
                  <option value="BankCard">Bank Card</option>
                  <option value="BankTransfer">Bank Transfer</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  style={styles.input}
                  required
                />
              </div>
            </div>
            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAppointment(null);
                }}
                style={styles.buttonSecondary}
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                style={styles.buttonPrimary}
                disabled={processingPayment || !phoneNumber.trim()}
              >
                {processingPayment ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
