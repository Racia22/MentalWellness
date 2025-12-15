import React from 'react';
import Spinner from './Spinner';
import './Loading.css';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <Spinner size="large" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingScreen;

