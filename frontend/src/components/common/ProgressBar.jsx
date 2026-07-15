import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <span>Overall Progress</span>
          <span className="text-emerald-600 dark:text-emerald-450">{Math.round(percentage)}%</span>
        </div>
      )}
      
      {/* Outer track */}
      <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
        {/* Animated Fill */}
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
