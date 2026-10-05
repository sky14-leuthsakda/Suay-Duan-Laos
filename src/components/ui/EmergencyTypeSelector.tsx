import React from 'react';
import { EmergencyType } from '../../types';
import { useTranslation } from '../../i18n';
import { triggerHaptic } from '../../utils/haptics';
import { Flame, HeartPulse, Car, ShieldCheck, Waves, HelpCircle } from 'lucide-react';

export interface EmergencyTypeSelectorProps {
  selectedType: EmergencyType | null;
  onSelectType: (type: EmergencyType) => void;
  className?: string;
}

export const EmergencyTypeSelector: React.FC<EmergencyTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  className = '',
}) => {
  const { t } = useTranslation();

  const typesConfig: Array<{
    type: EmergencyType;
    label: string;
    icon: React.ReactNode;
    activeBorder: string;
    activeBg: string;
    activeText: string;
    inactiveIcon: string;
  }> = [
    {
      type: 'medical',
      label: t('emergencyTypes.medical'),
      icon: <HeartPulse className="w-5 h-5" />,
      activeBorder: 'border-red-500',
      activeBg: 'bg-red-50 dark:bg-red-950/50',
      activeText: 'text-red-700 dark:text-red-300',
      inactiveIcon: 'text-red-400 dark:text-red-500',
    },
    {
      type: 'accident',
      label: t('emergencyTypes.accident'),
      icon: <Car className="w-5 h-5" />,
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-50 dark:bg-amber-950/50',
      activeText: 'text-amber-800 dark:text-amber-300',
      inactiveIcon: 'text-amber-500 dark:text-amber-400',
    },
    {
      type: 'fire',
      label: t('emergencyTypes.fire'),
      icon: <Flame className="w-5 h-5" />,
      activeBorder: 'border-orange-500',
      activeBg: 'bg-orange-50 dark:bg-orange-950/50',
      activeText: 'text-orange-700 dark:text-orange-300',
      inactiveIcon: 'text-orange-500 dark:text-orange-400',
    },
    {
      type: 'crime',
      label: t('emergencyTypes.crime'),
      icon: <ShieldCheck className="w-5 h-5" />,
      activeBorder: 'border-blue-500',
      activeBg: 'bg-blue-50 dark:bg-blue-950/50',
      activeText: 'text-blue-700 dark:text-blue-300',
      inactiveIcon: 'text-blue-500 dark:text-blue-400',
    },
    {
      type: 'flood',
      label: t('emergencyTypes.flood'),
      icon: <Waves className="w-5 h-5" />,
      activeBorder: 'border-cyan-500',
      activeBg: 'bg-cyan-50 dark:bg-cyan-950/50',
      activeText: 'text-cyan-800 dark:text-cyan-300',
      inactiveIcon: 'text-cyan-500 dark:text-cyan-400',
    },
    {
      type: 'other',
      label: t('emergencyTypes.other'),
      icon: <HelpCircle className="w-5 h-5" />,
      activeBorder: 'border-purple-500',
      activeBg: 'bg-purple-50 dark:bg-purple-950/50',
      activeText: 'text-purple-700 dark:text-purple-300',
      inactiveIcon: 'text-purple-500 dark:text-purple-400',
    },
  ];

  const handleSelect = (type: EmergencyType) => {
    triggerHaptic('tick');
    onSelectType(type);
  };

  return (
    <div className={`select-none ${className}`}>
      <div className="grid grid-cols-3 gap-2">
        {typesConfig.map((item) => {
          const isSelected = selectedType === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => handleSelect(item.type)}
              aria-pressed={isSelected}
              style={{ minHeight: '64px' }}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 px-1 ${
                isSelected
                  ? `border-2 ${item.activeBorder} ${item.activeBg} ${item.activeText} font-bold shadow-sm`
                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 font-medium'
              }`}
            >
              <span className={isSelected ? item.activeText : item.inactiveIcon}>
                {item.icon}
              </span>
              <span className="text-[13px] leading-tight text-center line-clamp-1 w-full px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
