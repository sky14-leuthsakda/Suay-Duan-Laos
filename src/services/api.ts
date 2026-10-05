import { 
  Incident, 
  Unit, 
  CreateIncidentInput, 
  FilterIncidentsParams, 
  IncidentStatus, 
  IncidentPriority,
  LocationCoords, 
  UnitStatus,
  AuditLogEntry,
  FilterAuditLogParams,
  IncidentStats,
  EmergencyType
} from '../types';
import { SEED_INCIDENTS, SEED_UNITS, SEED_AUDIT_LOGS } from './mock/seedData';

export interface ApiService {
  createIncident(input: CreateIncidentInput): Promise<Incident>;
  getIncident(id: string): Promise<Incident>;
  getIncidents(params?: FilterIncidentsParams): Promise<Incident[]>;
  updateIncidentStatus(id: string, status: IncidentStatus, note?: string): Promise<Incident>;
  updateIncidentPriority(id: string, priority: IncidentPriority): Promise<Incident>;
  addIncidentInternalNote(id: string, note: string, authorName?: string): Promise<Incident>;
  assignUnit(incidentId: string, unitId: string): Promise<Incident>;
  getUnits(): Promise<Unit[]>;
  updateUnitLocation(unitId: string, location: LocationCoords): Promise<Unit>;
  updateUnitStatus(unitId: string, status: UnitStatus): Promise<Unit>;
  getAuditLogs(params?: FilterAuditLogParams): Promise<AuditLogEntry[]>;
  getIncidentStats(): Promise<IncidentStats>;
}

