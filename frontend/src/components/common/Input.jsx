import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  leftIcon = null,
  rightIcon = null,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Styling maps GovTech standard usability with high contrast and accessible outlines
  const wrapperClasses = 'flex flex-col gap-1.5 w-full';
  
  const labelClasses = 'text-sm font-semibold text-zinc-700 dark:text-zinc-300';
  
  const inputBaseClasses = 'w-full rounded-xl border bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent';
  
  const stateClasses = error
    ? 'border-rose-500 dark:border-rose-500/80 focus:ring-rose-500'
    : 'border-zinc-300 dark:border-zinc-800 focus:ring-emerald-500';

  const combinedInputClasses = `${inputBaseClasses} ${stateClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`;

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-zinc-400 dark:text-zinc-600 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            id={inputId}
            ref={ref}
            className={combinedInputClasses}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={combinedInputClasses}
            {...props}
          />
        )}

        {rightIcon && (
          <div className="absolute right-3 text-zinc-400 dark:text-zinc-650 pointer-events-none flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-455 font-medium mt-0.5">
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
