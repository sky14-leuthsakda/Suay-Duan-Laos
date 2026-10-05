import React from 'react';
import { EmergencyType } from '../../types';
import { useTranslation } from '../../i18n';
import { Flame, HeartPulse, Car, ShieldAlert, Waves, HelpCircle } from 'lucide-react';

export interface EmergencyTypeBadgeProps {
  type: EmergencyType;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const EmergencyTypeBadge: React.FC<EmergencyTypeBadgeProps> = ({
  type,
  size = 'default',
  className = '',
}) => {
  const { t } = useTranslation();

  const configs: Record<EmergencyType, {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
  }> = {
    fire: {
      label: t('emergencyTypes.fire'),
      bg: 'bg-orange-500/15',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-500/30',
      icon: <Flame className="w-4 h-4 text-orange-500" />,
    },
    medical: {
      label: t('emergencyTypes.medical'),
      bg: 'bg-red-500/15',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-500/30',
      icon: <HeartPulse className="w-4 h-4 text-red-500" />,
    },
    accident: {
      label: t('emergencyTypes.accident'),
      bg: 'bg-amber-500/15',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-500/30',
      icon: <Car className="w-4 h-4 text-amber-500" />,
    },
    crime: {
      label: t('emergencyTypes.crime'),
      bg: 'bg-blue-500/15',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500/30',
      icon: <ShieldAlert className="w-4 h-4 text-blue-500" />,
    },
    flood: {
      label: t('emergencyTypes.flood'),
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-800 dark:text-cyan-300',
      border: 'border-cyan-500/30',
      icon: <Waves className="w-4 h-4 text-cyan-500" />,
    },
    other: {
      label: t('emergencyTypes.other'),
      bg: 'bg-purple-500/15',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-500/30',
      icon: <HelpCircle className="w-4 h-4 text-purple-500" />,
    },
  };

  const current = configs[type] || configs.other;

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
