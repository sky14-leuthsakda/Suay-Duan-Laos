import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { useTranslation } from '../i18n';
import { SMSFallbackModal } from '../components';
import {
  Settings,
  Home,
  Compass,
  BookHeart,
  User,
  WifiOff,
  VolumeX,
  Database,
  Sparkles,
  X,
  Sun,
  Moon,
  Monitor,
  Download,
  Check,
} from 'lucide-react';
import { promptPWAInstall, onPWAInstallStateChange } from '../services/pwa';

// ─── Lao flag SVG ──────────────────────────────────────────────────────────
const LaoFlag: React.FC<{ className?: string }> = ({ className = 'w-5 h-4' }) => (
  <svg viewBox="0 0 30 20" className={className} aria-hidden="true">
    <rect width="30" height="20" fill="#CE1126" />
    <rect y="5" width="30" height="10" fill="#002868" />
    <circle cx="15" cy="10" r="3.5" fill="white" />
  </svg>
);

// ─── UK flag SVG ───────────────────────────────────────────────────────────
const UKFlag: React.FC<{ className?: string }> = ({ className = 'w-5 h-4' }) => (
  <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
    <rect width="60" height="40" fill="#012169" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="white" strokeWidth="8" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 V40 M0,20 H60" stroke="white" strokeWidth="12" />
    <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8" />
  </svg>
);

