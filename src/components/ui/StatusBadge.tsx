import React from 'react';
import { IncidentStatus } from '../../types';
import { useTranslation } from '../../i18n';
import { 
  Inbox, 
  CheckCircle2, 
  Send, 
  Truck, 
  MapPin, 
  CheckCheck, 
  XCircle 
} from 'lucide-react';

export interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'default',
  className = '',
}) => {
  const { t } = useTranslation();

  const configs: Record<IncidentStatus, {
    label: string;
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
  }> = {
    received: {
      label: t('status.received'),
      bg: 'bg-slate-500/15',
      border: 'border-slate-500/30',
      text: 'text-slate-700 dark:text-slate-300',
      icon: <Inbox className="w-3.5 h-3.5" />,
    },
    acknowledged: {
      label: t('status.acknowledged'),
      bg: 'bg-blue-500/15',
      border: 'border-blue-500/30',
      text: 'text-blue-700 dark:text-blue-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    dispatched: {
      label: t('status.dispatched'),
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      text: 'text-amber-700 dark:text-amber-300',
      icon: <Send className="w-3.5 h-3.5" />,
    },
    on_the_way: {
      label: t('status.on_the_way'),
      bg: 'bg-pink-500/15',
      border: 'border-pink-500/30',
      text: 'text-pink-700 dark:text-pink-300',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    arrived: {
      label: t('status.arrived'),
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: <MapPin className="w-3.5 h-3.5" />,
    },
    resolved: {
      label: t('status.resolved'),
      bg: 'bg-green-600/15',
      border: 'border-green-600/30',
      text: 'text-green-700 dark:text-green-300',
      icon: <CheckCheck className="w-3.5 h-3.5" />,
    },
    cancelled: {
      label: t('status.cancelled'),
      bg: 'bg-gray-500/15',
      border: 'border-gray-500/30',
      text: 'text-gray-600 dark:text-gray-400',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const current = configs[status] || configs.received;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    default: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${current.border} ${current.text} ${sizeClasses} ${className}`}
    >
      <span className="shrink-0">{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
};
