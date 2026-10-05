import { create } from 'zustand';
import { 
  Incident, 
  Unit, 
  IncidentStatus, 
  LocationCoords, 
  CreateIncidentInput 
} from '../types';
import { api } from '../services/api';
import { realtime } from '../services/realtime';
import { triggerHaptic } from '../utils/haptics';

interface IncidentState {
  activeIncident: Incident | null;
  activeIncidentId: string | null;
  isStale: boolean;
  isLoading: boolean;
  error: string | null;
  retryQueue: CreateIncidentInput[];

  setActiveIncident: (incident: Incident | null) => void;
  createSOSIncident: (input: CreateIncidentInput) => Promise<Incident>;
  loadActiveIncident: () => Promise<void>;
  clearActiveIncident: () => void;
  updateLocalStatus: (status: IncidentStatus) => void;
  updateUnitLocation: (location: LocationCoords, etaMinutes?: number) => void;
  retryFailedReports: () => Promise<void>;
}

const STORAGE_ACTIVE_INCIDENT_ID = 'sdl_active_incident_id';
const STORAGE_RETRY_QUEUE = 'sdl_retry_queue';

export const useIncidentStore = create<IncidentState>((set, get) => ({
  activeIncident: null,
  activeIncidentId: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ACTIVE_INCIDENT_ID) : null,
  isStale: false,
  isLoading: false,
  error: null,
  retryQueue: typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem(STORAGE_RETRY_QUEUE) || '[]') 
    : [],

  setActiveIncident: (incident) => {
    if (incident) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ACTIVE_INCIDENT_ID, incident.id);
      }
      set({ activeIncident: incident, activeIncidentId: incident.id, isStale: false });
      realtime.subscribeIncident(incident.id);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_ACTIVE_INCIDENT_ID);
      }
      set({ activeIncident: null, activeIncidentId: null, isStale: false });
    }
  },

  createSOSIncident: async (input) => {
    set({ isLoading: true, error: null });

    const connState = realtime.getConnectionState();
    if (connState === 'offline') {
      // Optimistic UI & Offline Queueing
      const queue = [...get().retryQueue, input];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_RETRY_QUEUE, JSON.stringify(queue));
      }
      set({ retryQueue: queue, isLoading: false });

      // Generate local pending incident
      const now = new Date().toISOString();
      const offlineIncident: Incident = {
        id: `offline-${Date.now()}`,
        trackingCode: `SDL-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`,
        type: input.type,
        status: 'received',
        priority: input.priority || 'critical',
        location: input.location,
        note: input.note,
        photoUrl: input.photoUrl,
        timeline: [
          {
            id: `evt-${Date.now()}`,
            incidentId: `offline-${Date.now()}`,
            status: 'received',
            timestamp: now,
            note: 'ແຈ້ງເຫດບັນທຶກໃນເຄື່ອງ (Offline queue - ຈະສົ່ງອັດຕະໂນມັດເມື່ອມີເນັດ)',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      get().setActiveIncident(offlineIncident);
      return offlineIncident;
    }

    try {
      const incident = await api.createIncident(input);
      get().setActiveIncident(incident);
      set({ isLoading: false });
      return incident;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create incident';
      set({ isLoading: false, error: errorMsg });
      throw err;
    }
  },

  loadActiveIncident: async () => {
    const id = get().activeIncidentId;
    if (!id) return;

    set({ isLoading: true });
    try {
      const incident = await api.getIncident(id);
      set({ activeIncident: incident, isLoading: false, isStale: false });
      realtime.subscribeIncident(incident.id);
    } catch {
      set({ isLoading: false, isStale: true });
    }
  },

  clearActiveIncident: () => {
    const active = get().activeIncident;
    if (active) {
      realtime.unsubscribeIncident(active.id);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_ACTIVE_INCIDENT_ID);
    }
    set({ activeIncident: null, activeIncidentId: null, isStale: false });
  },

  updateLocalStatus: (status) => {
    const active = get().activeIncident;
    if (!active) return;
    const now = new Date().toISOString();
    const updated: Incident = {
      ...active,
      status,
      updatedAt: now,
      timeline: [
        ...active.timeline,
        {
          id: `evt-${Date.now()}`,
          incidentId: active.id,
          status,
          timestamp: now,
        },
      ],
    };
    set({ activeIncident: updated });
    triggerHaptic('sos');
  },

  updateUnitLocation: (location, etaMinutes) => {
    const active = get().activeIncident;
    if (!active || !active.assignedUnit) return;
    const updatedUnit: Unit = {
      ...active.assignedUnit,
      location,
      etaMinutes: etaMinutes ?? active.assignedUnit.etaMinutes,
      updatedAt: new Date().toISOString(),
    };
    set({
      activeIncident: {
        ...active,
        assignedUnit: updatedUnit,
      },
    });
  },

  retryFailedReports: async () => {
    const queue = [...get().retryQueue];
    if (queue.length === 0) return;

    const remaining: CreateIncidentInput[] = [];
    for (const item of queue) {
      try {
        await api.createIncident(item);
      } catch {
        remaining.push(item);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_RETRY_QUEUE, JSON.stringify(remaining));
    }
    set({ retryQueue: remaining });
  },
}));

// Realtime event listeners binding
if (typeof window !== 'undefined') {
  // Listen for connection changes
  realtime.onConnectionChange((state) => {
    if (state === 'offline' || state === 'reconnecting') {
      useIncidentStore.setState({ isStale: true });
    } else if (state === 'live') {
      useIncidentStore.setState({ isStale: false });
      // Flush retry queue and reload fresh incident state
      useIncidentStore.getState().retryFailedReports();
      useIncidentStore.getState().loadActiveIncident();
    }
  });

  // Listen for incident status updates
  realtime.on('incident.status_changed', (payload) => {
    const active = useIncidentStore.getState().activeIncident;
    if (active && active.id === payload.incidentId) {
      useIncidentStore.getState().updateLocalStatus(payload.status);
    }
  });

  // Listen for unit assigned
  realtime.on('unit.assigned', (payload) => {
    const active = useIncidentStore.getState().activeIncident;
    if (active && active.id === payload.incidentId) {
      useIncidentStore.setState({
        activeIncident: {
          ...active,
          assignedUnitId: payload.unitId,
          assignedUnit: payload.unit,
          status: 'dispatched',
        },
      });
      triggerHaptic('sos');
    }
  });

  // Listen for unit location updates
  realtime.on('unit.location_updated', (payload) => {
    const active = useIncidentStore.getState().activeIncident;
    if (active && active.assignedUnitId === payload.unitId) {
      useIncidentStore.getState().updateUnitLocation(payload.location, payload.etaMinutes);
    }
  });
}
