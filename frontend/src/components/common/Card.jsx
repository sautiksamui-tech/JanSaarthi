import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  variant = 'default',
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300 overflow-hidden';
  
  const variants = {
    default: 'bg-white dark:bg-zinc-950 border-zinc-200/60 dark:border-zinc-800 shadow-sm shadow-zinc-100 dark:shadow-none',
    glass: 'bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md border-white/20 dark:border-zinc-800/40 shadow-xl',
    outline: 'border-zinc-300 dark:border-zinc-800 bg-transparent',
    interactive: 'bg-white dark:bg-zinc-950 border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer shadow-zinc-100 dark:shadow-none',
  };

  const combinedClasses = `${baseClasses} ${variants[variant]} ${className}`;

  if (variant === 'interactive' || onClick) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={combinedClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-200 dark:border-zinc-800/80 ${className}`}>
    {children}
  </div>
);
