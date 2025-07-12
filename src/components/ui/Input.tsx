import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label htmlFor={inputId} className="font-semibold mb-1">{label}</label>}
      <div className={clsx('relative flex items-center', error && 'ring-2 ring-red-400', success && 'ring-2 ring-success') }>
        {leftIcon && <span className="absolute left-3">{leftIcon}</span>}
        <input
          id={inputId}
          className={clsx(
            'w-full px-4 py-2 rounded border border-secondary focus:ring-2 focus:ring-accent transition-all',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : success ? `${inputId}-success` : undefined}
          {...props}
        />
        {rightIcon && <span className="absolute right-3">{rightIcon}</span>}
      </div>
      {error && <span id={`${inputId}-error`} className="text-red-500 text-xs">{error}</span>}
      {success && <span id={`${inputId}-success`} className="text-success text-xs">{success}</span>}
    </div>
  );
};

export default Input;
