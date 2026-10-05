import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'emergency';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm',
    elevated: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-950/10',
    emergency: 'bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-900/50 shadow-md shadow-rose-950/10',
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
