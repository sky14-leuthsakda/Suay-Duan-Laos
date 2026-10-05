// PWA Service Worker Registration & Installation Prompt Handler

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<(canInstall: boolean) => void>();

export const initPWA = () => {
  if (typeof window === 'undefined') return;

  // Register Service Worker in production or supporting environments
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err);
        });
    });
  }

  // Capture install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    installListeners.forEach((listener) => listener(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((listener) => listener(false));
    console.log('[PWA] Suay Duan Lao installed successfully');
  });
};

export const canInstallPWA = (): boolean => {
  return deferredPrompt !== null;
};

export const promptPWAInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) return false;
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installListeners.forEach((listener) => listener(false));
    return choice.outcome === 'accepted';
  } catch {
    return false;
  }
};

export const onPWAInstallStateChange = (callback: (canInstall: boolean) => void): (() => void) => {
  installListeners.add(callback);
  callback(canInstallPWA());
  return () => {
    installListeners.delete(callback);
  };
};
