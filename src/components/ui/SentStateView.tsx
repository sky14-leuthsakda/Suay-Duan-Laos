import React, { useState } from 'react';
import { EmergencyType, LocationCoords } from '../../types';
import { useTranslation } from '../../i18n';
import { Button } from './Button';
import { Card } from './Card';
import { EmergencyTypeBadge } from './EmergencyTypeBadge';
import { StatusBadge } from './StatusBadge';
import { CheckCircle, MapPin, Camera, FileText, Phone, ArrowLeft, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export interface SentStateViewProps {
  trackingCode: string;
  emergencyType: EmergencyType;
  coords: LocationCoords | null;
  onReset: () => void;
  onSaveDetails?: (note: string, photo: string | null) => void;
}

export const SentStateView: React.FC<SentStateViewProps> = ({
  trackingCode,
  emergencyType,
  coords,
  onReset,
  onSaveDetails,
}) => {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDetails = () => {
    triggerHaptic('success');
    setIsSaved(true);
    if (onSaveDetails) {
      onSaveDetails(note, photoPreview);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 animate-in fade-in duration-200">
      {/* Sent Banner / Confirmation Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500/30 animate-in zoom-in-75 duration-200">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t('sos.sentSuccess')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
          {t('sos.sentSuccessDesc')}
        </p>
      </div>

      {/* Incident Summary Card */}
      <Card variant="emergency" className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900/40">
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              {t('sos.trackingCode')}
            </span>
            <span className="font-mono text-base font-black text-slate-900 dark:text-white">
              {trackingCode}
            </span>
          </div>
          <StatusBadge status="received" size="default" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            ປະເພດ:
          </span>
          <EmergencyTypeBadge type={emergencyType} size="sm" />
        </div>

        <div className="flex items-start gap-2 pt-2 border-t border-rose-200 dark:border-rose-900/40 text-xs text-slate-700 dark:text-slate-300">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-slate-900 dark:text-white">
              {coords?.address || 'ນະຄອນຫຼວງວຽງຈັນ'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : '17.9712, 102.6174'}
            </span>
          </div>
        </div>
      </Card>

      {/* Optional Post-Send Details Form (Note & Photo) */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
          <FileText className="w-4 h-4 text-blue-500" />
          <span>{t('sos.addOptionalInfo')}</span>
        </div>

        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('sos.notePlaceholder')}
            rows={2}
            className="w-full text-xs sm:text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />

          {/* Photo attachment preview */}
          {photoPreview && (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
              <img src={photoPreview} alt="Incident attachment preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/70 text-white text-xs hover:bg-slate-900"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="touch-target flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Camera className="w-4 h-4 text-slate-500" />
              <span>{photoPreview ? 'ປ່ຽນຮູບ' : t('sos.photoPlaceholder')}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handlePhotoSelect}
              />
            </label>

            {(note || photoPreview) && (
              <Button
                variant={isSaved ? 'success' : 'primary'}
                size="sm"
                className="!min-h-[44px] text-xs font-bold"
                onClick={handleSaveDetails}
              >
                {isSaved ? <Check className="w-4 h-4" /> : null}
                <span>{isSaved ? t('sos.saved') : t('sos.saveDetails')}</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Direct Call Operator Hotline */}
      <a
        href="tel:195"
        className="touch-target w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm active:scale-95 transition-transform shadow-sm"
      >
        <Phone className="w-4 h-4" />
        <span>{t('sos.callOperator')}</span>
      </a>

      {/* Return / Reset Action */}
      <div className="pt-2">
        <Button
          variant="secondary"
          size="default"
          className="w-full text-xs sm:text-sm font-semibold gap-2"
          onClick={onReset}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('sos.reset')}</span>
        </Button>
      </div>
    </div>
  );
};
