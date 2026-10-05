import React from 'react';
import { useTranslation } from '../../i18n';
import { HelpCircle, AlertTriangle } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export interface ConfirmOtherModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmOtherModal: React.FC<ConfirmOtherModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleConfirm = () => {
    triggerHaptic('sos');
    onConfirm();
  };

  const handleCancel = () => {
    triggerHaptic('cancel');
    onCancel();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-other-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-purple-500/30 p-5 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 id="confirm-other-title" className="text-[18px] font-bold text-slate-900 dark:text-white">
            {t('sos.confirmOtherTitle')}
          </h2>
          <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('sos.confirmOtherDesc')}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[13px] flex items-center gap-2 text-left">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>ການແຈ້ງເຫດຫຼອກລວງມີຄວາມຜິດທາງກົດໝາຍ</span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 min-h-[52px] rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[15px] hover:bg-slate-50 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 min-h-[52px] rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[15px] shadow-md active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
