import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Lock } from 'lucide-react';
import Badge from './Badge';

export const Timeline = ({ children, className = '' }) => {
  return (
    <div className={`relative border-l border-zinc-200 dark:border-zinc-800 ml-4 pl-6 space-y-8 ${className}`}>
      {children}
    </div>
  );
};

export const TimelineItem = ({
  title,
  description,
  department,
  status = 'locked', // locked, pending, in_progress, completed
  index = 0,
  children,
  className = ''
}) => {
  // Dot configs mapping based on GovTech administrative state
  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      colorClass: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-emerald-200/20 dark:ring-emerald-500/10',
      badgeVariant: 'success',
      badgeLabel: 'Completed',
    },
    in_progress: {
      icon: Clock,
      colorClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-blue-200/20 dark:ring-blue-500/10 animate-pulse',
      badgeVariant: 'info',
      badgeLabel: 'In Progress',
    },
    pending: {
      icon: Circle,
      colorClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 ring-amber-200/20 dark:ring-amber-500/10',
      badgeVariant: 'warning',
      badgeLabel: 'Pending',
    },
    locked: {
      icon: Lock,
      colorClass: 'text-zinc-400 bg-zinc-100 dark:bg-zinc-900 ring-zinc-200/50 dark:ring-zinc-800/50',
      badgeVariant: 'locked',
      badgeLabel: 'Locked',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.locked;
  const IconComponent = currentStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className={`relative group ${className}`}
    >
      {/* Icon node positioning */}
      <span className={`absolute -left-[37px] top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-950 ${currentStatus.colorClass}`}>
        <IconComponent size={14} className="stroke-[2.5]" />
      </span>

      {/* Content wrapper */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-none">
              {title}
            </h3>
            {department && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                • {department}
              </span>
            )}
          </div>
          <Badge variant={currentStatus.badgeVariant} size="sm">
            {currentStatus.badgeLabel}
          </Badge>
        </div>

        {description && (
          <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed max-w-3xl">
            {description}
          </p>
        )}

        {children && <div className="pt-2">{children}</div>}
      </div>
    </motion.div>
  );
};
