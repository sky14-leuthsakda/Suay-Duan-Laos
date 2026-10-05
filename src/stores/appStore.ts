import { create } from 'zustand';
import { ConnectionState } from '../types';
import { setLanguage, Language } from '../i18n';

export type ThemeMode = 'dark' | 'light' | 'auto';

interface AppState {
  theme: ThemeMode;
  language: Language;
  connectionState: ConnectionState;
  silentMode: boolean;
  dataSaver: boolean;
  trainingMode: boolean;
  soundEnabled: boolean;

  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setConnectionState: (state: ConnectionState) => void;
  toggleSilentMode: () => void;
  toggleDataSaver: () => void;
  toggleTrainingMode: () => void;
  toggleSound: () => void;
}

// Apply the actual dark/light class to <html> based on mode + system preference
const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (mode === 'dark') {
    html.classList.add('dark');
  } else if (mode === 'light') {
    html.classList.remove('dark');
  } else {
    // auto: follow system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) html.classList.add('dark');
    else html.classList.remove('dark');
  }
};

// Initialize theme from localStorage or system preference
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sdl_theme') as ThemeMode | null;
    if (saved === 'dark' || saved === 'light' || saved === 'auto') return saved;
  }
  return 'auto';
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

// Watch for system preference changes when in auto mode
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const stored = localStorage.getItem('sdl_theme') as ThemeMode | null;
    if (!stored || stored === 'auto') applyTheme('auto');
  });
}

export const useAppStore = create<AppState>((set) => ({
  theme: initialTheme,
  language: 'lo',
  connectionState: 'live',
  silentMode: false,
  dataSaver: false,
  trainingMode: false,
  soundEnabled: true,

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sdl_theme', theme);
    }
    applyTheme(theme);
  },

  setLanguage: (language) => {
    set({ language });
    setLanguage(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sdl_lang', language);
    }
  },

  setConnectionState: (connectionState) => set({ connectionState }),
  toggleSilentMode: () => set((state) => ({ silentMode: !state.silentMode })),
  toggleDataSaver: () => set((state) => ({ dataSaver: !state.dataSaver })),
  toggleTrainingMode: () => set((state) => ({ trainingMode: !state.trainingMode })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
