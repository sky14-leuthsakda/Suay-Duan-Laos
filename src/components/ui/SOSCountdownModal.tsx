import React, { useState, useEffect, useRef } from 'react';
import { EmergencyType, LocationCoords } from '../../types';
import { useTranslation } from '../../i18n';
import { LocationStatus } from '../../services/location';
import { EmergencyTypeBadge } from './EmergencyTypeBadge';
import { triggerHaptic } from '../../utils/haptics';
import { MapPin, Send, X } from 'lucide-react';

const COUNTDOWN_SECONDS = 5;

export interface SOSCountdownModalProps {
  isOpen: boolean;
  emergencyType: EmergencyType;
  coords: LocationCoords | null;
  locationStatus?: LocationStatus;
  onCancel: () => void;
  onSendImmediately: () => void;
  onTimeout: () => void;
  onPickLocation?: () => void;
}

export const SOSCountdownModal: React.FC<SOSCountdownModalProps> = ({
  isOpen,
  emergencyType,
  coords: _coords,
  locationStatus = 'idle',
  onCancel,
  onSendImmediately,
  onTimeout,
  onPickLocation,
}) => {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSecondsLeft(COUNTDOWN_SECONDS);
      hasFiredRef.current = false;
      return;
    }

    endTimeRef.current = Date.now() + COUNTDOWN_SECONDS * 1000;
    hasFiredRef.current = false;
    setSecondsLeft(COUNTDOWN_SECONDS);
    triggerHaptic('sos');

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !hasFiredRef.current) {
        hasFiredRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        triggerHaptic('success');
        onTimeout();
      }
    }, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // Progress arc
  const progress = (COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * progress;

  // Location line inside modal
  const gpsOK = locationStatus === 'found' || locationStatus === 'manual';
  const locationLine = (() => {
    if (locationStatus === 'found')    return { text: '✓ ແນບພິກັດ GPS ແລ້ວ',   color: 'text-emerald-600 dark:text-emerald-400' };
    if (locationStatus === 'manual')   return { text: '✓ ຕຳແໜ່ງທີ່ເລືອກດ້ວຍຕົນເອງ', color: 'text-emerald-600 dark:text-emerald-400' };
    if (locationStatus === 'searching') return { text: 'ກຳລັງຫາ GPS...',           color: 'text-slate-400 dark:text-slate-500' };
    if (locationStatus === 'denied')   return { text: 'GPS ຖືກປະຕິເສດ',          color: 'text-amber-600 dark:text-amber-400' };
    if (locationStatus === 'blocked')  return { text: 'GPS ຖືກປິດໃນການຕັ້ງຄ່າ', color: 'text-amber-600 dark:text-amber-400' };
    if (locationStatus === 'timeout')  return { text: 'GPS ໝົດເວລາ',              color: 'text-amber-600 dark:text-amber-400' };
    return { text: 'GPS ບໍ່ສາມາດໃຊ້ໄດ້',                                          color: 'text-amber-600 dark:text-amber-400' };
  })();

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="sos-countdown-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-sm mx-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t-2 sm:border-2 border-rose-500 p-5 shadow-2xl text-center">

        {/* Type chip */}
        <div className="flex justify-center mb-4">
          <EmergencyTypeBadge type={emergencyType} size="default" />
        </div>

        {/* Circular countdown */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8"
              fill="transparent" className="text-slate-200 dark:text-slate-800" />
            <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8"
              fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" className="text-rose-600 dark:text-rose-500 transition-none" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              id="sos-countdown-title"
              className="text-5xl font-black text-rose-600 dark:text-rose-500 leading-none tabular-nums"
            >
              {secondsLeft}
            </span>
            <span className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
              {t('sos.seconds')}
            </span>
          </div>
        </div>

        {/* Status text */}
        <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-2 leading-snug">
          {t('sos.cancelCountdown')}
        </p>

        {/* Location line */}
        <div className="flex flex-col items-center gap-1 mb-5">
          <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${locationLine.color}`}>
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{locationLine.text}</span>
          </div>
          {/* "Pick location" link when GPS unavailable */}
          {!gpsOK && onPickLocation && (
            <button
              type="button"
              onClick={onPickLocation}
              className="text-[13px] font-bold text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-800 active:scale-95 transition-all"
            >
              ເລືອກຕຳແໜ່ງດ້ວຍຕົນເອງ →
            </button>
          )}
        </div>

        {/* Side-by-side action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { triggerHaptic('cancel'); onCancel(); }}
            className="flex-1 flex items-center justify-center gap-2 min-h-[52px] rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[15px] hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
            <span>{t('common.cancel')}</span>
          </button>
          <button
            type="button"
            onClick={() => { triggerHaptic('success'); onSendImmediately(); }}
            className="flex-1 flex items-center justify-center gap-2 min-h-[52px] rounded-2xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-[15px] shadow-md shadow-rose-900/30 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
            <span>{t('sos.sendImmediately')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
