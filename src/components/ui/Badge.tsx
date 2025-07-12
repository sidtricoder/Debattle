import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className,
  onClick
}) => {
  const baseClasses = 'inline-flex items-center gap-1 rounded-full font-medium';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light',
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
    accent: 'bg-accent text-white'
  };

  const Component = onClick ? motion.button : motion.span;

  return (
    <Component
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        onClick && 'cursor-pointer hover:scale-105 transition-transform',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </Component>
  );
};

export default Badge;
