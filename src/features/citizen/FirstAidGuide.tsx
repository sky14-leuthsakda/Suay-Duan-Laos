import React, { useState, useEffect, useRef } from 'react';
import { FIRST_AID_TOPICS, FirstAidTopic } from '../../data/firstAidData';
import { useAppStore } from '../../stores/appStore';
import { useTranslation } from '../../i18n';
import {
  Search,
  HeartPulse,
  Droplet,
  Flame,
  AlertTriangle,
  Sun,
  UserX,
  Phone,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Activity,
  List,
} from 'lucide-react';

type CategoryFilter = 'critical' | 'trauma' | 'other';

// ─── Topic icon map ────────────────────────────────────────────────────────
const topicIcon = (iconName: string, className = 'w-5 h-5') => {
  switch (iconName) {
    case 'heart-pulse': return <HeartPulse className={`${className} text-rose-500`} />;
    case 'droplet':     return <Droplet className={`${className} text-red-500`} />;
    case 'user-x':      return <UserX className={`${className} text-purple-500`} />;
    case 'flame':       return <Flame className={`${className} text-orange-500`} />;
    case 'sun':         return <Sun className={`${className} text-amber-500`} />;
    default:            return <AlertTriangle className={`${className} text-yellow-500`} />;
  }
};

const categoryOf = (cat: FirstAidTopic['category']): CategoryFilter => {
  if (cat === 'critical') return 'critical';
  if (cat === 'trauma')   return 'trauma';
  return 'other';
};

// ─── CPR Metronome ─────────────────────────────────────────────────────────
const CPRMetronome: React.FC = () => {
  const { silentMode } = useAppStore();
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const bpm = 110;
  const interval = Math.round(60000 / bpm);

  const playClick = () => {
    if (silentMode) return;
    try {
      if (!audioCtxRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AC = window.AudioContext ?? (window as any).webkitAudioContext;
        audioCtxRef.current = new AC();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } catch { /* AudioContext not supported */ }
  };

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    playClick(); setBeat(true); setTimeout(() => setBeat(false), 100);
    intervalRef.current = setInterval(() => {
      playClick(); setBeat(true); setTimeout(() => setBeat(false), 100);
    }, interval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, silentMode]);

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-100 ${
          beat ? 'scale-110 bg-rose-500' : 'scale-100 bg-rose-600'
        }`}
      >
        <HeartPulse className={`w-10 h-10 text-white transition-transform duration-100 ${beat ? 'scale-110' : ''}`} />
      </div>
      <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">{t('guide.cprBpm')}</p>
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        className={`min-h-[48px] px-6 rounded-xl font-bold text-[14px] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
          running
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
            : 'bg-rose-600 text-white hover:bg-rose-500'
        }`}
      >
        {running ? 'ຢຸດ' : `${t('guide.cprMetronome')}`}
      </button>
    </div>
  );
};

// ─── Topic Step Viewer (full-screen) ───────────────────────────────────────
interface TopicViewerProps {
  topic: FirstAidTopic;
  onBack: () => void;
}

const TopicViewer: React.FC<TopicViewerProps> = ({ topic, onBack }) => {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const totalSteps = topic.stepsLo.length;
  const isCPR = topic.id === 'cpr';

  return (
    <div className="citizen-content flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('common.back')}
          className="touch-icon rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-[16px] font-bold text-slate-900 dark:text-white leading-tight truncate">
          {topic.titleLo}
        </h1>
        {!viewAll && (
          <span className="text-[13px] font-semibold text-slate-400 shrink-0">
            {t('guide.step')} {stepIndex + 1} {t('guide.of')} {totalSteps}
          </span>
        )}
      </div>

      {/* Critical warning — top amber banner (single most important) */}
      {topic.warningsLo.length > 0 && (
        <div className="shrink-0 flex items-start gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-[13px]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <span className="font-semibold">{topic.warningsLo[0]}</span>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {isCPR && <CPRMetronome />}

        {viewAll ? (
          // All steps listed
          <div className="space-y-3">
            {topic.stepsLo.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-[13px] font-bold">
                  {idx + 1}
                </span>
                <p className="text-[16px] text-slate-800 dark:text-slate-200 leading-relaxed flex-1">
                  {step.replace(/^\d+\.\s*/, '')}
                </p>
              </div>
            ))}
            {topic.warningsLo.slice(1).map((w, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-[14px]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        ) : (
          // Single step view
          <div className="flex flex-col items-center text-center gap-4 py-4">
            {/* Step icon */}
            <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
              {topicIcon(topic.icon, 'w-10 h-10')}
            </div>
            {/* Step text — 18px bold */}
            <p className="text-[18px] font-bold text-slate-900 dark:text-white leading-relaxed">
              {topic.stepsLo[stepIndex]?.replace(/^\d+\.\s*/, '')}
            </p>
            {/* Progress dots */}
            <div className="flex gap-1.5 mt-2">
              {topic.stepsLo.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${t('guide.step')} ${i + 1}`}
                  onClick={() => setStepIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                    i === stepIndex ? 'w-5 bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Prev/Next or toggle */}
      {!viewAll && (
        <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="flex-1 min-h-[48px] rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('guide.prevStep')}
          </button>
          {stepIndex < totalSteps - 1 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.min(totalSteps - 1, i + 1))}
              className="flex-1 min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {t('guide.nextStep')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setViewAll(true)}
              className="flex-1 min-h-[48px] rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <List className="w-4 h-4" />
              {t('guide.viewAll')}
            </button>
          )}
        </div>
      )}
      {viewAll && (
        <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { setViewAll(false); setStepIndex(0); }}
            className="flex-1 min-h-[48px] rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Activity className="w-4 h-4" />
            ເບິ່ງທີລະຂັ້ນ
          </button>
        </div>
      )}

      {/* Fixed "ໂທ 195" bar above bottom nav */}
      <div className="shrink-0 px-4 pb-2 pt-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <a
          href={`tel:${topic.emergencyNumber || '195'}`}
          className="flex items-center justify-center gap-2 min-h-[48px] w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] active:scale-95 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>{t('guide.callEmergency')}</span>
        </a>
      </div>
    </div>
  );
};

