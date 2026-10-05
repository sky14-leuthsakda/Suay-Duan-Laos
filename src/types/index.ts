export type EmergencyType = 
  | 'fire' 
  | 'medical' 
  | 'accident' 
  | 'crime' 
  | 'flood' 
  | 'other';

export type IncidentStatus = 
  | 'received' 
  | 'acknowledged' 
  | 'dispatched' 
  | 'on_the_way' 
  | 'arrived' 
  | 'resolved' 
  | 'cancelled';

export type IncidentPriority = 
  | 'critical' 
  | 'high' 
  | 'medium' 
  | 'low';

export type UnitType = 
  | 'ambulance' 
  | 'fire_truck' 
  | 'police';

export type UnitStatus = 
  | 'available' 
  | 'busy' 
  | 'offline';

export type UserRole = 
  | 'citizen' 
  | 'dispatcher' 
  | 'admin';

export type ConnectionState = 
  | 'live' 
  | 'reconnecting' 
  | 'offline';

export interface LocationCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  province?: string;
  district?: string;
  village?: string;
}

export interface StatusEvent {
  id: string;
  incidentId: string;
  status: IncidentStatus;
  timestamp: string;
  note?: string;
  actorId?: string;
  actorName?: string;
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  status: UnitStatus;
  location: LocationCoords;
  contactNumber: string;
  plateNumber?: string;
  assignedIncidentId?: string | null;
  etaMinutes?: number;
  updatedAt: string;
}

export interface Incident {
  id: string;
  trackingCode: string;
  type: EmergencyType;
  status: IncidentStatus;
  priority: IncidentPriority;
  location: LocationCoords;
  note?: string;
  photoUrl?: string;
  reporterPhone?: string;
  reporterName?: string;
  assignedUnitId?: string | null;
  assignedUnit?: Unit | null;
  timeline: StatusEvent[];
  internalNotes?: Array<{
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  bloodType?: string;
  allergies?: string;
  medicalNotes?: string;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

export interface CreateIncidentInput {
  type: EmergencyType;
  location: LocationCoords;
  note?: string;
  photoUrl?: string;
  reporterPhone?: string;
  reporterName?: string;
  priority?: IncidentPriority;
}

export interface FilterIncidentsParams {
  status?: IncidentStatus;
  priority?: IncidentPriority;
  type?: EmergencyType;
  province?: string;
  search?: string;
}

export type RealtimeEventType =
  | 'incident.created'
  | 'incident.updated'
  | 'incident.status_changed'
  | 'unit.location_updated'
  | 'unit.assigned';

export interface RealtimeEventPayloads {
  'incident.created': { incident: Incident };
  'incident.updated': { incident: Incident };
  'incident.status_changed': { incidentId: string; status: IncidentStatus; timestamp: string; note?: string };
  'unit.location_updated': { unitId: string; location: LocationCoords; etaMinutes?: number };
  'unit.assigned': { incidentId: string; unitId: string; unit: Unit };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'incident' | 'unit' | 'system';
  entityId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface FilterAuditLogParams {
  actor?: string;
  entityType?: 'incident' | 'unit' | 'system';
  action?: string;
  search?: string;
}

export interface IncidentStats {
  totalToday: number;
  activeToday: number;
  resolvedToday: number;
  criticalToday: number;
  averageResponseTimeMinutes: number;
  avgDispatchMinutes: number;
  avgArrivalMinutes: number;
  byType: Record<EmergencyType, number>;
  byProvince: Record<string, number>;
  byStatus: Record<IncidentStatus, number>;
  hourlyTrend: Array<{ hour: string; count: number }>;
}
