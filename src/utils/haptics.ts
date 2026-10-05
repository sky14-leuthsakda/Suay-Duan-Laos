import { useAppStore } from '../stores/appStore';

export type HapticType = 'sos' | 'tick' | 'success' | 'cancel' | 'warning';

export const triggerHaptic = (type: HapticType = 'sos') => {
  // Silent mode rule: disable all vibration, sound, or flash
  const isSilent = useAppStore.getState().silentMode;
  if (isSilent) return;

  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'sos':
          navigator.vibrate([150, 50, 150]);
          break;
        case 'tick':
          navigator.vibrate(30);
          break;
        case 'success':
          navigator.vibrate([80, 40, 80, 40, 150]);
          break;
        case 'cancel':
          navigator.vibrate([60, 60]);
          break;
        case 'warning':
          navigator.vibrate([100, 50, 100]);
          break;
      }
    } catch {
      // Ignore vibration errors on unsupported devices
    }
  }
};