// ─── Main FirstAidGuide (List view) ───────────────────────────────────────
export const FirstAidGuide: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<CategoryFilter>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<FirstAidTopic | null>(null);

  const toggleFilter = (cat: CategoryFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filtered = FIRST_AID_TOPICS.filter((topic) => {
    if (activeFilters.size > 0 && !activeFilters.has(categoryOf(topic.category))) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return topic.titleLo.toLowerCase().includes(q) || topic.descriptionLo.toLowerCase().includes(q);
    }
    return true;
  });

  // Show topic viewer
  if (selectedTopic) {
    return <TopicViewer topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
  }

  const filterConfig: Array<{ cat: CategoryFilter; label: string; color: string; active: string }> = [
    { cat: 'critical', label: t('guide.filterCritical'), color: 'text-rose-500 border-rose-200 dark:border-rose-900/50 bg-slate-50 dark:bg-slate-800', active: 'bg-rose-600 text-white border-rose-600' },
    { cat: 'trauma',   label: t('guide.filterTrauma'),   color: 'text-orange-500 border-orange-200 dark:border-orange-900/50 bg-slate-50 dark:bg-slate-800', active: 'bg-orange-500 text-white border-orange-500' },
    { cat: 'other',    label: t('guide.filterOther'),    color: 'text-slate-500 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800', active: 'bg-slate-700 text-white border-slate-700 dark:bg-slate-500 dark:border-slate-500' },
  ];

  return (
    <div className="citizen-content flex flex-col overflow-hidden">
      {/* ── Search + filter icon toggles ── */}
      <div className="shrink-0 flex items-center gap-2 px-4 pt-3 pb-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('guide.searchPlaceholder')}
            className="w-full h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 text-[14px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </div>
        {filterConfig.map((fc) => {
          const isActive = activeFilters.has(fc.cat);
          return (
            <button
              key={fc.cat}
              type="button"
              aria-label={fc.label}
              aria-pressed={isActive}
              title={fc.label}
              onClick={() => toggleFilter(fc.cat)}
              className={`touch-icon w-11 h-11 rounded-xl border-2 font-bold text-[11px] text-center leading-tight px-1 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shrink-0 ${
                isActive ? fc.active : fc.color
              }`}
            >
              {fc.label}
            </button>
          );
        })}
      </div>

      {/* ── Topic list (only scrolls) ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-2 space-y-1.5">
        {filtered.length === 0 && (
          <div className="py-8 text-center text-[14px] text-slate-400">ບໍ່ພົບຫົວຂໍ້ທີ່ຄົ້ນຫາ</div>
        )}
        {filtered.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => { setSelectedTopic(topic); }}
            className="w-full flex items-center gap-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            style={{ minHeight: '56px' }}
          >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {topicIcon(topic.icon)}
            </div>
            <div className="flex-1 min-w-0 py-2.5">
              <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight truncate">
                {topic.titleLo}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                {topic.descriptionLo}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        ))}
      </div>

      {/* ── Disclaimer footer ── */}
      <div className="shrink-0 px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <p className="text-[12px] text-slate-400 text-center">{t('guide.disclaimer')}</p>
      </div>

      {/* ── Fixed "ໂທ 195" bar ── */}
      <div className="shrink-0 px-4 pb-2 pt-1 bg-white dark:bg-slate-900">
        <a
          href="tel:195"
          className="flex items-center justify-center gap-2 min-h-[48px] w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] active:scale-95 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>{t('guide.callEmergency')}</span>
        </a>
      </div>
    </div>
  );
};
