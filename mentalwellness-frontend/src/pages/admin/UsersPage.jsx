import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, CheckCircle, XCircle, RefreshCw, Lock, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import adminService from '../../api/services/adminService';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import { formatDate } from '../../utils/formatters';

const AdminUsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const { sidebarOpen, toggleSidebar } = useApp();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterRole !== 'all') filters.role = filterRole;
      if (filterStatus !== 'all') filters.isActive = filterStatus === 'active';
      const data = await adminService.getAllUsers(filters);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      handleError(error, 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleActivate = async (userId) => {
    try {
      await adminService.activateUser(userId);
      handleSuccess('User activated successfully');
      fetchUsers();
    } catch (error) {
      handleError(error, 'Failed to activate user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user? They will not be able to log in.')) {
      return;
    }
    try {
      await adminService.deactivateUser(userId);
      handleSuccess('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      handleError(error, 'Failed to deactivate user');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      handleError(new Error('Password must be at least 8 characters'), 'Password must be at least 8 characters long');
      return;
    }
    try {
      await adminService.resetUserPassword(selectedUser.userId || selectedUser.UserId, newPassword);
      handleSuccess('Password reset successfully');
      setShowResetPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error) {
      handleError(error, 'Failed to reset password');
    }
  };

  const filteredUsers = users.filter(user => {
    const email = (user.email || user.Email || '').toLowerCase();
    const fullName = (user.fullName || user.FullName || '').toLowerCase();
    const phone = (user.phone || user.Phone || '').toLowerCase();
    
    return !searchTerm || 
      email.includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm.toLowerCase());
  });

  const getRoleBadgeStyle = (role) => {
    const r = role || '';
    if (r.toLowerCase() === 'admin') {
      return { backgroundColor: '#FEE2E2', color: '#DC2626' };
    } else if (r.toLowerCase() === 'doctor') {
      return { backgroundColor: '#D1FAE5', color: '#047857' };
    } else if (r.toLowerCase() === 'patient') {
      return { backgroundColor: '#DBEAFE', color: '#2563EB' };
    }
    return { backgroundColor: '#F3F4F6', color: '#6B7280' };
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
    usersTable: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 2fr', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '0.875rem', color: '#374151' },
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 2fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s' },
    tableCell: { fontSize: '0.875rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    roleBadge: { fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '0.375rem' },
    statusBadge: { fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    actionButtons: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
    actionButton: { padding: '0.5rem 0.75rem', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s' },
    activateButton: { backgroundColor: '#D1FAE5', color: '#047857' },
    deactivateButton: { backgroundColor: '#FEE2E2', color: '#DC2626' },
    resetPasswordButton: { backgroundColor: '#DBEAFE', color: '#2563EB' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', padding: '2rem', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
    modalTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0A1D56' },
    modalInput: { width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' },
    modalButtons: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
    modalButton: { padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
    cancelButton: { backgroundColor: '#F3F4F6', color: '#374151' },
    submitButton: { backgroundColor: '#2563EB', color: '#FFFFFF' },
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

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>Users Management</h1>
              <p style={styles.subtitle}>Manage all users in the system</p>
            </div>

            <div style={styles.controls}>
              <div style={styles.searchBox}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Patient">Patient</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {filteredUsers.length === 0 ? (
              <EmptyState
                message={users.length === 0 ? "No users found." : "No users match your search criteria."}
                icon="👥"
              />
            ) : (
              <div style={styles.usersTable}>
                <div style={styles.tableHeader}>
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Created</div>
                  <div>Actions</div>
                </div>
                {filteredUsers.map((user) => {
                  const isActive = user.isActive !== undefined ? user.isActive : user.IsActive;
                  const roleStyle = getRoleBadgeStyle(user.userRole || user.UserRole);
                  return (
                    <div 
                      key={user.userId || user.UserId} 
                      style={styles.tableRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <div style={styles.tableCell}>
                        <UserIcon style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {user.fullName || user.FullName || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        <Mail style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {user.email || user.Email || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        <span style={{ ...styles.roleBadge, ...roleStyle }}>
                          {user.userRole || user.UserRole || 'Unknown'}
                        </span>
                      </div>
                      <div style={styles.tableCell}>
                        <span style={{ ...styles.statusBadge, ...(isActive ? { backgroundColor: '#D1FAE5', color: '#047857' } : { backgroundColor: '#FEE2E2', color: '#DC2626' }) }}>
                          {isActive ? <CheckCircle style={{ width: '0.75rem', height: '0.75rem' }} /> : <XCircle style={{ width: '0.75rem', height: '0.75rem' }} />}
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={styles.tableCell}>
                        <Calendar style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {formatDate(user.createdAt || user.CreatedAt)}
                      </div>
                      <div style={styles.actionButtons}>
                        {isActive ? (
                          <button
                            onClick={() => handleDeactivate(user.userId || user.UserId)}
                            style={{ ...styles.actionButton, ...styles.deactivateButton }}
                            title="Deactivate user"
                          >
                            <XCircle style={{ width: '0.75rem', height: '0.75rem' }} />
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.userId || user.UserId)}
                            style={{ ...styles.actionButton, ...styles.activateButton }}
                            title="Activate user"
                          >
                            <CheckCircle style={{ width: '0.75rem', height: '0.75rem' }} />
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetPasswordModal(true);
                          }}
                          style={{ ...styles.actionButton, ...styles.resetPasswordButton }}
                          title="Reset password"
                        >
                          <Lock style={{ width: '0.75rem', height: '0.75rem' }} />
                          Reset Password
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showResetPasswordModal && selectedUser && (
              <div style={styles.modalOverlay} onClick={() => setShowResetPasswordModal(false)}>
                <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                  <h2 style={styles.modalTitle}>
                    Reset Password for {selectedUser.fullName || selectedUser.FullName || 'User'}
                  </h2>
                  <input
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.modalInput}
                    autoFocus
                  />
                  <div style={styles.modalButtons}>
                    <button
                      onClick={() => {
                        setShowResetPasswordModal(false);
                        setNewPassword('');
                        setSelectedUser(null);
                      }}
                      style={{ ...styles.modalButton, ...styles.cancelButton }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetPassword}
                      style={{ ...styles.modalButton, ...styles.submitButton }}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsersPage;
