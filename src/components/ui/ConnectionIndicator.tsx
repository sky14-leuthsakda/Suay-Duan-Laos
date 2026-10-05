import React from 'react';
import { ConnectionState } from '../../types';
import { useTranslation } from '../../i18n';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export interface ConnectionIndicatorProps {
  state?: ConnectionState;
  showLabel?: boolean;
  className?: string;
  isStale?: boolean;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  state = 'live',
  showLabel = true,
  className = '',
  isStale = false,
}) => {
  const { t } = useTranslation();

  const config = {
    live: {
      color: 'bg-emerald-500 text-emerald-600 dark:text-emerald-400',
      badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      icon: <Wifi className="w-3.5 h-3.5" />,
      label: t('connection.live'),
      aria: 'Online & connected in real-time',
    },
    reconnecting: {
      color: 'bg-amber-500 text-amber-600 dark:text-amber-400 animate-pulse',
      badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
      label: t('connection.reconnecting'),
      aria: 'Reconnecting to real-time service',
    },
    offline: {
      color: 'bg-rose-500 text-rose-600 dark:text-rose-400',
      badge: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      icon: <WifiOff className="w-3.5 h-3.5" />,
      label: t('connection.offline'),
      aria: 'Disconnected from network',
    },
  }[state];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-all ${config.badge} ${className}`}
      title={config.aria}
    >
      <span className="relative flex h-2 w-2">
        {state === 'live' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color.split(' ')[0]}`} />
      </span>

      <span className="shrink-0">{config.icon}</span>

      {showLabel && (
        <span className="tracking-wide">
          {config.label}
          {isStale && (
            <span className="ml-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 underline">
              ({t('common.stale')})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
