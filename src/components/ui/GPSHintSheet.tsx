import React, { useEffect } from 'react';
import { X, Smartphone, Globe } from 'lucide-react';

// Detect iOS (iPhone/iPad)
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

interface Step { num: number; text: string }

const IOS_STEPS: Step[] = [
  { num: 1, text: 'ເປີດ "ການຕັ້ງຄ່າ" (Settings) ໃນໂທລະສັບ' },
  { num: 2, text: 'ໄປທີ່ "ຄວາມເປັນສ່ວນຕົວ ແລະ ຄວາມປອດໄພ"' },
  { num: 3, text: 'ເລືອກ "ບໍລິການຕຳແໜ່ງ" (Location Services)' },
  { num: 4, text: 'ຊອກຫາ Safari ຫຼື Chrome → ຕັ້ງເປັນ "ໃນຂະນະໃຊ້ App"' },
  { num: 5, text: 'ກັບຄືນທີ່ Suay Duan Lao ແລ້ວໂຫລດໜ້ານີ້ໃໝ່' },
];

const ANDROID_STEPS: Step[] = [
  { num: 1, text: 'ທີ່ address bar ດ້ານເທິງ ກົດທີ່ icon ລັອກ 🔒 ຫຼື ⓘ' },
  { num: 2, text: 'ເລືອກ "ການອະນຸຍາດ" (Permissions)' },
  { num: 3, text: 'ກົດ "ຕຳແໜ່ງ" (Location) → ຕັ້ງເປັນ "ອະນຸຍາດ" (Allow)' },
  { num: 4, text: 'ໂຫລດໜ້ານີ້ໃໝ່ — GPS ຈະເຮັດວຽກທັນທີ' },
];

interface GPSHintSheetProps {
  onClose: () => void;
}

export const GPSHintSheet: React.FC<GPSHintSheetProps> = ({ onClose }) => {
  const ios = isIOS();
  const steps = ios ? IOS_STEPS : ANDROID_STEPS;
  const platform = ios ? 'iPhone / iPad' : 'Android / Chrome';

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gps-hint-title"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-250"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {ios
              ? <Smartphone className="w-5 h-5 text-slate-500" />
              : <Globe className="w-5 h-5 text-slate-500" />}
            <div>
              <h2 id="gps-hint-title" className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight">
                ວິທີເປີດ GPS
              </h2>
              <p className="text-[12px] text-slate-400 leading-none mt-0.5">{platform}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ປິດ"
            className="touch-icon rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-4 py-4 space-y-3">
          {steps.map((step) => (
            <div key={step.num} className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[13px] font-bold">
                {step.num}
              </span>
              <p className="text-[15px] text-slate-800 dark:text-slate-200 leading-snug pt-0.5">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* Reload button */}
        <div className="px-4 pb-1">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] active:scale-95 transition-all"
          >
            ໂຫລດໜ້ານີ້ໃໝ່
          </button>
        </div>
      </div>
    </>
  );
};
