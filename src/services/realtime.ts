import { 
  ConnectionState, 
  RealtimeEventPayloads, 
  RealtimeEventType, 
  LocationCoords
} from '../types';
import { api } from './api';
import { SEED_UNITS } from './mock/seedData';

type EventHandler<T> = (data: T) => void;

export interface RealtimeClient {
  connect(): void;
  disconnect(): void;
  getConnectionState(): ConnectionState;
  onConnectionChange(callback: (state: ConnectionState) => void): () => void;
  on<K extends RealtimeEventType>(event: K, handler: EventHandler<RealtimeEventPayloads[K]>): () => void;
  off<K extends RealtimeEventType>(event: K, handler: EventHandler<RealtimeEventPayloads[K]>): void;
  subscribeIncident(incidentId: string): void;
  unsubscribeIncident(incidentId: string): void;
  subscribeDispatch(): void;
  unsubscribeDispatch(): void;
  // Simulation test helpers
  simulateDisconnect(): void;
  simulateReconnect(): void;
}

// ==========================================
// Mock Realtime Implementation
// ==========================================
class MockRealtimeClient implements RealtimeClient {
  private connectionState: ConnectionState = 'live';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<RealtimeEventType, Set<EventHandler<any>>> = new Map();
  private connectionListeners: Set<(state: ConnectionState) => void> = new Set();
  
  private subscribedIncidents: Set<string> = new Set();
  
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;
  private unitMovementInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
    this.startNetworkListeners();
  }

  private startNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.setConnectionState('live');
      });
      window.addEventListener('offline', () => {
        this.setConnectionState('offline');
      });
    }
  }

  connect(): void {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      this.setConnectionState('offline');
      return;
    }

    this.setConnectionState('live');
    this.startHeartbeat();
    this.startUnitMovementSimulation();
  }

  disconnect(): void {
    this.setConnectionState('offline');
    this.stopHeartbeat();
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    if (this.unitMovementInterval) clearInterval(this.unitMovementInterval);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    // Heartbeat every 5 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionState === 'live') {
        // Healthy heartbeat pulse
      }
    }, 5000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private setConnectionState(state: ConnectionState) {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionListeners.forEach((fn) => fn(state));
    }
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionListeners.add(callback);
    callback(this.connectionState);
    return () => this.connectionListeners.delete(callback);
  }

  on<K extends RealtimeEventType>(event: K, handler: EventHandler<RealtimeEventPayloads[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends RealtimeEventType>(event: K, handler: EventHandler<RealtimeEventPayloads[K]>): void {
    this.listeners.get(event)?.delete(handler);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit<K extends RealtimeEventType>(event: K, payload: RealtimeEventPayloads[K]): void {
    if (this.connectionState !== 'live') return;
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(payload));
    }
  }

  subscribeIncident(incidentId: string): void {
    this.subscribedIncidents.add(incidentId);
    this.runIncidentLifecycleSimulation(incidentId);
  }

  unsubscribeIncident(incidentId: string): void {
    this.subscribedIncidents.delete(incidentId);
  }

  subscribeDispatch(): void {
    // Subscribed to dispatch channel in mock mode
  }

  unsubscribeDispatch(): void {
    // Unsubscribed from dispatch channel in mock mode
  }

  /**
   * Simulates full lifecycle for an active incident:
   * Received -> Acknowledged -> Dispatched -> On the way -> Arrived -> Resolved
   */
  private runIncidentLifecycleSimulation(incidentId: string): void {
    // Step 1: Acknowledged after 5 seconds
    setTimeout(async () => {
      if (!this.subscribedIncidents.has(incidentId)) return;
      try {
        const incident = await api.getIncident(incidentId);
        if (incident.status === 'received') {
          await api.updateIncidentStatus(incidentId, 'acknowledged', 'ສູນສັ່ງການຮັບຊາບເຫດ ແລະ ກຳລັງປະສານງານ');
          this.emit('incident.status_changed', {
            incidentId,
            status: 'acknowledged',
            timestamp: new Date().toISOString(),
            note: 'ສູນສັ່ງການຮັບຊາບເຫດແລ້ວ',
          });
        }
      } catch {
        // Ignored
      }
    }, 5000);

    // Step 2: Dispatched & Assigned after 12 seconds
    setTimeout(async () => {
      if (!this.subscribedIncidents.has(incidentId)) return;
      try {
        const incident = await api.getIncident(incidentId);
        if (incident.status === 'acknowledged') {
          const sampleUnit = SEED_UNITS[0]; // e.g. Ambulance 01
          const updated = await api.assignUnit(incidentId, sampleUnit.id);
          this.emit('unit.assigned', {
            incidentId,
            unitId: sampleUnit.id,
            unit: sampleUnit,
          });
          this.emit('incident.status_changed', {
            incidentId,
            status: 'dispatched',
            timestamp: new Date().toISOString(),
            note: `ສັ່ງການ: ${sampleUnit.name}`,
          });
          this.emit('incident.updated', { incident: updated });
        }
      } catch {
        // Ignored
      }
    }, 12000);

    // Step 3: On the way after 20 seconds
    setTimeout(async () => {
      if (!this.subscribedIncidents.has(incidentId)) return;
      try {
        const incident = await api.getIncident(incidentId);
        if (incident.status === 'dispatched') {
          await api.updateIncidentStatus(incidentId, 'on_the_way', 'ໜ່ວຍງານກູ້ໄພກຳລັງເດີນທາງ ເຖິງໃນອີກ 3 ນາທີ');
          this.emit('incident.status_changed', {
            incidentId,
            status: 'on_the_way',
            timestamp: new Date().toISOString(),
            note: 'ໜ່ວຍງານກູ້ໄພກຳລັງເດີນທາງ',
          });
        }
      } catch {
        // Ignored
      }
    }, 20000);

    // Step 4: Arrived after 35 seconds
    setTimeout(async () => {
      if (!this.subscribedIncidents.has(incidentId)) return;
      try {
        const incident = await api.getIncident(incidentId);
        if (incident.status === 'on_the_way') {
          await api.updateIncidentStatus(incidentId, 'arrived', 'ໜ່ວຍງານກູ້ໄພຮອດຈຸດເກີດເຫດແລ້ວ');
          this.emit('incident.status_changed', {
            incidentId,
            status: 'arrived',
            timestamp: new Date().toISOString(),
            note: 'ໜ່ວຍງານກູ້ໄພຮອດຈຸດເກີດເຫດແລ້ວ',
          });
        }
      } catch {
        // Ignored
      }
    }, 35000);
  }

  /**
   * Simulates moving units by nudging lat/lng every 3 seconds
   */
  private startUnitMovementSimulation(): void {
    if (this.unitMovementInterval) clearInterval(this.unitMovementInterval);

    this.unitMovementInterval = setInterval(async () => {
      if (this.connectionState !== 'live') return;

      try {
        const units = await api.getUnits();
        for (const unit of units) {
          if (unit.status === 'busy') {
            // Nudge location slightly towards Vientiane center or random step
            const deltaLat = (Math.random() - 0.5) * 0.0008;
            const deltaLng = (Math.random() - 0.5) * 0.0008;
            const updatedLocation: LocationCoords = {
              ...unit.location,
              lat: unit.location.lat + deltaLat,
              lng: unit.location.lng + deltaLng,
            };

            await api.updateUnitLocation(unit.id, updatedLocation);
            this.emit('unit.location_updated', {
              unitId: unit.id,
              location: updatedLocation,
              etaMinutes: Math.max(1, (unit.etaMinutes || 3) - 0.1),
            });
          }
        }
      } catch {
        // Ignored
      }
    }, 3000);
  }

  // Simulation controls for testing reconnect / offline behavior
  simulateDisconnect(): void {
    this.setConnectionState('offline');
    this.stopHeartbeat();
  }

  simulateReconnect(): void {
    this.setConnectionState('reconnecting');
    setTimeout(() => {
      this.connect();
    }, 1500);
  }
}

