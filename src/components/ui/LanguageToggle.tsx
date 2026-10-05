import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { useTranslation } from '../../i18n';
import { Globe } from 'lucide-react';

export interface LanguageToggleProps {
  className?: string;
  showText?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  showText = false,
}) => {
  const { language, setLanguage } = useAppStore();
  const { t } = useTranslation();

  const toggle = () => {
    const next = language === 'lo' ? 'en' : 'lo';
    setLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('a11y.langToggle')}
      className={`touch-target rounded-2xl px-3.5 py-2.5 border transition-colors select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 font-medium ${
        language === 'lo'
          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
      } ${className}`}
      title={language === 'lo' ? 'ປ່ຽນເປັນພາສາອັງກິດ (Switch to English)' : 'Switch to Lao (ປ່ຽນເປັນພາສາລາວ)'}
    >
      <Globe className="w-5 h-5 shrink-0" />
      {showText ? (
        <span className="text-sm font-semibold tracking-wide ml-2">
          {language === 'lo' ? 'ລາວ' : 'EN'}
        </span>
      ) : (
        <span className="text-xs font-bold uppercase tracking-wider ml-1.5">
          {language}
        </span>
      )}
    </button>
  );
};
