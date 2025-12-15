import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';

const UnauthorizedPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}>
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Card style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '4rem', margin: '0 0 1rem 0' }}>403</h1>
          <h2 style={{ margin: '0 0 1rem 0' }}>Unauthorized Access</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            You don't have permission to access this page.
          </p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

