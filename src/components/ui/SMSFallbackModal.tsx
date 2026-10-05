import React from 'react';
import { EmergencyType, LocationCoords } from '../../types';
import { Button } from './Button';
import { MessageSquare, Phone, X, AlertTriangle } from 'lucide-react';

interface SMSFallbackModalProps {
  isOpen: boolean;
  emergencyType: EmergencyType;
  coords: LocationCoords | null;
  onClose: () => void;
}

const typeLabels: Record<EmergencyType, string> = {
  medical:  'ເຈັບປ່ວຍສຸກເສີນ',
  accident: 'ອຸບັດຕິເຫດ',
  fire:     'ໄຟໄໝ້',
  crime:    'ຄວາມປອດໄພ',
  flood:    'ໄພພິບັດ',
  other:    'ເຫດສຸກເສີນ',
};

export const SMSFallbackModal: React.FC<SMSFallbackModalProps> = ({
  isOpen,
  emergencyType,
  coords,
  onClose,
}) => {
  if (!isOpen) return null;

  const targetNumber = emergencyType === 'fire' ? '190' : emergencyType === 'crime' ? '191' : '195';
  const coordinatesText = coords
    ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}${coords.address ? ` (${coords.address})` : ''}`
    : 'ນະຄອນຫຼວງວຽງຈັນ';
  const prefilledMessage = `[SOS ຊ່ວຍດ່ວນ] ແຈ້ງເຫດ: ${typeLabels[emergencyType]}. ພິກັດ: ${coordinatesText}. ຕ້ອງການຄວາມຊ່ວຍເຫຼືອດ່ວນ!`;
  const smsHref = `sms:${targetNumber}?body=${encodeURIComponent(prefilledMessage)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sms-fallback-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 text-slate-100"
    >
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
        
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/30">
          <MessageSquare className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 id="sms-fallback-title" className="text-base sm:text-lg font-bold text-white">
            ສົ່ງ SMS ສຸກເສີນ
          </h2>
          <p className="text-xs text-slate-400">
            ເມື່ອບໍ່ມີອິນເຕີເນັດ, ສົ່ງ SMS ຫາ {targetNumber} ໄດ້ໂດຍກົງ
          </p>
        </div>

        {/* Message preview */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs font-mono text-slate-300 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">
            ຂໍ້ຄວາມທີ່ຈະສົ່ງ → {targetNumber}:
          </span>
          <p className="leading-relaxed font-sans">{prefilledMessage}</p>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 text-left">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>ລະບົບຈະເປີດແອັບ SMS ໂດຍອັດຕະໂນມັດ</span>
        </div>

        <div className="space-y-2 pt-1">
          <a
            href={smsHref}
            className="touch-target w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-lg shadow-rose-900/40"
          >
            <MessageSquare className="w-4 h-4" />
            <span>ສົ່ງ SMS ຫາ {targetNumber}</span>
          </a>

          <a
            href={`tel:${targetNumber}`}
            className="touch-target w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>ໂທ {targetNumber}</span>
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full text-xs text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
            <span>ປິດ</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
