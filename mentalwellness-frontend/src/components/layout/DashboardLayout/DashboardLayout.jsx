import React, { useState } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import { useApp } from '../../../contexts/AppContext';

const DashboardLayout = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useApp();

  const styles = {
    layout: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      backgroundColor: '#f9fafb',
    },
    body: {
      display: 'flex',
      flex: 1,
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },
    main: {
      flex: 1,
      padding: '2rem',
      backgroundColor: '#f9fafb',
      minHeight: 'calc(100vh - 4rem)',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      transition: 'margin-left 0.3s ease',
    },
  };

  return (
    <div style={styles.layout}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;

