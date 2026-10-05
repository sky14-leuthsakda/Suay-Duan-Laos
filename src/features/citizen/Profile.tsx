import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { useProfileStore, EmergencyContact } from '../../stores/profileStore';
import {
  User,
  Heart,
  Users,
  MapPin,
  Lock,
  ChevronRight,
  X,
  Trash2,
  Plus,
  Phone,
  Share2,
  AlertTriangle,
} from 'lucide-react';

// ─── Bottom Sheet wrapper ──────────────────────────────────────────────────
interface SheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Sheet: React.FC<SheetProps> = ({ title, onClose, children }) => {
  const { t } = useTranslation();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    // Focus trap
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const arr = Array.from(focusable);
        const first = arr[0], last = arr[arr.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-250 focus:outline-none"
        style={{ maxHeight: '90dvh', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="touch-icon rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto no-scrollbar flex-1 px-4 py-4">
          {children}
        </div>
      </div>
    </>
  );
};

// ─── Switch row ─────────────────────────────────────────────────────────────
interface SwitchRowProps { id: string; label: string; checked: boolean; onChange: () => void }
const SwitchRow: React.FC<SwitchRowProps> = ({ id, label, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <label htmlFor={id} className="text-[14px] font-semibold text-slate-800 dark:text-slate-200 cursor-pointer flex-1">{label}</label>
    <button type="button" role="switch" aria-checked={checked} id={id} onClick={onChange}
      className={`relative shrink-0 ml-3 w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; onDone: () => void }> = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-semibold px-4 py-2 rounded-xl shadow-lg animate-in fade-in duration-150 pointer-events-none">
      {msg}
    </div>
  );
};

// ─── Blood type chips ────────────────────────────────────────────────────────
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'ບໍ່ຮູ້'];

// ─── Relation chips ──────────────────────────────────────────────────────────
const RELATIONS = ['ຄອບຄົວ', 'ໝູ່', 'ເພື່ອນຮ່ວມງານ', 'ອື່ນໆ'];

// ─── Main Profile ──────────────────────────────────────────────────────────
export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const store = useProfileStore();
  const [activeSheet, setActiveSheet] = useState<'basic' | 'medical' | 'contacts' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Local draft states for each sheet
  const [draftName, setDraftName] = useState(store.name);
  const [draftPhone, setDraftPhone] = useState(store.phone);
  const [draftBlood, setDraftBlood] = useState(store.bloodType);
  const [draftAllergies, setDraftAllergies] = useState(store.allergies);
  const [draftNotes, setDraftNotes] = useState(store.medicalNotes);
  const [draftShareMedical, setDraftShareMedical] = useState(false);
  const [draftContacts, setDraftContacts] = useState<EmergencyContact[]>([...store.emergencyContacts]);

  const showToast = (msg: string) => setToast(msg);

  const openSheet = (sheet: 'basic' | 'medical' | 'contacts') => {
    // Reset drafts from store
    setDraftName(store.name);
    setDraftPhone(store.phone);
    setDraftBlood(store.bloodType);
    setDraftAllergies(store.allergies);
    setDraftNotes(store.medicalNotes);
    setDraftContacts([...store.emergencyContacts]);
    setActiveSheet(sheet);
  };

  const saveBasic = () => {
    store.updateProfile({ name: draftName, phone: draftPhone });
    showToast(t('profile.savedToast'));
    setActiveSheet(null);
  };

  const saveMedical = () => {
    store.updateProfile({ bloodType: draftBlood, allergies: draftAllergies, medicalNotes: draftNotes });
    showToast(t('profile.savedToast'));
    setActiveSheet(null);
  };

  const saveContacts = () => {
    store.updateProfile({ emergencyContacts: draftContacts });
    showToast(t('profile.savedToast'));
    setActiveSheet(null);
  };

  const addContact = () => {
    if (draftContacts.length >= 3) return;
    setDraftContacts((prev) => [...prev, { id: `c-${Date.now()}`, name: '', phone: '', relationship: 'ຄອບຄົວ', notifyOnSOS: false }]);
  };

  const deleteContact = (id: string) => {
    setDraftContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateContact = (id: string, updates: Partial<EmergencyContact>) => {
    setDraftContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
  };

  const handleShareLocation = async () => {
    const url = `${window.location.origin}/track`;
    if (navigator.share) {
      try { await navigator.share({ title: 'ຕຳແໜ່ງຂອງຂ້ອຍ', url }); return; } catch { /* fallthrough */ }
    }
    await navigator.clipboard.writeText(url);
    showToast('ສຳເນົາລິ້ງແລ້ວ');
  };

  const handleDeleteAll = () => {
    store.updateProfile({ name: '', phone: '', bloodType: '', allergies: '', medicalNotes: '', emergencyContacts: [], notifyTrustedContactsOnSOS: false });
    setShowDeleteConfirm(false);
    showToast('ລຶບຂໍ້ມູນແລ້ວ');
  };

  // Summary strings for each row
  const basicSummary = [store.name, store.phone].filter(Boolean).join(' · ') || t('profile.noName');
  const medicalSummary = [store.bloodType, store.allergies].filter(Boolean).join(' · ') || '—';
  const contactsSummary = store.emergencyContacts.length > 0
    ? `${store.emergencyContacts.length} ${t('profile.contacts').includes('ຄົນ') ? 'ຄົນ' : 'contacts'}`
    : '—';

  const rows = [
    { id: 'basic',    icon: <User className="w-5 h-5 text-blue-500" />,   title: t('profile.basicInfo'),     summary: basicSummary },
    { id: 'medical',  icon: <Heart className="w-5 h-5 text-rose-500" />,  title: t('profile.medicalOptional'), summary: medicalSummary },
    { id: 'contacts', icon: <Users className="w-5 h-5 text-purple-500" />, title: t('profile.contacts'),       summary: contactsSummary },
  ] as const;

  return (
    <div className="citizen-content flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">
        {/* Status line */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{t('profile.localStorageNote')}</span>
        </div>

        {/* Summary rows */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => openSheet(row.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500"
              style={{ minHeight: '56px' }}
            >
              <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight">{row.title}</p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{row.summary}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}

          {/* Share location row */}
          <button
            type="button"
            onClick={handleShareLocation}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500"
            style={{ minHeight: '56px' }}
          >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight">{t('profile.shareLocation')}</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">SMS / WhatsApp</p>
            </div>
            <Share2 className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-[12px] text-slate-400 dark:text-slate-500 leading-relaxed">
          {t('profile.privacyNote')}
        </p>

        {/* Delete all */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-[13px] font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors text-center py-2"
        >
          {t('profile.deleteAll')}
        </button>
      </div>

      {/* ── Basic Info Sheet ── */}
      {activeSheet === 'basic' && (
        <Sheet title={t('profile.basicInfo')} onClose={() => setActiveSheet(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{t('profile.nameLabel')}</label>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                placeholder="ຊື່ ນາມສະກຸນ"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{t('profile.phoneLabel')}</label>
              <input
                type="tel"
                value={draftPhone}
                onChange={(e) => setDraftPhone(e.target.value)}
                placeholder={t('profile.phonePlaceholder')}
                className="w-full h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={saveBasic}
              className="w-full min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] active:scale-95 transition-all"
            >
              {t('profile.saveSheet')}
            </button>
          </div>
        </Sheet>
      )}

      {/* ── Medical Info Sheet ── */}
      {activeSheet === 'medical' && (
        <Sheet title={t('profile.medicalOptional')} onClose={() => setActiveSheet(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-2">{t('profile.bloodType')}</label>
              <div className="grid grid-cols-5 gap-2">
                {BLOOD_TYPES.map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    aria-pressed={draftBlood === bt}
                    onClick={() => setDraftBlood(bt === draftBlood ? '' : bt)}
                    className={`py-2 rounded-xl border-2 text-[13px] font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                      draftBlood === bt
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{t('profile.allergies')}</label>
              <input
                type="text"
                value={draftAllergies}
                onChange={(e) => setDraftAllergies(e.target.value)}
                placeholder="ຢາ, ອາຫານ..."
                className="w-full h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{t('profile.notes')}</label>
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={2}
                placeholder="ໂຣກປະຈຳຕົວ, ຢາທີ່ໃຊ້..."
                style={{ resize: 'none' }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <SwitchRow
              id="share-medical"
              label={t('profile.shareWithEmergency')}
              checked={draftShareMedical}
              onChange={() => setDraftShareMedical((v) => !v)}
            />
            <button
              type="button"
              onClick={saveMedical}
              className="w-full min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] active:scale-95 transition-all"
            >
              {t('profile.saveSheet')}
            </button>
          </div>
        </Sheet>
      )}

      {/* ── Contacts Sheet ── */}
      {activeSheet === 'contacts' && (
        <Sheet title={t('profile.contacts')} onClose={() => setActiveSheet(null)}>
          <div className="space-y-4">
            {draftContacts.map((contact) => (
              <div key={contact.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {RELATIONS.map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        aria-pressed={contact.relationship === rel}
                        onClick={() => updateContact(contact.id, { relationship: rel })}
                        className={`px-2 py-1 rounded-lg text-[12px] font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                          contact.relationship === rel
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="ລຶບ"
                    onClick={() => deleteContact(contact.id)}
                    className="touch-icon w-8 h-8 rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(contact.id, { name: e.target.value })}
                  placeholder={t('profile.contactName')}
                  className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[14px] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact(contact.id, { phone: e.target.value })}
                    placeholder="020-XXXXXXXX"
                    className="flex-1 h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[14px] text-slate-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <SwitchRow
                  id={`sos-notify-${contact.id}`}
                  label={t('profile.notifyOnSOS')}
                  checked={contact.notifyOnSOS}
                  onChange={() => updateContact(contact.id, { notifyOnSOS: !contact.notifyOnSOS })}
                />
              </div>
            ))}

            {draftContacts.length < 3 && (
              <button
                type="button"
                onClick={addContact}
                className="w-full min-h-[48px] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-semibold text-[14px] flex items-center justify-center gap-2 hover:border-rose-400 hover:text-rose-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('profile.addContact')}
              </button>
            )}
            {draftContacts.length >= 3 && (
              <p className="text-center text-[12px] text-slate-400">{t('profile.maxContacts')}</p>
            )}

            <button
              type="button"
              onClick={saveContacts}
              className="w-full min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] active:scale-95 transition-all"
            >
              {t('profile.saveSheet')}
            </button>
          </div>
        </Sheet>
      )}

      {/* ── Delete Confirm Dialog ── */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('profile.deleteConfirm')}</h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">{t('profile.deleteDesc')}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 min-h-[48px] rounded-xl border-2 border-slate-300 dark:border-slate-700 font-semibold text-[14px] text-slate-800 dark:text-slate-200 active:scale-95 transition-all">
                  {t('common.cancel')}
                </button>
                <button type="button" onClick={handleDeleteAll} className="flex-1 min-h-[48px] rounded-xl bg-rose-600 text-white font-bold text-[14px] active:scale-95 transition-all">
                  ລຶບ
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
};
