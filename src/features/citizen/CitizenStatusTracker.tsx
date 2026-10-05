import React, { useState } from 'react';
import { IncidentStatus } from '../../types';
import { useTranslation } from '../../i18n';
import { useIncidentStore } from '../../stores/incidentStore';
import { EmergencyTypeBadge } from '../../components';
import {
  Phone,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  X,
  Share2,
  ChevronRight,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

// ─── Confirm Cancel Dialog ─────────────────────────────────────────────────
interface ConfirmCancelProps {
  onConfirm: () => void;
  onDismiss: () => void;
}
const ConfirmCancelDialog: React.FC<ConfirmCancelProps> = ({ onConfirm, onDismiss }) => {
  const { t } = useTranslation();
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xs rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <div>
          <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">
            {t('tracker.cancelConfirmTitle')}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            {t('tracker.cancelConfirmDesc')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 min-h-[48px] rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-[14px] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 min-h-[48px] rounded-xl bg-rose-600 text-white font-bold text-[14px] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Details Bottom Sheet ──────────────────────────────────────────────────
interface DetailsSheetProps {
  incident: NonNullable<ReturnType<typeof useIncidentStore.getState>['activeIncident']>;
  onClose: () => void;
}
const DetailsSheet: React.FC<DetailsSheetProps> = ({ incident, onClose }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-200"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('tracker.detailsLink')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="touch-icon rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3 space-y-3 text-[14px]">
          <div className="flex justify-between">
            <span className="text-slate-500">{t('sos.trackingCode')}</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{incident.trackingCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ເວລາ</span>
            <span className="text-slate-900 dark:text-white">
              {new Date(incident.createdAt).toLocaleTimeString('lo', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 shrink-0">ພິກັດ</span>
            <span className="font-mono text-[12px] text-slate-700 dark:text-slate-300 text-right">
              {incident.location.lat.toFixed(5)}, {incident.location.lng.toFixed(5)}
            </span>
          </div>
          {incident.location.address && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 shrink-0">ສະຖານທີ່</span>
              <span className="text-slate-700 dark:text-slate-300 text-right">{incident.location.address}</span>
            </div>
          )}
          {incident.note && (
            <div>
              <span className="text-slate-500 block mb-1">ໝາຍເຫດ</span>
              <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-[13px]">{incident.note}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Main Tracker ──────────────────────────────────────────────────────────
export const CitizenStatusTracker: React.FC = () => {
  const { t } = useTranslation();
  const { activeIncident, isStale, clearActiveIncident, updateLocalStatus } = useIncidentStore();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!activeIncident) {
    return (
      <div className="citizen-content flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">ບໍ່ມີເຫດສຸກເສີນທີ່ກຳລັງຕິດຕາມ</h2>
        <p className="text-[13px] text-slate-500 max-w-xs">
          ທ່ານຍັງບໍ່ໄດ້ແຈ້ງເຫດສຸກເສີນ ຫຼື ເຫດການໄດ້ສຳເລັດແລ້ວ
        </p>
        <button
          type="button"
          onClick={() => clearActiveIncident()}
          className="min-h-[48px] px-6 rounded-xl bg-rose-600 text-white font-semibold text-[14px] hover:bg-rose-500 active:scale-95 transition-all"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  const stages: Array<{ key: IncidentStatus; label: string }> = [
    { key: 'received', label: t('status.received') },
    { key: 'acknowledged', label: t('status.acknowledged') },
    { key: 'dispatched', label: t('status.dispatched') },
    { key: 'on_the_way', label: t('status.on_the_way') },
    { key: 'arrived', label: t('status.arrived') },
    { key: 'resolved', label: t('status.resolved') },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === activeIncident.status);
  const isResolved = activeIncident.status === 'resolved';
  const isCancelled = activeIncident.status === 'cancelled';

  const handleShareLocation = async () => {
    const url = `${window.location.origin}/track?id=${activeIncident.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ຕຳແໜ່ງສຸກເສີນ', url });
        return;
      } catch {
        // fallthrough to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
  };

  const currentStatus = stages[currentStageIndex]?.label ?? t('status.on_the_way');
  const etaMin = activeIncident.assignedUnit?.etaMinutes;

  return (
    <div className="citizen-content flex flex-col overflow-hidden">
      {/* ── 1. Status bar ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Stale indicator */}
        {isStale && (
          <span aria-live="polite" className="sr-only">ຂໍ້ມູນອາດຈະບໍ່ອັບເດດ</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">
            {currentStatus}
          </span>
          <EmergencyTypeBadge type={activeIncident.type} size="sm" />
        </div>
        <div className="flex items-center gap-3">
          {etaMin && (
            <div className="flex items-center gap-1 text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>~{Math.round(etaMin)} ນາທີ</span>
            </div>
          )}
          {/* Share location icon button */}
          <button
            type="button"
            onClick={handleShareLocation}
            aria-label={t('tracker.shareLocation')}
            className="touch-icon rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Live map (flex-1) ── */}
      <div className="flex-1 min-h-0 relative bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
        {/* Map placeholder — actual map rendered by existing map logic */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <MapPin className="w-8 h-8 mx-auto mb-1" />
            <span className="text-[12px]">{t('tracker.liveMap')}</span>
          </div>
        </div>
        {/* Unit moving indicator */}
        {activeIncident.assignedUnit && (
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-xl text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" aria-hidden="true" />
            <span>ລາຍງານສົດ</span>
          </div>
        )}
        {/* Details link */}
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-xl text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 shadow-sm hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          <span>{t('tracker.detailsLink')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── 3. Horizontal stepper ── */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between gap-1">
          {stages.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx && !isCancelled;
            return (
              <React.Fragment key={stage.key}>
                <div className="flex flex-col items-center gap-0.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400/40'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 text-center leading-tight max-w-[40px] truncate">
                      {stage.label}
                    </span>
                  )}
                </div>
                {/* Connector line */}
                {idx < stages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 transition-colors ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── 4. Unit row ── */}
      {activeIncident.assignedUnit && (
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 min-w-0">
            <Truck className="w-4 h-4 text-blue-500 shrink-0" aria-hidden="true" />
            <span className="text-[14px] font-semibold text-slate-900 dark:text-white truncate">
              {activeIncident.assignedUnit.name} · {activeIncident.assignedUnit.plateNumber ?? 'ກກ-9142'}
            </span>
          </div>
          {/* Icon-only call button */}
          <a
            href={`tel:${activeIncident.assignedUnit.contactNumber}`}
            aria-label={t('tracker.callUnit')}
            className="touch-icon rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors shrink-0"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* ── 5. Bottom action row ── */}
      <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        {isResolved || isCancelled ? (
          <button
            type="button"
            onClick={clearActiveIncident}
            className="flex-1 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('sos.reset')}</span>
          </button>
        ) : (
          <>
            {/* Primary: Call 195 */}
            <a
              href="tel:195"
              className="flex-1 min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Phone className="w-4 h-4" />
              <span>{t('tracker.call195')}</span>
            </a>
            {/* Secondary: Cancel help */}
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 min-h-[48px] rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[13px] flex items-center justify-center gap-1.5 leading-tight text-center px-2 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <X className="w-4 h-4 shrink-0" />
              <span>{t('tracker.cancelHelp')}</span>
            </button>
          </>
        )}
      </div>

      {/* Confirm cancel dialog */}
      {showCancelConfirm && (
        <ConfirmCancelDialog
          onConfirm={() => {
            triggerHaptic('cancel');
            updateLocalStatus('cancelled');
            setShowCancelConfirm(false);
          }}
          onDismiss={() => setShowCancelConfirm(false)}
        />
      )}

      {/* Details bottom sheet */}
      {showDetails && (
        <DetailsSheet incident={activeIncident} onClose={() => setShowDetails(false)} />
      )}

      {/* Stale data banner */}
      {isStale && (
        <div
          role="alert"
          className="absolute top-0 left-0 right-0 bg-amber-400 dark:bg-amber-600 text-slate-950 px-4 py-1.5 text-[12px] font-bold flex items-center gap-2"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>ຂໍ້ມູນອາດຈະບໍ່ອັບເດດ — ກຳລັງເຊື່ອມຕໍ່ໃໝ່...</span>
        </div>
      )}
    </div>
  );
};
