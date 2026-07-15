import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Base classes reflecting professional SaaS + Trustworthy Gov portal styling
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles mapping
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-550/10 dark:shadow-emerald-900/10',
    secondary: 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-550/10 dark:shadow-teal-900/10',
    outline: 'border border-zinc-300 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300',
    ghost: 'hover:bg-zinc-155/70 dark:hover:bg-zinc-900/75 text-zinc-700 dark:text-zinc-300',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-550/10 dark:shadow-rose-900/10',
  };

  // Size styles mapping
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  };

  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <motion.button
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      type={type}
      className={combinedClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin text-current" />}
      {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;