// ==========================================
// Mock Implementation
// ==========================================
class MockApiService implements ApiService {
  private incidents: Incident[] = [];
  private units: Unit[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private readonly STORAGE_KEY_INCIDENTS = 'sdl_mock_incidents';
  private readonly STORAGE_KEY_UNITS = 'sdl_mock_units';
  private readonly STORAGE_KEY_AUDIT_LOGS = 'sdl_mock_audit_logs';

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (typeof window === 'undefined') {
      this.incidents = [...SEED_INCIDENTS];
      this.units = [...SEED_UNITS];
      this.auditLogs = [...SEED_AUDIT_LOGS];
      return;
    }

    try {
      const storedIncidents = localStorage.getItem(this.STORAGE_KEY_INCIDENTS);
      const storedUnits = localStorage.getItem(this.STORAGE_KEY_UNITS);
      const storedLogs = localStorage.getItem(this.STORAGE_KEY_AUDIT_LOGS);

      this.incidents = storedIncidents ? JSON.parse(storedIncidents) : [...SEED_INCIDENTS];
      this.units = storedUnits ? JSON.parse(storedUnits) : [...SEED_UNITS];
      this.auditLogs = storedLogs ? JSON.parse(storedLogs) : [...SEED_AUDIT_LOGS];
    } catch {
      this.incidents = [...SEED_INCIDENTS];
      this.units = [...SEED_UNITS];
      this.auditLogs = [...SEED_AUDIT_LOGS];
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY_INCIDENTS, JSON.stringify(this.incidents));
      localStorage.setItem(this.STORAGE_KEY_UNITS, JSON.stringify(this.units));
      localStorage.setItem(this.STORAGE_KEY_AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch {
      // Storage quota or disabled
    }
  }

  private addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const log: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 250) {
      this.auditLogs = this.auditLogs.slice(0, 250);
    }
    this.saveState();
  }

  // Artificial network latency simulation
  private async delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async createIncident(input: CreateIncidentInput): Promise<Incident> {
    await this.delay(300);

    const now = new Date().toISOString();
    const id = `inc-${Date.now()}`;
    const trackingCode = `SDL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident: Incident = {
      id,
      trackingCode,
      type: input.type,
      status: 'received',
      priority: input.priority || (input.type === 'fire' || input.type === 'medical' ? 'critical' : 'high'),
      location: input.location,
      note: input.note,
      photoUrl: input.photoUrl,
      reporterPhone: input.reporterPhone,
      reporterName: input.reporterName,
      timeline: [
        {
          id: `evt-${Date.now()}`,
          incidentId: id,
          status: 'received',
          timestamp: now,
          note: 'ແຈ້ງເຫດສຸກເສີນຖືກສົ່ງເຂົ້າສູ່ລະບົບ (Incident received)',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.incidents.unshift(newIncident);
    this.addAuditLog({
      actorId: 'citizen',
      actorName: input.reporterName || 'ພົນລະເມືອງ (Citizen)',
      actorRole: 'citizen',
      action: 'INCIDENT_CREATED',
      entityType: 'incident',
      entityId: id,
      details: `ສ້າງເຫດສຸກເສີນໃໝ່ ${trackingCode} ປະເພດ ${input.type}`,
      newValue: 'received',
    });
    this.saveState();
    return newIncident;
  }

  async getIncident(id: string): Promise<Incident> {
    await this.delay(100);
    const incident = this.incidents.find((inc) => inc.id === id || inc.trackingCode === id);
    if (!incident) {
      throw new Error(`Incident not found with ID: ${id}`);
    }
    return incident;
  }

  async getIncidents(params?: FilterIncidentsParams): Promise<Incident[]> {
    await this.delay(150);
    let result = [...this.incidents];

    if (params?.status) {
      result = result.filter((i) => i.status === params.status);
    }
    if (params?.priority) {
      result = result.filter((i) => i.priority === params.priority);
    }
    if (params?.type) {
      result = result.filter((i) => i.type === params.type);
    }
    if (params?.province) {
      result = result.filter((i) => i.location.province === params.province);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.trackingCode.toLowerCase().includes(q) ||
          i.note?.toLowerCase().includes(q) ||
          i.location.address?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async updateIncidentStatus(id: string, status: IncidentStatus, note?: string): Promise<Incident> {
    await this.delay(200);
    const incident = await this.getIncident(id);
    const prevStatus = incident.status;
    const now = new Date().toISOString();

    incident.status = status;
    incident.updatedAt = now;
    incident.timeline.push({
      id: `evt-${Date.now()}`,
      incidentId: id,
      status,
      timestamp: now,
      note: note || `ສະຖານະປ່ຽນເປັນ: ${status}`,
    });

    this.addAuditLog({
      actorId: 'user-op-current',
      actorName: 'ສ.ພ. ສົມພອນ ວິໄລສັກ (Dispatcher)',
      actorRole: 'dispatcher',
      action: 'STATUS_CHANGED',
      entityType: 'incident',
      entityId: id,
      details: `ປ່ຽນສະຖານະເຫດການ ${incident.trackingCode} ເປັນ "${status}"`,
      previousValue: prevStatus,
      newValue: status,
    });

    this.saveState();
    return incident;
  }

  async updateIncidentPriority(id: string, priority: IncidentPriority): Promise<Incident> {
    await this.delay(150);
    const incident = await this.getIncident(id);
    const prevPriority = incident.priority;
    const now = new Date().toISOString();

    incident.priority = priority;
    incident.updatedAt = now;
    incident.timeline.push({
      id: `evt-${Date.now()}`,
      incidentId: id,
      status: incident.status,
      timestamp: now,
      note: `ປ່ຽນລະດັບຄວາມດ່ວນເປັນ: ${priority.toUpperCase()}`,
    });

    this.addAuditLog({
      actorId: 'user-op-current',
      actorName: 'ສ.ພ. ສົມພອນ ວິໄລສັກ (Dispatcher)',
      actorRole: 'dispatcher',
      action: 'PRIORITY_UPDATED',
      entityType: 'incident',
      entityId: id,
      details: `ປ່ຽນລະດັບຄວາມຮີບດ່ວນເຫດການ ${incident.trackingCode} ເປັນ "${priority}"`,
      previousValue: prevPriority,
      newValue: priority,
    });

    this.saveState();
    return incident;
  }

  async addIncidentInternalNote(id: string, noteText: string, authorName: string = 'Dispatcher'): Promise<Incident> {
    await this.delay(150);
    const incident = await this.getIncident(id);
    const now = new Date().toISOString();

    if (!incident.internalNotes) {
      incident.internalNotes = [];
    }

    incident.internalNotes.push({
      id: `note-${Date.now()}`,
      text: noteText,
      author: authorName,
      createdAt: now,
    });
    incident.updatedAt = now;

    this.addAuditLog({
      actorId: 'user-op-current',
      actorName: authorName,
      actorRole: 'dispatcher',
      action: 'NOTE_ADDED',
      entityType: 'incident',
      entityId: id,
      details: `ເພີ່ມບັນທຶກພາຍໃນໃສ່ເຫດການ ${incident.trackingCode}: ${noteText}`,
      newValue: noteText,
    });

    this.saveState();
    return incident;
  }

  async assignUnit(incidentId: string, unitId: string): Promise<Incident> {
    await this.delay(200);
    const incident = await this.getIncident(incidentId);
    const unit = this.units.find((u) => u.id === unitId);
    if (!unit) {
      throw new Error(`Unit not found with ID: ${unitId}`);
    }

    const prevAssigned = incident.assignedUnitId || 'none';
    unit.status = 'busy';
    unit.assignedIncidentId = incidentId;
    unit.updatedAt = new Date().toISOString();

    incident.assignedUnitId = unitId;
    incident.assignedUnit = unit;
    incident.status = 'dispatched';
    incident.updatedAt = new Date().toISOString();
    incident.timeline.push({
      id: `evt-${Date.now()}`,
      incidentId,
      status: 'dispatched',
      timestamp: new Date().toISOString(),
      note: `ສັ່ງການໜ່ວຍງານ: ${unit.name}`,
    });

    this.addAuditLog({
      actorId: 'user-op-current',
      actorName: 'ສ.ພ. ສົມພອນ ວິໄລສັກ (Dispatcher)',
      actorRole: 'dispatcher',
      action: 'UNIT_ASSIGNED',
      entityType: 'incident',
      entityId: incidentId,
      details: `ມອບໝາຍໜ່ວຍງານ "${unit.name}" ໃຫ້ເຫດການ ${incident.trackingCode}`,
      previousValue: prevAssigned,
      newValue: unitId,
    });

    this.saveState();
    return incident;
  }

  async getUnits(): Promise<Unit[]> {
    await this.delay(100);
    return [...this.units];
  }

  async updateUnitLocation(unitId: string, location: LocationCoords): Promise<Unit> {
    await this.delay(50);
    const unit = this.units.find((u) => u.id === unitId);
    if (!unit) {
      throw new Error(`Unit not found: ${unitId}`);
    }
    unit.location = location;
    unit.updatedAt = new Date().toISOString();
    this.saveState();
    return unit;
  }

  async updateUnitStatus(unitId: string, status: UnitStatus): Promise<Unit> {
    await this.delay(100);
    const unit = this.units.find((u) => u.id === unitId);
    if (!unit) {
      throw new Error(`Unit not found: ${unitId}`);
    }
    const prevStatus = unit.status;
    unit.status = status;
    if (status === 'available') {
      unit.assignedIncidentId = null;
    }
    unit.updatedAt = new Date().toISOString();

    this.addAuditLog({
      actorId: 'user-op-current',
      actorName: 'ສ.ພ. ສົມພອນ ວິໄລສັກ (Dispatcher)',
      actorRole: 'dispatcher',
      action: 'UNIT_STATUS_CHANGED',
      entityType: 'unit',
      entityId: unitId,
      details: `ປ່ຽນສະຖານະໜ່ວຍງານ "${unit.name}" ເປັນ "${status}"`,
      previousValue: prevStatus,
      newValue: status,
    });

    this.saveState();
    return unit;
  }

  async getAuditLogs(params?: FilterAuditLogParams): Promise<AuditLogEntry[]> {
    await this.delay(100);
    let result = [...this.auditLogs];

    if (params?.entityType) {
      result = result.filter((l) => l.entityType === params.entityType);
    }
    if (params?.action) {
      result = result.filter((l) => l.action === params.action);
    }
    if (params?.actor) {
      const q = params.actor.toLowerCase();
      result = result.filter((l) => l.actorName.toLowerCase().includes(q));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.details.toLowerCase().includes(q) ||
          l.actorName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async getIncidentStats(): Promise<IncidentStats> {
    await this.delay(150);
    const incidents = this.incidents;

    const totalToday = incidents.length;
    const activeToday = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'cancelled').length;
    const resolvedToday = incidents.filter((i) => i.status === 'resolved').length;
    const criticalToday = incidents.filter((i) => i.priority === 'critical').length;

    const byType: Record<EmergencyType, number> = {
      fire: 0,
      medical: 0,
      accident: 0,
      crime: 0,
      flood: 0,
      other: 0,
    };

    const byStatus: Record<IncidentStatus, number> = {
      received: 0,
      acknowledged: 0,
      dispatched: 0,
      on_the_way: 0,
      arrived: 0,
      resolved: 0,
      cancelled: 0,
    };

    const byProvince: Record<string, number> = {
      'ນະຄອນຫຼວງວຽງຈັນ (Vientiane Capital)': 0,
      'ແຂວງວຽງຈັນ (Vientiane Province)': 0,
      'ຫຼວງພະບາງ (Luang Prabang)': 0,
      'ຈຳປາສັກ (Champasak)': 0,
      'ສະຫວັນນະເຂດ (Savannakhet)': 0,
      'ອື່ນໆ (Other Provinces)': 0,
    };

    let totalResponseTimeMs = 0;
    let responseCount = 0;
    let totalDispatchMs = 0;
    let dispatchCount = 0;

    incidents.forEach((inc) => {
      // by type
      if (byType[inc.type] !== undefined) {
        byType[inc.type]++;
      } else {
        byType.other++;
      }

      // by status
      if (byStatus[inc.status] !== undefined) {
        byStatus[inc.status]++;
      }

      // by province
      const prov = inc.location.province || 'Vientiane Capital';
      if (prov.includes('Vientiane') || prov.includes('ວຽງຈັນ')) {
        byProvince['ນະຄອນຫຼວງວຽງຈັນ (Vientiane Capital)']++;
      } else if (prov.includes('Luang Prabang') || prov.includes('ຫຼວງພະບາງ')) {
        byProvince['ຫຼວງພະບາງ (Luang Prabang)']++;
      } else if (prov.includes('Champasak') || prov.includes('ຈຳປາສັກ')) {
        byProvince['ຈຳປາສັກ (Champasak)']++;
      } else if (prov.includes('Savannakhet') || prov.includes('ສະຫວັນນະເຂດ')) {
        byProvince['ສະຫວັນນະເຂດ (Savannakhet)']++;
      } else {
        byProvince['ອື່ນໆ (Other Provinces)']++;
      }

      // calculate response times from timeline
      const receivedEvt = inc.timeline.find((e) => e.status === 'received');
      const dispatchedEvt = inc.timeline.find((e) => e.status === 'dispatched');
      const arrivedEvt = inc.timeline.find((e) => e.status === 'arrived');

      if (receivedEvt && dispatchedEvt) {
        const diff = Math.max(0, new Date(dispatchedEvt.timestamp).getTime() - new Date(receivedEvt.timestamp).getTime());
        totalDispatchMs += diff;
        dispatchCount++;
      }

      if (receivedEvt && arrivedEvt) {
        const diff = Math.max(0, new Date(arrivedEvt.timestamp).getTime() - new Date(receivedEvt.timestamp).getTime());
        totalResponseTimeMs += diff;
        responseCount++;
      }
    });

    const averageResponseTimeMinutes = responseCount > 0 ? Number((totalResponseTimeMs / responseCount / 60000).toFixed(1)) : 5.8;
    const avgDispatchMinutes = dispatchCount > 0 ? Number((totalDispatchMs / dispatchCount / 60000).toFixed(1)) : 2.3;
    const avgArrivalMinutes = Number((averageResponseTimeMinutes - avgDispatchMinutes).toFixed(1));

    // 24h Hourly trend for today
    const hourlyTrend = [
      { hour: '00:00', count: 1 },
      { hour: '02:00', count: 0 },
      { hour: '04:00', count: 1 },
      { hour: '06:00', count: 2 },
      { hour: '08:00', count: 5 },
      { hour: '10:00', count: 7 },
      { hour: '12:00', count: 6 },
      { hour: '14:00', count: 9 },
      { hour: '16:00', count: 8 },
      { hour: '18:00', count: 11 },
      { hour: '20:00', count: 7 },
      { hour: '22:00', count: 4 },
    ];

    return {
      totalToday,
      activeToday,
      resolvedToday,
      criticalToday,
      averageResponseTimeMinutes,
      avgDispatchMinutes,
      avgArrivalMinutes: Math.max(1, avgArrivalMinutes),
      byType,
      byProvince,
      byStatus,
      hourlyTrend,
    };
  }
}

// ==========================================
// Real HTTP REST Client (Production)
// ==========================================
class HttpApiService implements ApiService {
  private baseUrl = '/api/v1';

  async createIncident(input: CreateIncidentInput): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  }

  async getIncident(id: string): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return res.json();
  }

  async getIncidents(params?: FilterIncidentsParams): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.type) query.set('type', params.type);
    if (params?.province) query.set('province', params.province);

    const res = await fetch(`${this.baseUrl}/incidents?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  }

  async updateIncidentStatus(id: string, status: IncidentStatus, note?: string): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error('Failed to update incident status');
    return res.json();
  }

  async updateIncidentPriority(id: string, priority: IncidentPriority): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/incidents/${id}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    });
    if (!res.ok) throw new Error('Failed to update incident priority');
    return res.json();
  }

  async addIncidentInternalNote(id: string, note: string, authorName?: string): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/incidents/${id}/internal-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, authorName }),
    });
    if (!res.ok) throw new Error('Failed to add internal note');
    return res.json();
  }

  async assignUnit(incidentId: string, unitId: string): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId }),
    });
    if (!res.ok) throw new Error('Failed to assign unit');
    return res.json();
  }

  async getUnits(): Promise<Unit[]> {
    const res = await fetch(`${this.baseUrl}/units`);
    if (!res.ok) throw new Error('Failed to fetch units');
    return res.json();
  }

  async updateUnitLocation(unitId: string, location: LocationCoords): Promise<Unit> {
    const res = await fetch(`${this.baseUrl}/units/${unitId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });
    if (!res.ok) throw new Error('Failed to update unit location');
    return res.json();
  }

  async updateUnitStatus(unitId: string, status: UnitStatus): Promise<Unit> {
    const res = await fetch(`${this.baseUrl}/units/${unitId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update unit status');
    return res.json();
  }

  async getAuditLogs(params?: FilterAuditLogParams): Promise<AuditLogEntry[]> {
    const query = new URLSearchParams();
    if (params?.entityType) query.set('entityType', params.entityType);
    if (params?.action) query.set('action', params.action);
    if (params?.actor) query.set('actor', params.actor);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${this.baseUrl}/audit-logs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }

  async getIncidentStats(): Promise<IncidentStats> {
    const res = await fetch(`${this.baseUrl}/stats`);
    if (!res.ok) throw new Error('Failed to fetch incident stats');
    return res.json();
  }
}

// Single env flag VITE_USE_MOCK=true|false switches mock vs real API
const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
export const api: ApiService = isMock ? new MockApiService() : new HttpApiService();
