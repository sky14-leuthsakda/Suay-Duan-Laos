import React from 'react';
import { EMERGENCY_NUMBERS } from '../../config/emergencyNumbers';
import { Shield, Flame, HeartPulse } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface EmergencyCallRowProps {
  className?: string;
}

export const EmergencyCallRow: React.FC<EmergencyCallRowProps> = ({ className = '' }) => {
  const { language } = useTranslation();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'police':
        return <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case 'fire':
        return <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />;
      case 'ambulance':
      default:
        return <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
    }
  };

  const getColors = (id: string) => {
    switch (id) {
      case 'police':
        return 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200';
      case 'fire':
        return 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-900/60 text-orange-900 dark:text-orange-200';
      case 'ambulance':
      default:
        return 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200';
    }
  };

  return (
    <div className={`grid grid-cols-3 gap-2 select-none ${className}`}>
      {EMERGENCY_NUMBERS.map((contact) => (
        <a
          key={contact.id}
          href={`tel:${contact.number}`}
          aria-label={`Call ${contact.nameLo} ${contact.number}`}
          className={`touch-target flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-sm ${getColors(
            contact.id
          )}`}
        >
          <div className="flex items-center gap-1 mb-0.5">
            {getIcon(contact.icon)}
            <span className="text-base font-black tracking-tight">
              {contact.number}
            </span>
          </div>
          <span className="text-[13px] font-medium leading-none opacity-80 line-clamp-1">
            {language === 'lo' ? contact.nameLo : contact.nameEn}
          </span>
        </a>
      ))}
    </div>
  );
};
