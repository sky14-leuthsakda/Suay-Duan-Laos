import React from 'react';
import { IncidentPriority } from '../../types';
import { useTranslation } from '../../i18n';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export interface PriorityBadgeProps {
  priority: IncidentPriority;
  size?: 'sm' | 'default';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'default',
  className = '',
}) => {
  const { t } = useTranslation();

  const configs: Record<IncidentPriority, {
    label: string;
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
    pulse?: boolean;
  }> = {
    critical: {
      label: t('priority.critical'),
      bg: 'bg-rose-500/20 dark:bg-rose-950/40',
      border: 'border-rose-500/50',
      text: 'text-rose-600 dark:text-rose-400 font-bold',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />,
      pulse: true,
    },
    high: {
      label: t('priority.high'),
      bg: 'bg-orange-500/15 dark:bg-orange-950/40',
      border: 'border-orange-500/40',
      text: 'text-orange-600 dark:text-orange-400 font-semibold',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
    },
    medium: {
      label: t('priority.medium'),
      bg: 'bg-amber-500/15 dark:bg-amber-950/30',
      border: 'border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
    },
    low: {
      label: t('priority.low'),
      bg: 'bg-slate-500/15 dark:bg-slate-800/60',
      border: 'border-slate-500/30',
      text: 'text-slate-600 dark:text-slate-400',
      icon: <Info className="w-3.5 h-3.5 text-slate-500" />,
    },
  };

  const current = configs[priority] || configs.medium;
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1.5' : 'text-sm px-3 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.border} ${current.text} ${sizeClasses} ${className}`}
    >
      {current.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
        </span>
      )}
      <span className="shrink-0">{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
};
