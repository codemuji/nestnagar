import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  className, 
  containerClassName,
  ...props 
}) => {
  return (
    <div className={twMerge('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-semibold text-text-secondary px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={twMerge(
            'input-field',
            Icon && 'pr-12',
            error && 'border-brand-error focus:border-brand-error',
            className
          )}
          {...props}
        />
        {Icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-secondary transition-colors">
            <Icon size={20} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-brand-error mt-1 px-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
