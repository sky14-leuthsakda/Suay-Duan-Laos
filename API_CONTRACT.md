# Suay Duan Lao — API & Real-time Contract

Documented specification for the backend REST endpoints and WebSocket real-time events.

## 1. REST Endpoints

### Incidents

- `POST /api/v1/incidents`
  - Body: `{ type: EmergencyType, location: LocationCoords, note?: string, photo?: string, reporterPhone?: string }`
  - Response: `201 Created` with `Incident` object.

- `GET /api/v1/incidents/:id`
  - Response: `200 OK` with `Incident` object.

- `GET /api/v1/incidents`
  - Query: `?status=&priority=&province=&type=&limit=&offset=`
  - Response: `200 OK` with `{ items: Incident[], total: number }`

- `PATCH /api/v1/incidents/:id/status`
  - Body: `{ status: IncidentStatus, note?: string }`
  - Response: `200 OK` with updated `Incident`.

- `PATCH /api/v1/incidents/:id/assign`
  - Body: `{ unitId: string }`
  - Response: `200 OK` with updated `Incident`.

### Units

- `GET /api/v1/units`
  - Query: `?status=&type=`
  - Response: `200 OK` with `Unit[]`.

- `PATCH /api/v1/units/:id/status`
  - Body: `{ status: UnitStatus }`
  - Response: `200 OK` with updated `Unit`.

- `PATCH /api/v1/units/:id/location`
  - Body: `LocationCoords`
  - Response: `200 OK` with updated `Unit`.

### Statistics & Metrics

- `GET /api/v1/stats`
  - Response: `200 OK` with `IncidentStats` object:
    - `totalToday`: number
    - `activeToday`: number
    - `resolvedToday`: number
    - `criticalToday`: number
    - `averageResponseTimeMinutes`: number
    - `avgDispatchMinutes`: number
    - `avgArrivalMinutes`: number
    - `byType`: Record<EmergencyType, number>
    - `byProvince`: Record<string, number>
    - `byStatus`: Record<IncidentStatus, number>
    - `hourlyTrend`: Array<{ hour: string, count: number }>

### Audit Trail

- `GET /api/v1/audit-logs`
  - Query: `?entityType=&action=&actor=&search=&limit=&offset=`
  - Response: `200 OK` with `AuditLogEntry[]`:
    - `id`: string
    - `timestamp`: string (ISO 8601)
    - `actorId`: string
    - `actorName`: string
    - `actorRole`: UserRole ('admin' | 'dispatcher' | 'citizen')
    - `action`: string
    - `entityType`: 'incident' | 'unit' | 'system'
    - `entityId`: string
    - `details`: string
    - `previousValue?`: string
    - `newValue?`: string
    - `ipAddress?`: string

## 2. Real-Time WebSocket Events

WebSocket URL: `/ws/realtime`

### Client Subscriptions
- `subscribe:incident` -> `{ incidentId: string }`
- `subscribe:dispatch` -> `{ channel: 'all' }`

### Server Broadcast Events
- `incident.created` -> `{ incident: Incident }`
- `incident.updated` -> `{ incident: Incident }`
- `incident.status_changed` -> `{ incidentId: string, status: IncidentStatus, timestamp: string }`
- `unit.location_updated` -> `{ unitId: string, location: LocationCoords }`
- `unit.assigned` -> `{ incidentId: string, unitId: string, unit: Unit }`
