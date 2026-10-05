import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { useTranslation } from '../i18n';
import { 
  ConnectionIndicator, 
  ThemeToggle, 
  LanguageToggle, 
  IconButton 
} from '../components';
import { 
  LayoutDashboard, 
  Map, 
  Ambulance, 
  BarChart3, 
  FileText, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Menu, 
  X,
  Radio
} from 'lucide-react';

export const ControlLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { connectionState, soundEnabled, toggleSound } = useAppStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live digital clock for dispatch room
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('lo-LA', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/control', label: t('nav.queue'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/control/map', label: t('nav.map'), icon: <Map className="w-4 h-4" /> },
    { path: '/control/units', label: t('nav.units'), icon: <Ambulance className="w-4 h-4" /> },
    { path: '/control/stats', label: t('nav.stats'), icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/control/audit', label: t('nav.audit'), icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Dispatch Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle button */}
          <IconButton
            size="sm"
            aria-label={t('a11y.menuToggle')}
            className="md:hidden !min-h-[44px] !min-w-[44px] text-slate-300"
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </IconButton>

          {/* Logo & System Brand */}
          <Link to="/control" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm sm:text-base leading-tight text-white flex items-center gap-1.5">
                {t('common.appName')}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest font-mono">
                  Control
                </span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline leading-none">
                {t('common.dispatchCenter')}
              </span>
            </div>
          </Link>
        </div>

        {/* Center Live Clock */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-sm">
          <span className="text-slate-400 text-xs">Vientiane Time:</span>
          <span className="text-emerald-400 font-bold tracking-wider">{currentTime || '--:--:--'}</span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Connection Indicator */}
          <ConnectionIndicator state={connectionState} showLabel={false} />

          {/* Sound Alert Toggle */}
          <IconButton
            size="sm"
            aria-label={soundEnabled ? 'Mute audio alerts' : 'Enable audio alerts'}
            variant="ghost"
            onClick={toggleSound}
            className={`!min-h-[44px] !min-w-[44px] !p-2 rounded-xl transition-colors ${
              soundEnabled ? 'text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Audio Alerts: Active' : 'Audio Alerts: Muted'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
          </IconButton>

          {/* Theme & Language */}
          <ThemeToggle className="!min-h-[44px] !min-w-[44px] !p-2 rounded-xl" />
          <LanguageToggle className="!min-h-[44px] !min-w-[44px] !p-2 rounded-xl" />

          {/* Back to Citizen app */}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 border border-rose-500/30 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('common.citizenApp')}</span>
          </Link>
        </div>
      </header>

      {/* Desktop / Tablet Sub-Navigation Bar */}
      <nav 
        role="navigation" 
        aria-label="Dispatch Navigation"
        className="hidden md:flex items-center gap-1 bg-slate-900/60 border-b border-slate-800/80 px-4 py-1.5 overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`touch-target w-full flex items-center gap-3 px-4 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="touch-target w-full flex items-center gap-3 px-4 rounded-xl text-sm text-rose-400 hover:bg-rose-950/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.citizenApp')}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Control Center Body */}
      <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
