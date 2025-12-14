import React from 'react';
import './Card.css';

const Card = ({ children, title, footer, className = '', style, ...props }) => {
  const defaultStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div className={`card ${className}`} style={defaultStyle} {...props}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;

