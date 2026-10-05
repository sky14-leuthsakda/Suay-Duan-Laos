import React, { useEffect, useState } from 'react';
import { useDispatchStore } from '../../stores/dispatchStore';
import { IncidentQueue } from './components/IncidentQueue';
import { LiveMap } from './components/LiveMap';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { Card } from '../../components';
import { 
  AlertTriangle, 
  Ambulance, 
  Clock, 
  Radio, 
  LayoutList, 
  Map as MapIcon 
} from 'lucide-react';

export const DispatchDashboard: React.FC = () => {
  const { 
    incidents, 
    units, 
    selectedIncidentId, 
    selectIncident, 
    fetchInitialData,
    isLoading 
  } = useDispatchStore();

  const [mobileTab, setMobileTab] = useState<'queue' | 'map'>('queue');

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Derived metrics
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'cancelled');
  const criticalCount = activeIncidents.filter((i) => i.priority === 'critical').length;
  const availableUnits = units.filter((u) => u.status === 'available').length;
  const busyUnits = units.filter((u) => u.status === 'busy').length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <Card className="!p-3 sm:!p-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-500">{activeIncidents.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">
            {criticalCount} Critical priority
          </span>
        </Card>

        <Card className="!p-3 sm:!p-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Response Units</span>
            <Ambulance className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-400">{units.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">
            {availableUnits} Available • {busyUnits} Busy
          </span>
        </Card>

        <Card className="!p-3 sm:!p-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Avg Response Time</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-400">5.8m</div>
          <span className="text-[11px] text-slate-400 font-medium">-1.4m this week</span>
        </Card>

        <Card className="!p-3 sm:!p-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Realtime Link</span>
            <Radio className="w-4 h-4 text-purple-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-purple-400">Live</div>
          <span className="text-[11px] text-slate-400 font-medium">Vientiane Central Operations</span>
        </Card>
      </div>

      {/* Mobile Tab Switcher (Visible only on small screens) */}
      <div className="lg:hidden flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setMobileTab('queue')}
          className={`touch-target flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${
            mobileTab === 'queue'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>Queue ({filteredQueueCount(incidents)})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`touch-target flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${
            mobileTab === 'map'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Live Map</span>
        </button>
      </div>

      {/* Main Split Layout: Left Queue (40%) | Right Live Map (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Incident Queue Column */}
        <div className={`lg:col-span-5 ${mobileTab === 'queue' ? 'block' : 'hidden lg:block'}`}>
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading incident queue...</div>
          ) : (
            <IncidentQueue
              incidents={incidents}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={(id) => {
                selectIncident(id);
                // On mobile, switch to map to inspect
                if (window.innerWidth < 1024) {
                  setMobileTab('map');
                }
              }}
            />
          )}
        </div>

        {/* Live Leaflet Map Column */}
        <div className={`lg:col-span-7 ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
          <LiveMap
            incidents={incidents}
            units={units}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={(id) => selectIncident(id)}
            className="h-[calc(100vh-250px)] min-h-[460px]"
          />
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncidentId && (
        <IncidentDetailModal
          incidentId={selectedIncidentId}
          onClose={() => selectIncident(null)}
        />
      )}
    </div>
  );
};

// Quick helper
function filteredQueueCount(items: unknown[]): number {
  return items.length;
}
