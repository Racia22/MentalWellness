import React, { useState, useEffect, useCallback } from 'react';
import { Pill, Search, Archive, User, Calendar, CheckCircle, Clock, Pause } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import treatmentPlanService from '../../api/services/treatmentPlanService';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import { formatDate } from '../../utils/formatters';

const AdminTreatmentPlansPage = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { sidebarOpen, toggleSidebar } = useApp();

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await treatmentPlanService.getAllTreatmentPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      handleError(error, 'Failed to load treatment plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleArchive = async (planId) => {
    if (!window.confirm('Are you sure you want to archive this treatment plan?')) {
      return;
    }
    try {
      await treatmentPlanService.updateTreatmentPlan(planId, { status: 'Archived' });
      handleSuccess('Treatment plan archived successfully');
      fetchPlans();
    } catch (error) {
      handleError(error, 'Failed to archive treatment plan');
    }
  };

  const filteredPlans = plans.filter(plan => {
    const status = plan.status || plan.Status || '';
    const patientName = plan.patientName || plan.PatientName || '';
    const title = plan.title || plan.Title || '';
    const doctorName = plan.doctorName || plan.DoctorName || '';
    
    const matchesSearch = !searchTerm || 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeStyle = (status) => {
    const s = status || '';
    if (s.toLowerCase() === 'active') {
      return { backgroundColor: '#D1FAE5', color: '#047857' };
    } else if (s.toLowerCase() === 'completed') {
      return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
    } else if (s.toLowerCase() === 'paused') {
      return { backgroundColor: '#FEF3C7', color: '#92400E' };
    } else if (s.toLowerCase() === 'archived') {
      return { backgroundColor: '#F3F4F6', color: '#4B5563' };
    }
    return { backgroundColor: '#F3F4F6', color: '#6B7280' };
  };

  const getStatusIcon = (status) => {
    const s = status || '';
    if (s.toLowerCase() === 'active') return CheckCircle;
    if (s.toLowerCase() === 'paused') return Pause;
    if (s.toLowerCase() === 'completed') return CheckCircle;
    return Clock;
  };

  const styles = {
    page: { minHeight: '100vh', width: '100%', overflowX: 'hidden', backgroundColor: '#F5F5F0', display: 'flex', flexDirection: 'column' },
    body: { display: 'flex', flex: 1, width: '100%' },
    main: { flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#F5F5F0' },
    container: { maxWidth: '1280px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0A1D56' },
    subtitle: { color: '#6B7280', marginBottom: '1.5rem' },
    controls: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    searchBox: { flex: 1, minWidth: '200px', position: 'relative' },
    searchInput: { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', width: '1rem', height: '1rem' },
    filterSelect: { padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#FFFFFF', cursor: 'pointer' },
    plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' },
    planCard: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' },
    planHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' },
    planTitle: { fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' },
    statusBadge: { fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    planInfo: { marginBottom: '0.75rem' },
    planLabel: { fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' },
    planValue: { fontSize: '0.875rem', color: '#111827', fontWeight: '500' },
    archiveButton: { padding: '0.5rem 1rem', backgroundColor: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  };

  if (loading) {
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

  const uniqueStatuses = [...new Set(plans.map(p => p.status || p.Status || 'Unknown').filter(Boolean))];

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>Treatment Plans Management</h1>
              <p style={styles.subtitle}>View all treatment plans, patient progress, and archive older plans</p>
            </div>

            <div style={styles.controls}>
              <div style={styles.searchBox}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by patient, doctor, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {filteredPlans.length === 0 ? (
              <EmptyState
                message={plans.length === 0 ? "No treatment plans found." : "No plans match your search criteria."}
                icon="💊"
              />
            ) : (
              <div style={styles.plansGrid}>
                {filteredPlans.map((plan) => {
                  const StatusIcon = getStatusIcon(plan.status || plan.Status);
                  const badgeStyle = getStatusBadgeStyle(plan.status || plan.Status);
                  return (
                    <div key={plan.planId || plan.PlanId} style={styles.planCard}>
                      <div style={styles.planHeader}>
                        <div>
                          <div style={styles.planTitle}>{plan.title || plan.Title || 'Untitled Plan'}</div>
                          <span style={{ ...styles.statusBadge, ...badgeStyle }}>
                            <StatusIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                            {plan.status || plan.Status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div style={styles.planInfo}>
                        <div style={styles.planLabel}>Patient</div>
                        <div style={styles.planValue}>{plan.patientName || plan.PatientName || 'N/A'}</div>
                      </div>
                      <div style={styles.planInfo}>
                        <div style={styles.planLabel}>Doctor</div>
                        <div style={styles.planValue}>{plan.doctorName || plan.DoctorName || 'N/A'}</div>
                      </div>
                      <div style={styles.planInfo}>
                        <div style={styles.planLabel}>Start Date</div>
                        <div style={styles.planValue}>{formatDate(plan.startDate || plan.StartDate)}</div>
                      </div>
                      {plan.endDate || plan.EndDate ? (
                        <div style={styles.planInfo}>
                          <div style={styles.planLabel}>End Date</div>
                          <div style={styles.planValue}>{formatDate(plan.endDate || plan.EndDate)}</div>
                        </div>
                      ) : null}
                      {(plan.status || plan.Status || '').toLowerCase() !== 'archived' && (
                        <button
                          onClick={() => handleArchive(plan.planId || plan.PlanId)}
                          style={styles.archiveButton}
                        >
                          <Archive style={{ width: '0.875rem', height: '0.875rem' }} />
                          Archive
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
    </div>
  );
};

export default AdminTreatmentPlansPage;

