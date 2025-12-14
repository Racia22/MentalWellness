import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Clock, Users, Calendar, Search, Filter, Download } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import paymentService from '../../api/services/paymentService';
import doctorService from '../../api/services/doctorService';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import { formatDate, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const DoctorPaymentsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    totalPatients: 0,
    averageFee: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, week, month, quarter, custom
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const { sidebarOpen, toggleSidebar } = useApp();

  useEffect(() => {
    const fetchDoctorId = async () => {
      if (!user) return;

      try {
        const currentUserId = user?.userId || user?.UserId;
        if (!currentUserId) return;

        const doctorData = await doctorService.getDoctorByUserId(currentUserId);
        const id = doctorData.doctorId || doctorData.DoctorId;
        if (id) {
          setDoctorId(id);
        }
      } catch (error) {
        handleError(error, 'Failed to load doctor information');
      }
    };

    fetchDoctorId();
  }, [user]);

  const getDateRange = () => {
    const now = new Date();
    let startDate = null;
    let endDate = null;

    switch (dateFilter) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = now;
        break;
      case 'custom':
        startDate = customDateRange.start ? new Date(customDateRange.start) : null;
        endDate = customDateRange.end ? new Date(customDateRange.end) : null;
        break;
      default:
        // All time
        break;
    }

    return { startDate, endDate };
  };

  const fetchPayments = useCallback(async () => {
    if (!doctorId) return;

    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const filters = {};
      
      if (statusFilter) filters.status = statusFilter;
      if (startDate) filters.startDate = startDate.toISOString().split('T')[0];
      if (endDate) filters.endDate = endDate.toISOString().split('T')[0];

      const paymentsData = await paymentService.getPaymentsByDoctor(doctorId, filters);
      const paymentsArray = Array.isArray(paymentsData) ? paymentsData : [];

      setPayments(paymentsArray);

      // Calculate earnings
      const completedPayments = paymentsArray.filter(p => 
        (p.paymentStatus || p.PaymentStatus || '').toLowerCase() === 'completed'
      );
      const totalEarnings = completedPayments.reduce((sum, p) => sum + (parseFloat(p.amount || p.Amount || 0)), 0);
      const pendingPayments = paymentsArray.filter(p => 
        ['pending', 'processing'].includes((p.paymentStatus || p.PaymentStatus || '').toLowerCase())
      ).length;
      const uniquePatients = new Set(paymentsArray.map(p => p.patientId || p.PatientId)).size;
      const averageFee = completedPayments.length > 0 
        ? totalEarnings / completedPayments.length 
        : 0;

      setEarnings({
        totalEarnings,
        pendingPayments,
        totalPatients: uniquePatients,
        averageFee
      });
    } catch (error) {
      handleError(error, 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId, statusFilter, dateFilter, customDateRange]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = payments.filter(payment => {
    const patientName = (payment.payerName || payment.PayerName || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return !searchTerm || patientName.includes(searchLower);
  });

  // Group payments by month for chart
  const monthlyEarnings = React.useMemo(() => {
    const completed = payments.filter(p => 
      (p.paymentStatus || p.PaymentStatus || '').toLowerCase() === 'completed'
    );
    
    const grouped = {};
    completed.forEach(p => {
      const date = new Date(p.createdAt || p.CreatedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = 0;
      }
      grouped[monthKey] += parseFloat(p.amount || p.Amount || 0);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  }, [payments]);

  // Payment method breakdown
  const paymentMethodBreakdown = React.useMemo(() => {
    const completed = payments.filter(p => 
      (p.paymentStatus || p.PaymentStatus || '').toLowerCase() === 'completed'
    );
    
    const breakdown = {};
    completed.forEach(p => {
      const method = p.paymentMethod || p.PaymentMethod || 'Unknown';
      if (!breakdown[method]) {
        breakdown[method] = 0;
      }
      breakdown[method] += parseFloat(p.amount || p.Amount || 0);
    });

    return Object.entries(breakdown);
  }, [payments]);

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
    statLabel: { fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statValue: { fontSize: '2rem', fontWeight: 'bold', color: '#0A1D56' },
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    chartCard: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    chartTitle: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0A1D56' },
    controls: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
    searchBox: { position: 'relative', flex: 1, minWidth: '300px' },
    searchInput: { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', width: '1rem', height: '1rem' },
    filterSelect: { padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#FFFFFF', cursor: 'pointer' },
    dateInput: { padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#FFFFFF' },
    paymentsTable: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '0.875rem', color: '#374151' },
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s' },
    tableCell: { fontSize: '0.875rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600' },
    barChart: { display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px', marginTop: '1rem' },
    bar: { flex: 1, backgroundColor: '#1E40AF', borderRadius: '0.25rem 0.25rem 0 0', position: 'relative', minHeight: '4px' },
    barLabel: { position: 'absolute', bottom: '-1.5rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap' },
    pieChart: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' },
    pieItem: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    pieColor: { width: '1rem', height: '1rem', borderRadius: '0.25rem' },
  };

  if (loading && !doctorId) {
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

  const maxEarning = monthlyEarnings.length > 0 
    ? Math.max(...monthlyEarnings.map(([, amount]) => amount))
    : 1;

  const colors = ['#1E40AF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>My Earnings</h1>
              <p style={styles.subtitle}>Track your payment history and earnings</p>
            </div>

            {/* Earnings Summary Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>
                  <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                  Total Earnings (This Period)
                </div>
                <div style={{ ...styles.statValue, color: '#10B981' }}>
                  {formatCurrency(earnings.totalEarnings, 'RWF')}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>
                  <Clock style={{ width: '1rem', height: '1rem' }} />
                  Pending Payments
                </div>
                <div style={{ ...styles.statValue, color: '#F59E0B' }}>
                  {earnings.pendingPayments}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>
                  <Users style={{ width: '1rem', height: '1rem' }} />
                  Total Patients Served
                </div>
                <div style={styles.statValue}>
                  {earnings.totalPatients}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>
                  <DollarSign style={{ width: '1rem', height: '1rem' }} />
                  Average Session Fee
                </div>
                <div style={styles.statValue}>
                  {formatCurrency(earnings.averageFee, 'RWF')}
                </div>
              </div>
            </div>

            {/* Charts */}
            {monthlyEarnings.length > 0 && (
              <div style={styles.chartsGrid}>
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Monthly Earnings Trend</h3>
                  <div style={styles.barChart}>
                    {monthlyEarnings.map(([month, amount], index) => (
                      <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                          style={{
                            ...styles.bar,
                            height: `${(amount / maxEarning) * 100}%`,
                            backgroundColor: colors[index % colors.length]
                          }}
                          title={`${month}: ${formatCurrency(amount, 'RWF')}`}
                        />
                        <div style={styles.barLabel}>
                          {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Payment Method Breakdown</h3>
                  <div style={styles.pieChart}>
                    {paymentMethodBreakdown.map(([method, amount], index) => (
                      <div key={method} style={styles.pieItem}>
                        <div style={{ ...styles.pieColor, backgroundColor: colors[index % colors.length] }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#0A1D56' }}>{method}</div>
                          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                            {formatCurrency(amount, 'RWF')}
                          </div>
                        </div>
                      </div>
                    ))}
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
                  placeholder="Search by patient name..."
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
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
                <option value="custom">Custom Range</option>
              </select>
              {dateFilter === 'custom' && (
                <>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                    style={styles.dateInput}
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                    style={styles.dateInput}
                    placeholder="End Date"
                  />
                </>
              )}
            </div>

            {/* Earnings Table */}
            {filteredPayments.length === 0 ? (
              <EmptyState
                message={payments.length === 0 ? "No payments found." : "No payments match your search criteria."}
                icon="💳"
              />
            ) : (
              <div style={styles.paymentsTable}>
                <div style={styles.tableHeader}>
                  <div>Patient Name</div>
                  <div>Appointment Date</div>
                  <div>Session Type</div>
                  <div>Amount Earned</div>
                  <div>Payment Status</div>
                  <div>Date Received</div>
                  <div>Actions</div>
                </div>
                {filteredPayments.map((payment) => {
                  const status = payment.paymentStatus || payment.PaymentStatus || 'Unknown';
                  const appointmentDate = payment.appointmentDate || payment.AppointmentDate;
                  const dateObj = appointmentDate ? new Date(appointmentDate) : null;
                  const paidDate = payment.paidAt || payment.PaidAt;
                  const paidDateObj = paidDate ? new Date(paidDate) : null;

                  return (
                    <div 
                      key={payment.paymentId || payment.PaymentId} 
                      style={styles.tableRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <div style={styles.tableCell}>
                        {payment.payerName || payment.PayerName || 'Unknown'}
                      </div>
                      <div style={styles.tableCell}>
                        <Calendar style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {dateObj ? formatDate(dateObj) : 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        {payment.appointmentType || payment.AppointmentType || 'Consultation'}
                      </div>
                      <div style={styles.tableCell}>
                        <DollarSign style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {formatCurrency(payment.amount || payment.Amount || 0, payment.currency || payment.Currency || 'RWF')}
                      </div>
                      <div style={styles.tableCell}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: status.toLowerCase() === 'completed' ? '#D1FAE5' : 
                                         status.toLowerCase() === 'pending' ? '#FEF3C7' : '#FEE2E2',
                          color: status.toLowerCase() === 'completed' ? '#065F46' : 
                                status.toLowerCase() === 'pending' ? '#92400E' : '#991B1B'
                        }}>
                          {status}
                        </span>
                      </div>
                      <div style={styles.tableCell}>
                        {paidDateObj ? formatDate(paidDateObj) : status.toLowerCase() === 'completed' ? 'N/A' : '-'}
                      </div>
                      <div style={styles.tableCell}>
                        {status.toLowerCase() === 'completed' && (payment.invoiceNumber || payment.InvoiceNumber) ? (
                          <button
                            onClick={async () => {
                              try {
                                const paymentId = payment.paymentId || payment.PaymentId;
                                const blob = await paymentService.downloadInvoice(paymentId);
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `Invoice_${payment.invoiceNumber || payment.InvoiceNumber || paymentId}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                                handleSuccess('Invoice downloaded successfully');
                              } catch (error) {
                                handleError(error, 'Failed to download invoice');
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              backgroundColor: '#1E40AF',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                          >
                            <Download style={{ width: '1rem', height: '1rem' }} />
                            Invoice
                          </button>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>-</span>
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
    </div>
  );
};

export default DoctorPaymentsPage;

