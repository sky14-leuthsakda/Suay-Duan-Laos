import React, { useEffect } from 'react';
import { useDispatchStore } from '../../stores/dispatchStore';
import { LiveMap } from './components/LiveMap';
import { IncidentDetailModal } from './components/IncidentDetailModal';

export const ControlLiveMapPage: React.FC = () => {
  const {
    incidents,
    units,
    selectedIncidentId,
    selectIncident,
    fetchInitialData,
  } = useDispatchStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className="flex-1 flex flex-col space-y-3 h-[calc(100vh-140px)] min-h-[500px]">
      <LiveMap
        incidents={incidents}
        units={units}
        selectedIncidentId={selectedIncidentId}
        onSelectIncident={(id) => selectIncident(id)}
        className="flex-1 w-full h-full rounded-2xl"
      />

      {selectedIncidentId && (
        <IncidentDetailModal
          incidentId={selectedIncidentId}
          onClose={() => selectIncident(null)}
        />
      )}
    </div>
  );
};
