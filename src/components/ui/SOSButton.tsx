import React from 'react';
import { triggerHaptic } from '../../utils/haptics';

export interface SOSButtonProps {
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  selectedTypeLabel?: string;
}

/*
 * Layout:
 *   Container is a responsive square using CSS clamp().
 *   All rings and button are positioned absolutely inside it, using
 *   percentage-based insets so they stay perfectly concentric at any size.
 *
 *   Container: clamp(300px, 82vw, 380px)
 *   Button:    73% of container  → clamp(219px, ~60vw, 277px)
 *   Ring-1:    96% of container  (outer slow ping)
 *   Ring-2:    84% of container  (middle slower ping)
 *   Ring-3:    75% of container  (inner pulse glow)
 */
const CONTAINER = 'clamp(300px, 82vw, 380px)';

export const SOSButton: React.FC<SOSButtonProps> = ({
  onPress,
  disabled = false,
  className = '',
  selectedTypeLabel,
}) => {
  const handleClick = () => {
    if (disabled) return;
    triggerHaptic('sos');
    onPress();
  };

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center select-none ${className}`}
      style={{ width: CONTAINER, height: CONTAINER }}
      aria-hidden={false}
    >
      {/* ── Concentric rings (all % of container, always centered) ── */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Outer ring — 96% width, inset 2% */}
        <span
          className="absolute rounded-full bg-rose-600/10 dark:bg-rose-500/8 motion-safe:animate-ping-slow"
          style={{ inset: '2%', animationDelay: '0s', animationDuration: '2.4s' }}
        />
        {/* Middle ring — 84% width, inset 8% */}
        <span
          className="absolute rounded-full bg-rose-600/15 dark:bg-rose-500/12 motion-safe:animate-ping-slow"
          style={{ inset: '8%', animationDelay: '0.7s', animationDuration: '2.4s' }}
        />
        {/* Inner glow — 75% width, inset 12.5% */}
        <span
          className="absolute rounded-full bg-rose-600/20 dark:bg-rose-500/16 motion-safe:animate-pulse"
          style={{ inset: '12.5%' }}
        />
      </span>

      {/* ── Main SOS button — 73% of container, absolutely centered ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        aria-label="SOS ແຈ້ງເຫດສຸກເສີນ"
        style={{
          position: 'absolute',
          width: '73%',
          height: '73%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
        }}
        className="z-10 bg-gradient-to-b from-rose-500 via-rose-600 to-rose-800 hover:from-rose-400 hover:to-rose-700 active:from-rose-700 active:to-rose-900 text-white shadow-2xl shadow-rose-700/50 flex flex-col items-center justify-center border-4 border-rose-300/20 active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50"
      >
        <span
          className="font-black tracking-wider text-white drop-shadow-md leading-none"
          style={{ fontSize: 'clamp(32px, 10vw, 48px)' }}
        >
          SOS
        </span>
        <span
          className="font-semibold text-rose-100/90 mt-1 text-center px-2 leading-tight"
          style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}
        >
          {selectedTypeLabel ?? 'ກົດແຈ້ງດ່ວນ'}
        </span>
      </button>
    </div>
  );
};
