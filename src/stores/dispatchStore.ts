import { create } from 'zustand';
import { 
  Incident, 
  Unit, 
  IncidentStatus, 
  IncidentPriority, 
  EmergencyType 
} from '../types';
import { api } from '../services/api';
import { realtime } from '../services/realtime';
import { playEmergencyAlertSound } from '../utils/audioAlert';

export interface DispatchFilterState {
  search: string;
  status: IncidentStatus | 'all';
  priority: IncidentPriority | 'all';
  type: EmergencyType | 'all';
  province: string | 'all';
}

interface DispatchState {
  incidents: Incident[];
  units: Unit[];
  selectedIncidentId: string | null;
  filters: DispatchFilterState;
  groupByDuplicates: boolean;
  hasNewCriticalAlert: boolean;
  isLoading: boolean;

  // Actions
  fetchInitialData: () => Promise<void>;
  selectIncident: (id: string | null) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: IncidentStatus | 'all') => void;
  setPriorityFilter: (priority: IncidentPriority | 'all') => void;
  setTypeFilter: (type: EmergencyType | 'all') => void;
  setProvinceFilter: (province: string | 'all') => void;
  resetFilters: () => void;
  toggleDuplicateGrouping: () => void;
  dismissCriticalAlert: () => void;
  updateIncidentInList: (updated: Incident) => void;
}

const PRIORITY_ORDER: Record<IncidentPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const useDispatchStore = create<DispatchState>((set, get) => ({
  incidents: [],
  units: [],
  selectedIncidentId: null,
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    type: 'all',
    province: 'all',
  },
  groupByDuplicates: false,
  hasNewCriticalAlert: false,
  isLoading: false,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [incidents, units] = await Promise.all([
        api.getIncidents(),
        api.getUnits(),
      ]);

      // Sort by priority then creation time
      const sorted = [...incidents].sort((a, b) => {
        const pDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        if (pDiff !== 0) return pDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      set({ incidents: sorted, units, isLoading: false });
      realtime.subscribeDispatch();
    } catch {
      set({ isLoading: false });
    }
  },

  selectIncident: (selectedIncidentId) => {
    set({ selectedIncidentId });
  },

  setSearch: (search) => {
    set((state) => ({ filters: { ...state.filters, search } }));
  },

  setStatusFilter: (status) => {
    set((state) => ({ filters: { ...state.filters, status } }));
  },

  setPriorityFilter: (priority) => {
    set((state) => ({ filters: { ...state.filters, priority } }));
  },

  setTypeFilter: (type) => {
    set((state) => ({ filters: { ...state.filters, type } }));
  },

  setProvinceFilter: (province) => {
    set((state) => ({ filters: { ...state.filters, province } }));
  },

  resetFilters: () => {
    set({
      filters: {
        search: '',
        status: 'all',
        priority: 'all',
        type: 'all',
        province: 'all',
      },
    });
  },

  toggleDuplicateGrouping: () => {
    set((state) => ({ groupByDuplicates: !state.groupByDuplicates }));
  },

  dismissCriticalAlert: () => {
    set({ hasNewCriticalAlert: false });
  },

  updateIncidentInList: (updated) => {
    const list = get().incidents.map((i) => (i.id === updated.id ? updated : i));
    set({ incidents: list });
  },
}));

// Realtime listeners for Dispatch Dashboard
if (typeof window !== 'undefined') {
  realtime.on('incident.created', (payload) => {
    const state = useDispatchStore.getState();
    const isCritical = payload.incident.priority === 'critical';
    
    if (isCritical) {
      playEmergencyAlertSound();
      useDispatchStore.setState({ hasNewCriticalAlert: true });
    }

    const updated = [payload.incident, ...state.incidents].sort((a, b) => {
      const pDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    useDispatchStore.setState({ incidents: updated });
  });

  realtime.on('incident.status_changed', (payload) => {
    const state = useDispatchStore.getState();
    const updated = state.incidents.map((inc) => {
      if (inc.id === payload.incidentId) {
        return {
          ...inc,
          status: payload.status,
          updatedAt: payload.timestamp,
        };
      }
      return inc;
    });
    useDispatchStore.setState({ incidents: updated });
  });

  realtime.on('unit.assigned', (payload) => {
    const state = useDispatchStore.getState();
    const updated = state.incidents.map((inc) => {
      if (inc.id === payload.incidentId) {
        return {
          ...inc,
          status: 'dispatched' as IncidentStatus,
          assignedUnitId: payload.unitId,
          assignedUnit: payload.unit,
        };
      }
      return inc;
    });
    useDispatchStore.setState({ incidents: updated });
  });

  realtime.on('unit.location_updated', (payload) => {
    const state = useDispatchStore.getState();
    const updatedUnits = state.units.map((u) => {
      if (u.id === payload.unitId) {
        return {
          ...u,
          location: payload.location,
          etaMinutes: payload.etaMinutes ?? u.etaMinutes,
          updatedAt: new Date().toISOString(),
        };
      }
      return u;
    });

    // Also update assigned unit in incidents if matching
    const updatedIncidents = state.incidents.map((inc) => {
      if (inc.assignedUnitId === payload.unitId && inc.assignedUnit) {
        return {
          ...inc,
          assignedUnit: {
            ...inc.assignedUnit,
            location: payload.location,
            etaMinutes: payload.etaMinutes ?? inc.assignedUnit.etaMinutes,
          },
        };
      }
      return inc;
    });

    useDispatchStore.setState({ units: updatedUnits, incidents: updatedIncidents });
  });
}
