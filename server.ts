import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import {
  Incident,
  Unit,
  AuditLogEntry,
  CreateIncidentInput,
  IncidentStatus,
  IncidentPriority,
  EmergencyType,
  LocationCoords,
  UnitStatus,
  IncidentStats,
} from './src/types';
import { SEED_INCIDENTS, SEED_UNITS, SEED_AUDIT_LOGS } from './src/services/mock/seedData';

const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Database with JSON file persistence
interface DatabaseSchema {
  incidents: Incident[];
  units: Unit[];
  auditLogs: AuditLogEntry[];
}

let db: DatabaseSchema = {
  incidents: [...SEED_INCIDENTS],
  units: [...SEED_UNITS],
  auditLogs: [...SEED_AUDIT_LOGS],
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.incidents && parsed.units) {
        db = parsed;
        console.log('[Server] Loaded database from file with', db.incidents.length, 'incidents and', db.units.length, 'units');
        return;
      }
    }
  } catch (err) {
    console.warn('[Server] Could not read db.json, using seed defaults:', err);
  }
  saveDatabase();
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to save db.json:', err);
  }
}

loadDatabase();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// ─── WebSocket Server ──────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws/realtime' });

interface ClientMeta {
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>;
}

const clients = new Map<WebSocket, ClientMeta>();

wss.on('connection', (ws) => {
  const meta: ClientMeta = {
    ws,
    isAlive: true,
    subscriptions: new Set(),
  };
  clients.set(ws, meta);

  ws.on('pong', () => {
    meta.isAlive = true;
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.action === 'subscribe:incident' && msg.incidentId) {
        meta.subscriptions.add(`incident:${msg.incidentId}`);
      } else if (msg.action === 'unsubscribe:incident' && msg.incidentId) {
        meta.subscriptions.delete(`incident:${msg.incidentId}`);
      } else if (msg.action === 'subscribe:dispatch') {
        meta.subscriptions.add('dispatch');
      } else if (msg.action === 'unsubscribe:dispatch') {
        meta.subscriptions.delete('dispatch');
      }
    } catch {
      // Ignore invalid JSON
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Periodic ping to keep WebSockets alive through VPS reverse proxies (Nginx/Cloudflare)
const pingInterval = setInterval(() => {
  clients.forEach((meta, ws) => {
    if (!meta.isAlive) {
      clients.delete(ws);
      return ws.terminate();
    }
    meta.isAlive = false;
    ws.ping();
  });
}, 25000);

wss.on('close', () => clearInterval(pingInterval));

export function broadcastEvent(type: string, payload: unknown, targetChannel?: string) {
  const message = JSON.stringify({ type, payload });
  clients.forEach((meta, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      if (!targetChannel || meta.subscriptions.has(targetChannel) || meta.subscriptions.has('dispatch')) {
        ws.send(message);
      }
    }
  });
}

function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const log: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 300) {
    db.auditLogs = db.auditLogs.slice(0, 300);
  }
  saveDatabase();
}

// ─── REST API Routes ──────────────────────────────────────────────────────────

// Health Check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), clientsCount: clients.size });
});

// Create Incident
app.post('/api/v1/incidents', (req: Request, res: Response) => {
  const input: CreateIncidentInput = req.body;
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

  db.incidents.unshift(newIncident);
  addAuditLog({
    actorId: 'citizen',
    actorName: input.reporterName || 'ພົນລະເມືອງ (Citizen)',
    actorRole: 'citizen',
    action: 'INCIDENT_CREATED',
    entityType: 'incident',
    entityId: id,
    details: `ສ້າງເຫດສຸກເສີນໃໝ່ ${trackingCode} ປະເພດ ${input.type}`,
    newValue: 'received',
  });
  saveDatabase();

  // Broadcast in real-time to dispatchers & listeners
  broadcastEvent('incident.created', { incident: newIncident });

  res.status(201).json(newIncident);
});

