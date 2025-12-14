import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';

const NotFoundPage = () => {
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
          <h1 style={{ fontSize: '4rem', margin: '0 0 1rem 0' }}>404</h1>
          <h2 style={{ margin: '0 0 1rem 0' }}>Page Not Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            The page you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default NotFoundPage;

