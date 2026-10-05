import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { AuditLogEntry, FilterAuditLogParams } from '../../types';
import { Card, Button } from '../../components';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  Filter, 
  User, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers 
} from 'lucide-react';

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: FilterAuditLogParams = {};
      if (selectedEntity !== 'all') {
        params.entityType = selectedEntity as 'incident' | 'unit' | 'system';
      }
      if (selectedAction !== 'all') {
        params.action = selectedAction;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const data = await api.getAuditLogs(params);
      setLogs(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEntity, selectedAction, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.actorRole.toUpperCase()}] ${l.actorName}: ${l.action} -> ${l.details}`
      )
      .join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExportJSON = () => {
    if (logs.length === 0) return;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suay-duan-lao-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'STATUS_CHANGED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
            STATUS CHANGE
          </span>
        );
      case 'UNIT_ASSIGNED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
            UNIT ASSIGNED
          </span>
        );
      case 'PRIORITY_UPDATED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold">
            PRIORITY UPDATED
          </span>
        );
      case 'NOTE_ADDED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
            NOTE ADDED
          </span>
        );
      case 'UNIT_STATUS_CHANGED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
            UNIT STATUS
          </span>
        );
      case 'INCIDENT_CREATED':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            INCIDENT CREATED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
            {action}
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
            Admin
          </span>
        );
      case 'dispatcher':
        return (
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
            Dispatcher
          </span>
        );
      case 'citizen':
        return (
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
            Citizen
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
            System
          </span>
        );
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('lo-LA')} ${d.toLocaleTimeString('lo-LA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })}`;
  };

  return (
    <div className="space-y-4 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400 shrink-0" />
            <span>ບັນທຶກລະບົບ ແລະ ການດຳເນີນງານ (Dispatch Audit Log)</span>
          </h1>
          <p className="text-xs text-slate-400">
            ອັບເດດລ່າສຸດ: {lastRefreshed.toLocaleTimeString('lo-LA')} • ບັນທຶກປະຫວັດການປ່ຽນແປງທັງໝົດໃນລະບົບ (Immutable change log)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>ໂຫຼດໃໝ່ ({logs.length})</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLogs}
            className="text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'ຄັດລອກແລ້ວ' : 'Copy'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
            className="text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="!p-3.5 bg-slate-900 border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ຄົ້ນຫາຊື່ເຈົ້າໜ້າທີ່, ລະຫັດເຫດການ, ລາຍລະອຽດ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Entity Type Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Layers className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">ທຸກເປົ້າໝາຍ (All Entities)</option>
              <option value="incident">ເຫດການ (Incidents)</option>
              <option value="unit">ໜ່ວຍງານ (Units)</option>
              <option value="system">ລະບົບ (System)</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">ທຸກການກະທຳ (All Actions)</option>
              <option value="STATUS_CHANGED">ປ່ຽນສະຖານະ (Status Change)</option>
              <option value="UNIT_ASSIGNED">ມອບໝາຍໜ່ວຍງານ (Assign Unit)</option>
              <option value="PRIORITY_UPDATED">ປັບຄວາມດ່ວນ (Priority Update)</option>
              <option value="NOTE_ADDED">ເພີ່ມບັນທຶກ (Add Note)</option>
              <option value="UNIT_STATUS_CHANGED">ສະຖານະໜ່ວຍງານ (Unit Status)</option>
              <option value="INCIDENT_CREATED">ສ້າງເຫດການ (Incident Created)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Log Entries List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>ກຳລັງໂຫລດບັນທຶກລະບົບ... (Loading audit trail...)</span>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <Card className="!p-12 bg-slate-900 border-slate-800 text-center text-slate-400 text-xs space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <p>ບໍ່ພົບບັນທຶກລະບົບຕາມເງື່ອນໄຂທີ່ຄົ້ນຫາ (No audit logs found)</p>
          </Card>
        ) : (
          logs.map((entry) => (
            <Card
              key={entry.id}
              className="!p-3.5 sm:!p-4 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors space-y-2.5 text-left"
            >
              {/* Top row: Actor, Action badge, and Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {getActionBadge(entry.action)}
                  
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{entry.actorName}</span>
                    {getRoleBadge(entry.actorRole)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimestamp(entry.timestamp)}</span>
                  {entry.ipAddress && (
                    <span className="hidden md:inline px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
                      IP: {entry.ipAddress}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle row: Action details description */}
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed pl-1">
                {entry.details}
              </p>

              {/* Bottom row: Entity tag & Values Diff (if available) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <span className="text-slate-500 uppercase">{entry.entityType}:</span>
                  <span className="font-semibold text-blue-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {entry.entityId}
                  </span>
                </div>

                {(entry.previousValue || entry.newValue) && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    {entry.previousValue && (
                      <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/50 line-through">
                        {entry.previousValue}
                      </span>
                    )}
                    {entry.previousValue && entry.newValue && (
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    )}
                    {entry.newValue && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 font-bold">
                        {entry.newValue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
