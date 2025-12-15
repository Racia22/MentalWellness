import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const LandingLayout = ({ children }) => {
  const styles = {
    layout: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },
    main: {
      flex: 1,
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.layout}>
      <Header />
      <main style={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;