// ==========================================
// Real WebSocket Client Implementation
// ==========================================
class WebSocketRealtimeClient implements RealtimeClient {
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = 'offline';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<RealtimeEventType, Set<EventHandler<any>>> = new Map();
  private connectionListeners: Set<(state: ConnectionState) => void> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private attempts = 0;

  connect(): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/realtime`;

    try {
      this.setConnectionState('reconnecting');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setConnectionState('live');
        this.attempts = 0;
      };

      this.ws.onclose = () => {
        this.setConnectionState('offline');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.setConnectionState('offline');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type && this.listeners.has(data.type)) {
            this.listeners.get(data.type)?.forEach((h) => h(data.payload));
          }
        } catch {
          // Bad payload
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.attempts++;
    const delay = Math.min(1000 * Math.pow(2, this.attempts), 30000);
    this.setConnectionState('reconnecting');
    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) this.ws.close();
    this.setConnectionState('offline');
  }

  private setConnectionState(state: ConnectionState) {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionListeners.forEach((fn) => fn(state));
    }
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionListeners.add(callback);
    callback(this.connectionState);
    return () => this.connectionListeners.delete(callback);
  }

  on<K extends RealtimeEventType>(event: K, handler: EventHandler<RealtimeEventPayloads[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends RealtimeEventType>(event: K, handler: EventHandler<RealtimeEventPayloads[K]>): void {
    this.listeners.get(event)?.delete(handler);
  }

  subscribeIncident(incidentId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe:incident', incidentId }));
    }
  }

  unsubscribeIncident(incidentId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe:incident', incidentId }));
    }
  }

  subscribeDispatch(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe:dispatch' }));
    }
  }

  unsubscribeDispatch(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe:dispatch' }));
    }
  }

  simulateDisconnect(): void {
    this.disconnect();
  }

  simulateReconnect(): void {
    this.connect();
  }
}

// Single env flag VITE_USE_MOCK=true|false switches mock vs real WebSocket client
const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
export const realtime: RealtimeClient = isMock ? new MockRealtimeClient() : new WebSocketRealtimeClient();