// ─── Inline Switch component ───────────────────────────────────────────────
interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, id, label, description, icon }) => (
  <div className="flex items-center justify-between py-3 px-0">
    <label htmlFor={id} className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
      {icon && (
        <span className="shrink-0 text-slate-500 dark:text-slate-400 w-5 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-slate-900 dark:text-white leading-tight">
          {label}
        </span>
        {description && (
          <span className="block text-[13px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
            {description}
          </span>
        )}
      </span>
    </label>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={onChange}
      className={`relative shrink-0 ml-3 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
        checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

// ─── Settings Bottom Sheet ─────────────────────────────────────────────────
interface SettingsSheetProps {
  onClose: () => void;
  canInstall: boolean;
  onInstall: () => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({ onClose, canInstall, onInstall }) => {
  const { t } = useTranslation();
  const { theme, setTheme, language, setLanguage, silentMode, dataSaver, trainingMode, toggleSilentMode, toggleDataSaver, toggleTrainingMode } = useAppStore();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const arr = Array.from(focusable);
        const first = arr[0];
        const last = arr[arr.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const themeOptions: Array<{ value: 'light' | 'dark' | 'auto'; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: t('toggles.themeLight'), icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: t('toggles.themeDark'), icon: <Moon className="w-4 h-4" /> },
    { value: 'auto', label: t('toggles.themeAuto'), icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-250 focus:outline-none"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 id="settings-title" className="text-[18px] font-bold text-slate-900 dark:text-white">
            {t('settings.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="touch-icon rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Toggles */}
          <Switch
            id="silent-mode"
            checked={silentMode}
            onChange={toggleSilentMode}
            label={t('toggles.silentMode')}
            description={t('toggles.silentModeDesc')}
            icon={<VolumeX className="w-4 h-4" />}
          />
          <Switch
            id="data-saver"
            checked={dataSaver}
            onChange={toggleDataSaver}
            label={t('toggles.dataSaver')}
            description={t('toggles.dataSaverDesc')}
            icon={<Database className="w-4 h-4" />}
          />
          <Switch
            id="training-mode"
            checked={trainingMode}
            onChange={toggleTrainingMode}
            label={t('toggles.trainingMode')}
            description={t('toggles.trainingModeDesc')}
            icon={<Sparkles className="w-4 h-4" />}
          />

          {/* Theme segmented control */}
          <div className="py-3">
            <span className="block text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
              {t('toggles.themeLight').replace(/ສະຫວ່າງ|Light/, '')} {/* trim to just show section-level label */}
            </span>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={theme === opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                    theme === opt.value
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language segmented control */}
          <div className="py-3">
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                aria-pressed={language === 'lo'}
                onClick={() => setLanguage('lo')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  language === 'lo'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <LaoFlag className="w-5 h-3.5" />
                <span>ລາວ</span>
                {language === 'lo' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                aria-pressed={language === 'en'}
                onClick={() => setLanguage('en')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  language === 'en'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <UKFlag className="w-5 h-3.5" />
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* PWA Install */}
          {canInstall && (
            <div className="py-3">
              <button
                type="button"
                onClick={onInstall}
                className="w-full touch-target flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-[14px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t('settings.installApp')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Main CitizenLayout ────────────────────────────────────────────────────
export const CitizenLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { connectionState, silentMode, trainingMode } = useAppStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const prevConnection = useRef(connectionState);

  // PWA install prompt state
  useEffect(() => {
    return onPWAInstallStateChange(setCanInstall);
  }, []);

  // Manage the offline/reconnecting banner visibility
  useEffect(() => {
    const isProblematic = connectionState === 'offline' || connectionState === 'reconnecting';
    if (isProblematic) {
      setShowBanner(true);
    } else if (prevConnection.current !== 'live' && connectionState === 'live') {
      // Was offline/reconnecting, now recovered — auto-hide after 2s
      const t = setTimeout(() => setShowBanner(false), 2000);
      return () => clearTimeout(t);
    }
    prevConnection.current = connectionState;
  }, [connectionState]);

  const handleInstallPWA = async () => {
    await promptPWAInstall();
  };

  const pathname = location.pathname;

  // Amber dot on gear when silent or training mode is active
  const showGearDot = silentMode || trainingMode;

  const navItems = [
    { to: '/', label: t('nav.home'), icon: <Home className="w-5 h-5" />, exact: true },
    { to: '/nearby', label: t('nav.nearby'), icon: <Compass className="w-5 h-5" />, exact: false },
    { to: '/guide', label: t('nav.guide'), icon: <BookHeart className="w-5 h-5" />, exact: false },
    { to: '/profile', label: t('nav.profile'), icon: <User className="w-5 h-5" />, exact: false },
  ];

  return (
    <div className="min-h-screen min-h-dvh bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
      {/* Max-width card container */}
      <div className="citizen-shell w-full max-w-md bg-white dark:bg-slate-900 relative overflow-hidden sm:shadow-2xl sm:rounded-none">

        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-rose-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none text-sm"
        >
          {t('a11y.skipToContent')}
        </a>

        {/* ── Compact Header (~52px) ── */}
        <header className="shrink-0 top-header-height flex items-center justify-between px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 z-30">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg p-1 -ml-1"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-900/20 group-hover:bg-rose-500 transition-colors">
              {/* Shield + cross emergency logo */}
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L4 5v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V5z" fill="rgba(255,255,255,0.15)" stroke="white" />
                <path d="M12 8v8M8 12h8" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] leading-tight text-slate-900 dark:text-white tracking-tight">
                {t('common.appName')}
              </span>
              {/* Hide subtitle on short screens */}
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block" aria-hidden="true" style={{ display: 'var(--subtitle-display, none)' }}>
                {t('common.appSubtitle')}
              </span>
            </div>
          </Link>

          {/* Gear button — neutral gray, amber dot when modes active */}
          <div className="relative">
            <button
              type="button"
              aria-label={t('a11y.settings')}
              aria-expanded={showSettings}
              onClick={() => setShowSettings(true)}
              className="touch-icon rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Settings className="w-5 h-5" />
            </button>
            {showGearDot && (
              <span
                aria-hidden="true"
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 pointer-events-none"
              />
            )}
          </div>
        </header>

        {/* ── Connection / Offline Banner ── */}
        {showBanner && (
          <div
            role="alert"
            className={`shrink-0 flex items-center justify-between px-4 py-2 text-[13px] font-semibold transition-all ${
              connectionState === 'offline'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300'
                : connectionState === 'reconnecting'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('connection.offlineBanner')}</span>
            </div>
            {connectionState !== 'live' && (
              <button
                type="button"
                onClick={() => setShowSMSModal(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-[12px] hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors"
              >
                {t('connection.sendSMS')}
              </button>
            )}
          </div>
        )}

        {/* ── Training Mode Banner ── */}
        {trainingMode && (
          <div className="shrink-0 bg-amber-400 dark:bg-amber-500 text-slate-950 px-4 py-1.5 text-[13px] font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t('settings.trainingActive')}</span>
          </div>
        )}

        {/* ── Content Area (flex-1, never scrolls) ── */}
        <main
          id="main-content"
          className="citizen-content focus:outline-none"
          tabIndex={-1}
        >
          <Outlet />
        </main>

        {/* ── Fixed Bottom Navigation ── */}
        <nav
          role="navigation"
          aria-label={t('a11y.menuToggle')}
          className="shrink-0 bottom-nav-height flex items-center justify-around bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 z-30"
        >
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to) && item.to !== '/';
            const exactHome = item.to === '/' && (pathname === '/' || pathname === '/track');
            const active = item.to === '/' ? exactHome : isActive;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`touch-icon flex flex-col items-center justify-center gap-0.5 px-3 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  active
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span className={`text-[13px] leading-none font-semibold ${active ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Settings Bottom Sheet ── */}
        {showSettings && (
          <SettingsSheet
            onClose={() => setShowSettings(false)}
            canInstall={canInstall}
            onInstall={handleInstallPWA}
          />
        )}

        {/* ── SMS Fallback Modal ── */}
        <SMSFallbackModal
          isOpen={showSMSModal}
          onClose={() => setShowSMSModal(false)}
          emergencyType="medical"
          coords={null}
        />
      </div>
    </div>
  );
};
