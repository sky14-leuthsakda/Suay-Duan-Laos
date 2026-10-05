import { useAppStore } from '../stores/appStore';

let audioCtx: AudioContext | null = null;

export const playEmergencyAlertSound = () => {
  const soundEnabled = useAppStore.getState().soundEnabled;
  if (!soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // High-low two-tone emergency chime (similar to dispatch room notification)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.setValueAtTime(659.25, now + 0.15); // E5
    osc1.frequency.setValueAtTime(880, now + 0.3); // A5

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);
  } catch {
    // Audio context may not be allowed before user interaction
  }
};
