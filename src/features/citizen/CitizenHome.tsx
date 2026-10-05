import React, { useState, useEffect } from 'react';
import { EmergencyType, LocationCoords } from '../../types';
import { useTranslation } from '../../i18n';
import {
  SOSButton,
  EmergencyTypeSelector,
  EmergencyCallRow,
  SOSCountdownModal,
  ConfirmOtherModal,
  ManualLocationPicker,
  GPSHintSheet,
} from '../../components';
import {
  getCurrentLocation,
  DEFAULT_LAOS_COORDS,
  LocationStatus,
} from '../../services/location';
import { useIncidentStore } from '../../stores/incidentStore';
import { MapPin } from 'lucide-react';

const CitizenStatusTracker = React.lazy(() =>
  import('./CitizenStatusTracker').then((m) => ({ default: m.CitizenStatusTracker }))
);

export type SOSFlowStep = 'idle' | 'countdown';

// ─── ONE-LINE Location status (max 1 text line + optional inline link) ────────
interface LocationLineProps {
  status: LocationStatus;
  onPickManually: () => void;
  onShowHint: () => void;
}

const LocationLine: React.FC<LocationLineProps> = ({ status, onPickManually, onShowHint }) => {
  // ── found ──
  if (status === 'found') {
    return (
      <p className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400 text-center leading-tight">
        ✓ ພົບຕຳແໜ່ງແລ້ວ
      </p>
    );
  }

  // ── manual ──
  if (status === 'manual') {
    return (
      <p className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400 text-center leading-tight">
        ✓ ຕຳແໜ່ງທີ່ເລືອກດ້ວຍຕົນເອງ{' '}
        <button
          type="button"
          onClick={onPickManually}
          className="underline underline-offset-2 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 transition-all"
        >
          ປ່ຽນ
        </button>
      </p>
    );
  }

  // ── searching / idle ──
  if (status === 'searching' || status === 'idle') {
    return (
      <p className="text-[14px] font-medium text-slate-400 dark:text-slate-500 text-center leading-tight animate-pulse">
        ກຳລັງຫາຕຳແໜ່ງ...
      </p>
    );
  }

  // ── denied / blocked / timeout / unavailable ──
  // ONE LINE: "ໃຊ້ຕຳແໜ່ງບໍ່ໄດ້ · ເລືອກຕຳແໜ່ງເອງ" + small "ວິທີເປີດ" link
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={onPickManually}
        className="text-[14px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors leading-tight flex items-center gap-1"
      >
        <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        ໃຊ້ຕຳແໜ່ງບໍ່ໄດ້ · ເລືອກຕຳແໜ່ງເອງ
      </button>
      <button
        type="button"
        onClick={onShowHint}
        className="text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 leading-tight transition-colors shrink-0"
      >
        ວິທີເປີດ
      </button>
    </div>
  );
};

