import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'outline' | 'ghost';

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof motion.button> {
  variant?: ButtonVariant;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-button-gradient text-white shadow hover:scale-105',
  secondary: 'bg-secondary text-white hover:bg-secondary-light',
  accent: 'bg-accent text-white hover:bg-accent-light',
  success: 'bg-success text-white hover:bg-success-light',
  outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'bg-transparent text-primary hover:bg-primary/10',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    whileHover={{ scale: 1.03 }}
    className={clsx(
      'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-base focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-150',
      variantClasses[variant],
      loading && 'opacity-60 cursor-not-allowed',
      className
    )}
    disabled={disabled || loading}
    type={type}
    aria-busy={loading}
    {...props}
  >
    {loading ? (
      <span className="w-5 h-5 border-2 border-t-2 border-accent border-t-transparent rounded-full animate-spin" aria-label="Loading" />
    ) : (
      <>
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    )}
  </motion.button>
);

export default Button;
