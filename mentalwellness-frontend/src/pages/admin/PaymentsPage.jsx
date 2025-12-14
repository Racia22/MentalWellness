import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Search, Filter, Download, Eye, RefreshCw, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import paymentService from '../../api/services/paymentService';
import { handleError } from '../../utils/errorHandler';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminPaymentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { sidebarOpen, toggleSidebar } = useApp();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (dateRange.start) filters.startDate = dateRange.start;
      if (dateRange.end) filters.endDate = dateRange.end;
      
      const [paymentsData, statsData] = await Promise.all([
        paymentService.getAllPayments(filters),
        paymentService.getPaymentStats(filters)
      ]);
      
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setStats(statsData);
    } catch (error) {
      handleError(error, 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateRange]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRefund = async () => {
    if (!selectedPayment || !refundReason.trim()) {
      toast.error('Please provide a refund reason');
      return;
    }

    try {
      const refundData = {
        refundAmount: refundAmount ? parseFloat(refundAmount) : null,
        refundReason: refundReason
      };

      await paymentService.processRefund(selectedPayment.paymentId || selectedPayment.PaymentId, refundData);
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      setRefundReason('');
      setRefundAmount('');
      setSelectedPayment(null);
      fetchPayments();
    } catch (error) {
      handleError(error, 'Failed to process refund');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10B981' }} />;
      case 'pending':
      case 'processing':
        return <Clock style={{ width: '1rem', height: '1rem', color: '#F59E0B' }} />;
      case 'failed':
        return <XCircle style={{ width: '1rem', height: '1rem', color: '#EF4444' }} />;
      case 'refunded':
        return <RefreshCw style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />;
      default:
        return <AlertCircle style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#10B981';
      case 'pending':
      case 'processing':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      case 'refunded':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const patientName = (payment.patientName || payment.PatientName || '').toLowerCase();
    const doctorName = (payment.doctorName || payment.DoctorName || '').toLowerCase();
    const transactionRef = (payment.transactionReference || payment.TransactionReference || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = !searchTerm || 
      patientName.includes(searchLower) ||
      doctorName.includes(searchLower) ||
      transactionRef.includes(searchLower);
    
    const matchesStatus = !statusFilter || (payment.paymentStatus || payment.PaymentStatus || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesMethod = !methodFilter || (payment.paymentMethod || payment.PaymentMethod || '').toLowerCase() === methodFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const exportToCSV = () => {
    const headers = ['Transaction Reference', 'Patient', 'Doctor', 'Date', 'Amount (RWF)', 'Method', 'Status'];
    const rows = filteredPayments.map(p => [
      p.transactionReference || p.TransactionReference || '',
      p.patientName || p.PatientName || '',
      p.doctorName || p.DoctorName || '',
      p.appointmentDate || p.AppointmentDate ? formatDate(new Date(p.appointmentDate || p.AppointmentDate)) : '',
      p.amount || p.Amount || 0,
      p.paymentMethod || p.PaymentMethod || '',
      p.paymentStatus || p.PaymentStatus || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Payments exported successfully');
  };

  const styles = {
    page: { minHeight: '100vh', width: '100%', overflowX: 'hidden', backgroundColor: '#F5F5F0', display: 'flex', flexDirection: 'column' },
    body: { display: 'flex', flex: 1, width: '100%' },
    main: { flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#F5F5F0' },
    container: { maxWidth: '1400px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0A1D56' },
    subtitle: { color: '#6B7280', marginBottom: '1.5rem' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    statCard: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    statLabel: { fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' },
    statValue: { fontSize: '2rem', fontWeight: 'bold', color: '#0A1D56' },
    controls: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
    searchBox: { position: 'relative', flex: 1, minWidth: '300px' },
    searchInput: { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', width: '1rem', height: '1rem' },
    filterSelect: { padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#FFFFFF', cursor: 'pointer' },
    dateInput: { padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#FFFFFF' },
    exportButton: { padding: '0.75rem 1.5rem', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' },
    paymentsTable: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '0.875rem', color: '#374151' },
    tableRow: { display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s' },
    tableCell: { fontSize: '0.875rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
    actionButton: { padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid #D1D5DB', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151', transition: 'all 0.2s' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    modalTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#0A1D56' },
    closeButton: { backgroundColor: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' },
    modalBody: { marginBottom: '1.5rem' },
    detailRow: { display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6' },
    detailLabel: { fontWeight: '600', color: '#374151' },
    detailValue: { color: '#6B7280' },
    textarea: { width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', minHeight: '100px', marginBottom: '1rem' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' },
    modalActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
    button: { padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', border: 'none' },
    buttonPrimary: { backgroundColor: '#1E40AF', color: '#FFFFFF' },
    buttonSecondary: { backgroundColor: '#F3F4F6', color: '#374151' },
  };

  if (loading && !stats) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={styles.main}><LoadingScreen /></main>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>Payments Management</h1>
              <p style={styles.subtitle}>View and manage all payment transactions</p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Revenue</div>
                  <div style={{ ...styles.statValue, color: '#10B981' }}>
                    {formatCurrency(stats.totalRevenue || stats.TotalRevenue || 0, 'RWF')}
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Pending Payments</div>
                  <div style={{ ...styles.statValue, color: '#F59E0B' }}>
                    {stats.pendingPayments || stats.PendingPayments || 0}
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Completed Payments</div>
                  <div style={{ ...styles.statValue, color: '#10B981' }}>
                    {stats.completedPayments || stats.CompletedPayments || 0}
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Failed Payments</div>
                  <div style={{ ...styles.statValue, color: '#EF4444' }}>
                    {stats.failedPayments || stats.FailedPayments || 0}
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div style={styles.controls}>
              <div style={styles.searchBox}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by patient, doctor, or transaction reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Methods</option>
                <option value="MoMo">MoMo</option>
                <option value="Airtel">Airtel</option>
                <option value="BankCard">Bank Card</option>
                <option value="BankTransfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                style={styles.dateInput}
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                style={styles.dateInput}
                placeholder="End Date"
              />
              <button onClick={exportToCSV} style={styles.exportButton}>
                <Download style={{ width: '1rem', height: '1rem' }} />
                Export CSV
              </button>
            </div>

            {/* Payments Table */}
            {filteredPayments.length === 0 ? (
              <EmptyState
                message={payments.length === 0 ? "No payments found." : "No payments match your search criteria."}
                icon="💳"
              />
            ) : (
              <div style={styles.paymentsTable}>
                <div style={styles.tableHeader}>
                  <div>Transaction Ref</div>
                  <div>Patient</div>
                  <div>Doctor</div>
                  <div>Appointment Date</div>
                  <div>Amount</div>
                  <div>Method</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {filteredPayments.map((payment) => {
                  const status = payment.paymentStatus || payment.PaymentStatus || 'Unknown';
                  const appointmentDate = payment.appointmentDate || payment.AppointmentDate;
                  const dateObj = appointmentDate ? new Date(appointmentDate) : null;

                  return (
                    <div 
                      key={payment.paymentId || payment.PaymentId} 
                      style={styles.tableRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <div style={styles.tableCell}>
                        {payment.transactionReference || payment.TransactionReference || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        {payment.patientName || payment.PatientName || 'Unknown'}
                      </div>
                      <div style={styles.tableCell}>
                        {payment.doctorName || payment.DoctorName || 'Unknown'}
                      </div>
                      <div style={styles.tableCell}>
                        {dateObj ? formatDate(dateObj) : 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        <DollarSign style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {formatCurrency(payment.amount || payment.Amount || 0, payment.currency || payment.Currency || 'RWF')}
                      </div>
                      <div style={styles.tableCell}>
                        {payment.paymentMethod || payment.PaymentMethod || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        <span style={{ ...styles.statusBadge, backgroundColor: `${getStatusColor(status)}20`, color: getStatusColor(status) }}>
                          {getStatusIcon(status)}
                          {status}
                        </span>
                      </div>
                      <div style={{ ...styles.tableCell, gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailsModal(true);
                          }}
                          style={styles.actionButton}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                            e.currentTarget.style.borderColor = '#9CA3AF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = '#D1D5DB';
                          }}
                        >
                          <Eye style={{ width: '0.875rem', height: '0.875rem' }} />
                        </button>
                        {status.toLowerCase() === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setRefundAmount(payment.amount || payment.Amount || '');
                              setShowRefundModal(true);
                            }}
                            style={{ ...styles.actionButton, color: '#EF4444', borderColor: '#EF4444' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEE2E2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div style={styles.modal} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Payment Details</h2>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Transaction Reference:</span>
                <span style={styles.detailValue}>{selectedPayment.transactionReference || selectedPayment.TransactionReference}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Patient:</span>
                <span style={styles.detailValue}>{selectedPayment.patientName || selectedPayment.PatientName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Doctor:</span>
                <span style={styles.detailValue}>{selectedPayment.doctorName || selectedPayment.DoctorName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Amount:</span>
                <span style={styles.detailValue}>
                  {formatCurrency(selectedPayment.amount || selectedPayment.Amount || 0, selectedPayment.currency || selectedPayment.Currency || 'RWF')}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Payment Method:</span>
                <span style={styles.detailValue}>{selectedPayment.paymentMethod || selectedPayment.PaymentMethod}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <span style={styles.detailValue}>{selectedPayment.paymentStatus || selectedPayment.PaymentStatus}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Created At:</span>
                <span style={styles.detailValue}>
                  {selectedPayment.createdAt || selectedPayment.CreatedAt ? formatDate(new Date(selectedPayment.createdAt || selectedPayment.CreatedAt)) : 'N/A'}
                </span>
              </div>
              {selectedPayment.paidAt || selectedPayment.PaidAt ? (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Paid At:</span>
                  <span style={styles.detailValue}>
                    {formatDate(new Date(selectedPayment.paidAt || selectedPayment.PaidAt))}
                  </span>
                </div>
              ) : null}
              {selectedPayment.providerResponse || selectedPayment.ProviderResponse ? (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Provider Response:</span>
                  <span style={styles.detailValue}>
                    <pre style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                      {JSON.stringify(JSON.parse(selectedPayment.providerResponse || selectedPayment.ProviderResponse || '{}'), null, 2)}
                    </pre>
                  </span>
                </div>
              ) : null}
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowDetailsModal(false)} style={{ ...styles.button, ...styles.buttonSecondary }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div style={styles.modal} onClick={() => setShowRefundModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Process Refund</h2>
              <button onClick={() => setShowRefundModal(false)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Payment Amount:</span>
                <span style={styles.detailValue}>
                  {formatCurrency(selectedPayment.amount || selectedPayment.Amount || 0, 'RWF')}
                </span>
              </div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Refund Amount (leave empty for full refund):
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount or leave empty for full refund"
                style={styles.input}
                min="0"
                max={selectedPayment.amount || selectedPayment.Amount || 0}
              />
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Refund Reason: *
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                style={styles.textarea}
                required
              />
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowRefundModal(false)} style={{ ...styles.button, ...styles.buttonSecondary }}>
                Cancel
              </button>
              <button onClick={handleRefund} style={{ ...styles.button, ...styles.buttonPrimary }}>
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
