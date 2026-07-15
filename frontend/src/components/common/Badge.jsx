import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full tracking-wide transition-colors duration-200';

  const variants = {
    default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-750',
    success: 'bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 dark:border-emerald-500/10',
    warning: 'bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-450 border border-amber-500/20 dark:border-amber-500/10',
    danger: 'bg-rose-500/10 dark:bg-rose-500/5 text-rose-600 dark:text-rose-450 border border-rose-500/20 dark:border-rose-500/10',
    info: 'bg-blue-500/10 dark:bg-blue-500/5 text-blue-600 dark:text-blue-450 border border-blue-500/20 dark:border-blue-500/10',
    locked: 'bg-zinc-200/50 dark:bg-zinc-900/60 text-zinc-450 dark:text-zinc-500 border border-zinc-300/40 dark:border-zinc-800/40',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs font-semibold',
  };

  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <span className={combinedClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
