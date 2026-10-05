import React, { useMemo } from 'react';
import { Incident, IncidentPriority, IncidentStatus, EmergencyType } from '../../../types';
import { useDispatchStore } from '../../../stores/dispatchStore';
import { useTranslation } from '../../../i18n';
import { 
  PriorityBadge, 
  EmergencyTypeBadge, 
  StatusBadge, 
  Card 
} from '../../../components';
import { 
  Search, 
  MapPin, 
  Copy, 
  Clock, 
  Truck, 
  X, 
  AlertOctagon,
  Layers
} from 'lucide-react';

interface IncidentQueueProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  className?: string;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  className = '',
}) => {
  const { t } = useTranslation();
  const {
    filters,
    setSearch,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    setProvinceFilter,
    resetFilters,
    groupByDuplicates,
    toggleDuplicateGrouping,
    hasNewCriticalAlert,
    dismissCriticalAlert,
  } = useDispatchStore();

  // Detect duplicates within ~500m (0.005 degrees) having same emergency type
  const nearbyDuplicatesMap = useMemo(() => {
    const map = new Map<string, Incident[]>();
    incidents.forEach((inc1) => {
      const duplicates = incidents.filter(
        (inc2) =>
          inc2.id !== inc1.id &&
          inc2.type === inc1.type &&
          Math.hypot(
            (inc1.location?.lat || 0) - (inc2.location?.lat || 0),
            (inc1.location?.lng || 0) - (inc2.location?.lng || 0)
          ) < 0.005
      );
      if (duplicates.length > 0) {
        map.set(inc1.id, duplicates);
      }
    });
    return map;
  }, [incidents]);

  // Filter incidents locally based on active filters
  const filteredIncidents = incidents.filter((incident) => {
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    if (filters.priority !== 'all' && incident.priority !== filters.priority) return false;
    if (filters.type !== 'all' && incident.type !== filters.type) return false;
    if (filters.province !== 'all' && incident.location.province !== filters.province) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchCode = incident.trackingCode.toLowerCase().includes(q);
      const matchAddress = incident.location.address?.toLowerCase().includes(q);
      const matchNote = incident.note?.toLowerCase().includes(q);
      const matchPhone = incident.reporterPhone?.toLowerCase().includes(q);
      if (!matchCode && !matchAddress && !matchNote && !matchPhone) return false;
    }

    return true;
  });

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.status !== 'all' || 
    filters.priority !== 'all' || 
    filters.type !== 'all' || 
    filters.province !== 'all';

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Visual Critical Alert Flash Banner */}
      {hasNewCriticalAlert && (
        <div 
          role="alert"
          className="bg-rose-600 text-white p-3 rounded-2xl flex items-center justify-between shadow-xl shadow-rose-900/40 animate-bounce"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <span>ມີເຫດສຸກເສີນວິກິດໃໝ່ເຂົ້າມາ! (New Critical Incident Alert!)</span>
          </div>
          <button
            type="button"
            onClick={dismissCriticalAlert}
            className="p-1 rounded-lg hover:bg-rose-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, address, note, phone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={toggleDuplicateGrouping}
            className={`touch-target px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              groupByDuplicates
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Group nearby duplicate reports"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicates</span>
          </button>
        </div>

        {/* Dropdowns / Filter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'all')}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Status: All</option>
            <option value="received">{t('status.received')}</option>
            <option value="acknowledged">{t('status.acknowledged')}</option>
            <option value="dispatched">{t('status.dispatched')}</option>
            <option value="on_the_way">{t('status.on_the_way')}</option>
            <option value="arrived">{t('status.arrived')}</option>
            <option value="resolved">{t('status.resolved')}</option>
            <option value="cancelled">{t('status.cancelled')}</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setPriorityFilter(e.target.value as IncidentPriority | 'all')}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Priority: All</option>
            <option value="critical">{t('priority.critical')}</option>
            <option value="high">{t('priority.high')}</option>
            <option value="medium">{t('priority.medium')}</option>
            <option value="low">{t('priority.low')}</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setTypeFilter(e.target.value as EmergencyType | 'all')}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Type: All</option>
            <option value="fire">{t('emergencyTypes.fire')}</option>
            <option value="medical">{t('emergencyTypes.medical')}</option>
            <option value="accident">{t('emergencyTypes.accident')}</option>
            <option value="crime">{t('emergencyTypes.crime')}</option>
            <option value="flood">{t('emergencyTypes.flood')}</option>
            <option value="other">{t('emergencyTypes.other')}</option>
          </select>

          {/* Province Filter */}
          <select
            value={filters.province}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Province: All</option>
            <option value="Vientiane Capital">ວຽງຈັນ (Vientiane)</option>
            <option value="Luang Prabang">ຫຼວງພະບາງ (Luang Prabang)</option>
            <option value="Champasak">ຈຳປາສັກ (Champasak)</option>
            <option value="Savannakhet">ສະຫວັນນະເຂດ (Savannakhet)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Showing {filteredIncidents.length} of {incidents.length} incidents
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] text-blue-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Incident Cards Queue */}
      <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No incidents matching current filters.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = incident.id === selectedIncidentId;
            const isCritical = incident.priority === 'critical';

            return (
              <Card
                key={incident.id}
                onClick={() => onSelectIncident(incident.id)}
                className={`cursor-pointer transition-all duration-150 space-y-2.5 ${
                  isSelected
                    ? 'bg-slate-800/90 border-2 border-blue-500 shadow-lg shadow-blue-950/40 scale-[1.01]'
                    : isCritical
                    ? 'bg-slate-900 border border-rose-900/50 hover:border-rose-700'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row: Badges & Time */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <PriorityBadge priority={incident.priority} size="sm" />
                    <EmergencyTypeBadge type={incident.type} size="sm" />
                    <StatusBadge status={incident.status} size="sm" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{timeAgo(incident.createdAt)}</span>
                  </span>
                </div>

                {/* Tracking Code & Location */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-white">
                      #{incident.trackingCode}
                    </span>
                    {incident.reporterPhone && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {incident.reporterPhone}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex items-start gap-1 leading-snug">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {incident.location.address || 'Vientiane Capital'}
                    </span>
                  </p>
                </div>

                {/* Optional Note snippet */}
                {incident.note && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-1 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                    "{incident.note}"
                  </p>
                )}

                {/* Duplicate Detection Alert Badge & Merge UI */}
                {nearbyDuplicatesMap.get(incident.id) && nearbyDuplicatesMap.get(incident.id)!.length > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/50 border border-purple-800/60 text-[11px] text-purple-300">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{nearbyDuplicatesMap.get(incident.id)!.length} duplicate reports nearby</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Merge nearby duplicates
                      }}
                      className="px-2 py-0.5 rounded bg-purple-800 hover:bg-purple-700 text-white font-bold text-[10px]"
                    >
                      Group / Merge
                    </button>
                  </div>
                )}

                {/* Assigned Unit Snippet */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>
                      {incident.assignedUnit ? (
                        <strong className="text-slate-200">{incident.assignedUnit.name}</strong>
                      ) : (
                        <span className="text-amber-500">Unassigned</span>
                      )}
                    </span>
                  </div>

                  {incident.assignedUnit?.etaMinutes && (
                    <span className="text-emerald-400 font-bold font-mono">
                      ETA ~{Math.round(incident.assignedUnit.etaMinutes)}m
                    </span>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
