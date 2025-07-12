import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'bg-secondary-light dark:bg-secondary animate-pulse';
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={clsx(
              baseClasses,
              'rounded',
              i === lines - 1 ? 'w-3/4' : 'w-full',
              'h-4',
              className
            )}
            style={{ width: i === lines - 1 ? '75%' : width }}
          />
        ))}
      </div>
    );
  }

  const getClasses = () => {
    switch (variant) {
      case 'circular':
        return clsx(baseClasses, 'rounded-full', className);
      case 'rectangular':
        return clsx(baseClasses, 'rounded', className);
      default:
        return clsx(baseClasses, 'rounded', className);
    }
  };

  return (
    <motion.div
      className={getClasses()}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'circular' ? '40px' : '20px')
      }}
    />
  );
};

export default Skeleton;
