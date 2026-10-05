import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { Sun, Moon, Monitor } from 'lucide-react';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme } = useAppStore();

  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
  const label = theme === 'light' ? 'ໂໝດມືດ' : theme === 'dark' ? 'ອັດຕະໂນມັດ' : 'ໂໝດສະຫວ່າງ';
  const icon = theme === 'light' ? <Moon className="w-5 h-5" /> : theme === 'dark' ? <Monitor className="w-5 h-5" /> : <Sun className="w-5 h-5" />;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={`touch-icon rounded-2xl p-2 border transition-colors select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
    >
      {icon}
    </button>
  );
};
