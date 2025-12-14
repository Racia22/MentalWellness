import React from 'react';
import './Select.css';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`select ${error ? 'input-error' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Select;