// ─── CitizenHome ─────────────────────────────────────────────────────────────
export const CitizenHome: React.FC = () => {
  const { t } = useTranslation();
  const { activeIncident, createSOSIncident, loadActiveIncident } = useIncidentStore();

  const [flowStep, setFlowStep] = useState<SOSFlowStep>('idle');
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [showGPSHint, setShowGPSHint] = useState(false);
  const [pendingCountdownAfterPick, setPendingCountdownAfterPick] = useState(false);

  // Restore active incident on mount
  useEffect(() => {
    loadActiveIncident();
  }, [loadActiveIncident]);

  // Fetch GPS in the background
  useEffect(() => {
    setLocationStatus('searching');
    getCurrentLocation(10000).then((result) => {
      if (result.status === 'found' && result.coords) {
        setCoords(result.coords);
        setLocationStatus('found');
      } else {
        setCoords(null);
        setLocationStatus(result.status);
      }
    });
  }, []);

  // PWA shortcut: launch directly into countdown
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('shortcut') === 'sos') {
        setFlowStep('countdown');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const retryGPS = () => {
    setLocationStatus('searching');
    setCoords(null);
    getCurrentLocation(10000).then((result) => {
      if (result.status === 'found' && result.coords) {
        setCoords(result.coords);
        setLocationStatus('found');
      } else {
        setCoords(null);
        setLocationStatus(result.status);
      }
    });
  };

  const handleSOSPress = () => setFlowStep('countdown');

  // Type button tap → set type + start countdown in one tap
  const handleTypeAndSOS = (type: EmergencyType) => {
    setSelectedType(type);
    setFlowStep('countdown');
  };

  const handleCompleteSOS = async () => {
    setFlowStep('idle');
    try {
      await createSOSIncident({
        type: selectedType ?? 'other',
        location: coords ?? {
          ...DEFAULT_LAOS_COORDS,
          address: 'ຕຳແໜ່ງໂດຍປະມານ',
        },
      });
    } catch { /* handled by store */ }
  };

  const handleCancelCountdown = () => setFlowStep('idle');

  const handleManualPick = (picked: LocationCoords) => {
    setCoords(picked);
    setLocationStatus('manual');
    setShowManualPicker(false);
    if (pendingCountdownAfterPick) {
      setPendingCountdownAfterPick(false);
      setFlowStep('countdown');
    }
  };

  // Show active incident tracker
  if (activeIncident) {
    return (
      <React.Suspense
        fallback={
          <div className="citizen-content flex items-center justify-center p-8 text-[13px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span>ກຳລັງໂຫລດ...</span>
            </div>
          </div>
        }
      >
        <CitizenStatusTracker />
      </React.Suspense>
    );
  }

  const resolvedType: EmergencyType = selectedType ?? 'other';
  const typeLabel = selectedType
    ? t(`emergencyTypes.${selectedType}`)
    : t('sos.generalEmergency');

  const gpsUnavailable =
    locationStatus !== 'found' &&
    locationStatus !== 'searching' &&
    locationStatus !== 'manual' &&
    locationStatus !== 'idle';

  return (
    /*
     * Layout (column, fills citizen-content which is flex-1 in CitizenLayout):
     *
     *  ┌─────────────────────────────────┐
     *  │  SOS zone  (flex-1)             │  ← SOS button + location line, centered
     *  ├─────────────────────────────────┤
     *  │  Bottom zone  (shrink-0)        │  ← section label + type grid + call row
     *  └─────────────────────────────────┘
     *
     * NO justify-between — the flex-1 SOS zone absorbs all spare space.
     */
    <div className="citizen-content flex flex-col overflow-hidden">

      {/* ── SOS zone — grows to fill all remaining space ── */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-2">
        <SOSButton
          onPress={handleSOSPress}
          selectedTypeLabel={typeLabel}
        />

        {/* Location line — single line, 16px margin from button container */}
        <div className="mt-4 h-8 flex items-center justify-center w-full px-2">
          <LocationLine
            status={locationStatus}
            onPickManually={() => setShowManualPicker(true)}
            onShowHint={() => setShowGPSHint(true)}
          />
        </div>
      </div>

      {/* ── Bottom zone — fixed height, no gaps between groups ── */}
      <div className="shrink-0 flex flex-col gap-3 px-4 pb-3">
        {/* Section label */}
        <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300 text-center leading-none">
          {t('sos.quickTypeSelect')}
        </p>

        {/* 3×2 type grid */}
        <EmergencyTypeSelector
          selectedType={selectedType}
          onSelectType={handleTypeAndSOS}
        />

        {/* Emergency call row */}
        <EmergencyCallRow />
      </div>

      {/* ── Countdown modal ── */}
      <SOSCountdownModal
        isOpen={flowStep === 'countdown'}
        emergencyType={resolvedType}
        coords={coords}
        locationStatus={locationStatus}
        onCancel={handleCancelCountdown}
        onSendImmediately={handleCompleteSOS}
        onTimeout={handleCompleteSOS}
        onPickLocation={() => {
          setPendingCountdownAfterPick(true);
          setFlowStep('idle');
          setShowManualPicker(true);
        }}
      />

      {/* ── Confirm Other modal ── */}
      <ConfirmOtherModal
        isOpen={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />

      {/* ── Manual location picker ── */}
      {showManualPicker && (
        <ManualLocationPicker
          onConfirm={handleManualPick}
          onClose={() => {
            setShowManualPicker(false);
            setPendingCountdownAfterPick(false);
            if (locationStatus !== 'found' && locationStatus !== 'manual') retryGPS();
          }}
          required={gpsUnavailable && locationStatus === 'denied'}
        />
      )}

      {/* ── GPS hint sheet ── */}
      {showGPSHint && (
        <GPSHintSheet onClose={() => setShowGPSHint(false)} />
      )}
    </div>
  );
};
