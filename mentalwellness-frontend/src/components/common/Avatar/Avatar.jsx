import React from 'react';
import './Avatar.css';
import { getInitials } from '../../../utils/helpers';

const Avatar = ({ src, alt, name, size = 'medium', className = '' }) => {
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={alt || name} />
      ) : (
        <span className="avatar-initials">{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;

