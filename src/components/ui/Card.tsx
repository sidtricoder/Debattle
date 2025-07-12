import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'light' | 'dark';
}

export const Card: React.FC<CardProps> = ({ children, className, gradient = 'light' }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 8px 32px 0 rgba(60,60,120,0.12)' }}
    className={clsx(
      'rounded-2xl p-6 shadow bg-card-gradient-light dark:bg-card-gradient-dark transition-all duration-200',
      gradient === 'dark' && 'bg-card-gradient-dark',
      className
    )}
    tabIndex={0}
    role="region"
  >
    {children}
  </motion.div>
);

export default Card;