// Get Incidents (with filters)
app.get('/api/v1/incidents', (req: Request, res: Response) => {
  let list = [...db.incidents];
  const { status, priority, type, province, search } = req.query;

  if (status && status !== 'all') {
    list = list.filter((i) => i.status === status);
  }
  if (priority && priority !== 'all') {
    list = list.filter((i) => i.priority === priority);
  }
  if (type && type !== 'all') {
    list = list.filter((i) => i.type === type);
  }
  if (province && province !== 'all') {
    list = list.filter((i) => i.location.province === province);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (i) =>
        i.trackingCode.toLowerCase().includes(q) ||
        i.note?.toLowerCase().includes(q) ||
        i.location.address?.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

// Get Incident by ID
app.get('/api/v1/incidents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const incident = db.incidents.find((i) => i.id === id || i.trackingCode === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// Update Incident Status
app.patch('/api/v1/incidents/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note }: { status: IncidentStatus; note?: string } = req.body;

  const incident = db.incidents.find((i) => i.id === id || i.trackingCode === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const prevStatus = incident.status;
  const now = new Date().toISOString();

  incident.status = status;
  incident.updatedAt = now;
  incident.timeline.push({
    id: `evt-${Date.now()}`,
    incidentId: incident.id,
    status,
    timestamp: now,
    note: note || `ສະຖານະປ່ຽນເປັນ: ${status}`,
  });

  addAuditLog({
    actorId: 'dispatcher',
    actorName: 'ສູນສັ່ງການ (Central Dispatch)',
    actorRole: 'dispatcher',
    action: 'STATUS_CHANGED',
    entityType: 'incident',
    entityId: incident.id,
    details: `ປ່ຽນສະຖານະເຫດການ ${incident.trackingCode} ເປັນ "${status}"`,
    previousValue: prevStatus,
    newValue: status,
  });
  saveDatabase();

  broadcastEvent('incident.status_changed', {
    incidentId: incident.id,
    status,
    timestamp: now,
    note: note || `ສະຖານະປ່ຽນເປັນ: ${status}`,
  });
  broadcastEvent('incident.updated', { incident });

  res.json(incident);
});

// Update Incident Priority
app.patch('/api/v1/incidents/:id/priority', (req: Request, res: Response) => {
  const { id } = req.params;
  const { priority }: { priority: IncidentPriority } = req.body;

  const incident = db.incidents.find((i) => i.id === id || i.trackingCode === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const prevPriority = incident.priority;
  incident.priority = priority;
  incident.updatedAt = new Date().toISOString();

  addAuditLog({
    actorId: 'dispatcher',
    actorName: 'ສູນສັ່ງການ (Central Dispatch)',
    actorRole: 'dispatcher',
    action: 'PRIORITY_UPDATED',
    entityType: 'incident',
    entityId: incident.id,
    details: `ປ່ຽນລະດັບຄວາມຮີບດ່ວນເຫດການ ${incident.trackingCode} ເປັນ "${priority}"`,
    previousValue: prevPriority,
    newValue: priority,
  });
  saveDatabase();

  broadcastEvent('incident.updated', { incident });
  res.json(incident);
});

// Add Internal Note
app.post('/api/v1/incidents/:id/internal-notes', (req: Request, res: Response) => {
  const { id } = req.params;
  const { note, authorName }: { note: string; authorName?: string } = req.body;

  const incident = db.incidents.find((i) => i.id === id || i.trackingCode === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const now = new Date().toISOString();
  if (!incident.internalNotes) {
    incident.internalNotes = [];
  }
  incident.internalNotes.push({
    id: `note-${Date.now()}`,
    text: note,
    author: authorName || 'Dispatcher',
    createdAt: now,
  });
  incident.updatedAt = now;

  addAuditLog({
    actorId: 'dispatcher',
    actorName: authorName || 'Dispatcher',
    actorRole: 'dispatcher',
    action: 'NOTE_ADDED',
    entityType: 'incident',
    entityId: incident.id,
    details: `ເພີ່ມບັນທຶກພາຍໃນໃສ່ເຫດການ ${incident.trackingCode}: ${note}`,
    newValue: note,
  });
  saveDatabase();

  broadcastEvent('incident.updated', { incident });
  res.json(incident);
});

// Assign Unit to Incident
app.patch('/api/v1/incidents/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { unitId }: { unitId: string } = req.body;

  const incident = db.incidents.find((i) => i.id === id || i.trackingCode === id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const unit = db.units.find((u) => u.id === unitId);
  if (!unit) return res.status(404).json({ error: 'Unit not found' });

  const prevAssigned = incident.assignedUnitId || 'none';
  const now = new Date().toISOString();

  unit.status = 'busy';
  unit.assignedIncidentId = incident.id;
  unit.updatedAt = now;

  incident.assignedUnitId = unit.id;
  incident.assignedUnit = unit;
  incident.status = 'dispatched';
  incident.updatedAt = now;
  incident.timeline.push({
    id: `evt-${Date.now()}`,
    incidentId: incident.id,
    status: 'dispatched',
    timestamp: now,
    note: `ສັ່ງການໜ່ວຍງານ: ${unit.name}`,
  });

  addAuditLog({
    actorId: 'dispatcher',
    actorName: 'ສູນສັ່ງການ (Central Dispatch)',
    actorRole: 'dispatcher',
    action: 'UNIT_ASSIGNED',
    entityType: 'incident',
    entityId: incident.id,
    details: `ມອບໝາຍໜ່ວຍງານ "${unit.name}" ໃຫ້ເຫດການ ${incident.trackingCode}`,
    previousValue: prevAssigned,
    newValue: unitId,
  });
  saveDatabase();

  broadcastEvent('unit.assigned', {
    incidentId: incident.id,
    unitId: unit.id,
    unit,
  });
  broadcastEvent('incident.status_changed', {
    incidentId: incident.id,
    status: 'dispatched',
    timestamp: now,
    note: `ສັ່ງການໜ່ວຍງານ: ${unit.name}`,
  });
  broadcastEvent('incident.updated', { incident });

  res.json(incident);
});

// Get Units
app.get('/api/v1/units', (_req: Request, res: Response) => {
  res.json(db.units);
});

// Update Unit Location
app.patch('/api/v1/units/:id/location', (req: Request, res: Response) => {
  const { id } = req.params;
  const location: LocationCoords = req.body;

  const unit = db.units.find((u) => u.id === id);
  if (!unit) return res.status(404).json({ error: 'Unit not found' });

  unit.location = location;
  unit.updatedAt = new Date().toISOString();
  saveDatabase();

  broadcastEvent('unit.location_updated', {
    unitId: unit.id,
    location,
    etaMinutes: unit.etaMinutes,
  });

  res.json(unit);
});

// Update Unit Status
app.patch('/api/v1/units/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status }: { status: UnitStatus } = req.body;

  const unit = db.units.find((u) => u.id === id);
  if (!unit) return res.status(404).json({ error: 'Unit not found' });

  const prevStatus = unit.status;
  unit.status = status;
  if (status === 'available') {
    unit.assignedIncidentId = null;
  }
  unit.updatedAt = new Date().toISOString();

  addAuditLog({
    actorId: 'dispatcher',
    actorName: 'ສູນສັ່ງການ (Central Dispatch)',
    actorRole: 'dispatcher',
    action: 'UNIT_STATUS_CHANGED',
    entityType: 'unit',
    entityId: unit.id,
    details: `ປ່ຽນສະຖານະໜ່ວຍງານ "${unit.name}" ເປັນ "${status}"`,
    previousValue: prevStatus,
    newValue: status,
  });
  saveDatabase();

  broadcastEvent('unit.status_changed', { unitId: unit.id, status });
  res.json(unit);
});

// Get Incident Stats
app.get('/api/v1/stats', (_req: Request, res: Response) => {
  const incidents = db.incidents;

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

  incidents.forEach((inc) => {
    if (byType[inc.type] !== undefined) byType[inc.type]++;
    else byType.other++;

    if (byStatus[inc.status] !== undefined) byStatus[inc.status]++;

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
  });

  const stats: IncidentStats = {
    totalToday,
    activeToday,
    resolvedToday,
    criticalToday,
    averageResponseTimeMinutes: 5.4,
    avgDispatchMinutes: 2.1,
    avgArrivalMinutes: 3.3,
    byType,
    byProvince,
    byStatus,
    hourlyTrend: [
      { hour: '00:00', count: 1 },
      { hour: '04:00', count: 1 },
      { hour: '08:00', count: 5 },
      { hour: '12:00', count: 6 },
      { hour: '16:00', count: 8 },
      { hour: '20:00', count: 7 },
    ],
  };

  res.json(stats);
});

// Get Audit Logs
app.get('/api/v1/audit-logs', (_req: Request, res: Response) => {
  res.json(db.auditLogs);
});

// ─── Frontend Serving (Dev vs Production) ─────────────────────────────────────
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Server] Serving static files from', distPath);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Suay Duan Lao] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
