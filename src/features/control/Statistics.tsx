import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { IncidentStats, EmergencyType, IncidentStatus } from '../../types';
import { Card, Button } from '../../components';
import { 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  HeartPulse, 
  Car, 
  ShieldAlert, 
  Waves, 
  HelpCircle, 
  RefreshCw, 
  MapPin, 
  Download, 
  Copy, 
  Check, 
  Activity, 
  ArrowUpRight 
} from 'lucide-react';

export const Statistics: React.FC = () => {
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getIncidentStats();
      setStats(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh stats every 15 seconds
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleCopySummary = () => {
    if (!stats) return;
    const summary = `=== ລາຍງານສະຖິຕິ ຊ່ວຍດ່ວນ ລາວ (Suay Duan Lao Report) ===
ວັນທີ: ${lastRefreshed.toLocaleDateString('lo-LA')} ${lastRefreshed.toLocaleTimeString('lo-LA')}
ເຫດການທັງໝົດມື້ນີ້: ${stats.totalToday} ເຫດ
ກຳລັງດຳເນີນການ: ${stats.activeToday} ເຫດ
ແກ້ໄຂສຳເລັດ: ${stats.resolvedToday} ເຫດ
ວິກິດສູງສຸດ (Critical): ${stats.criticalToday} ເຫດ
ເວລາຕອບສະໜອງສະເລ່ຍ: ${stats.averageResponseTimeMinutes} ນາທີ (ສັ່ງການ: ${stats.avgDispatchMinutes}m, ເດີນທາງ: ${stats.avgArrivalMinutes}m)
`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExportJSON = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suay-duan-lao-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: EmergencyType) => {
    switch (type) {
      case 'fire':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'medical':
        return <HeartPulse className="w-4 h-4 text-red-500" />;
      case 'accident':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'crime':
        return <ShieldAlert className="w-4 h-4 text-blue-500" />;
      case 'flood':
        return <Waves className="w-4 h-4 text-cyan-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: EmergencyType): string => {
    switch (type) {
      case 'fire':
        return 'ໄຟໄໝ້ (Fire)';
      case 'medical':
        return 'ເຈັບປ່ວຍສຸກເສີນ (Medical)';
      case 'accident':
        return 'ອຸບັດຕິເຫດ (Accident)';
      case 'crime':
        return 'ເຫດດ່ວນເຫດຮ້າຍ (Crime)';
      case 'flood':
        return 'ໄພພິບັດ/ນ້ຳຖ້ວມ (Flood)';
      default:
        return 'ອື່ນໆ (Other)';
    }
  };

  const getStatusLabel = (status: IncidentStatus): string => {
    switch (status) {
      case 'received':
        return 'ໄດ້ຮັບແຈ້ງ (Received)';
      case 'acknowledged':
        return 'ຮັບຊາບແລ້ວ (Acknowledged)';
      case 'dispatched':
        return 'ສັ່ງການແລ້ວ (Dispatched)';
      case 'on_the_way':
        return 'ກຳລັງເດີນທາງ (On the way)';
      case 'arrived':
        return 'ຮອດຈຸດເກີດເຫດ (Arrived)';
      case 'resolved':
        return 'ແກ້ໄຂສຳເລັດ (Resolved)';
      case 'cancelled':
        return 'ຍົກເລີກ (Cancelled)';
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>ກຳລັງປະມວນຜົນສະຖິຕິ... (Loading statistics...)</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Max value for hourly trend scaling
  const maxHourlyCount = Math.max(...stats.hourlyTrend.map((h) => h.count), 1);

  return (
    <div className="space-y-4 text-left">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500 shrink-0" />
            <span>ສະຖິຕິການກູ້ໄພ ແລະ ປະຕິບັດງານ (Operational Statistics)</span>
          </h1>
          <p className="text-xs text-slate-400">
            ອັບເດດສົດລ່າສຸດ: {lastRefreshed.toLocaleTimeString('lo-LA')} • ປະເມີນຜົນທົ່ວປະເທດລາວ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchStats}
            disabled={isLoading}
            className="text-xs gap-1.5"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>ໂຫຼດໃໝ່ (Refresh)</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopySummary}
            className="text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'ຄັດລອກແລ້ວ!' : 'ຄັດລອກບົດສະຫຼຸບ'}</span>
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

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Today */}
        <Card className="!p-4 bg-slate-900 border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ເຫດການມື້ນີ້ (Total)</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalToday}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold flex items-center">
              +12% <ArrowUpRight className="w-3 h-3" />
            </span>
            <span>ທຽບກັບມື້ວານ</span>
          </div>
        </Card>

        {/* Active Currently */}
        <Card className="!p-4 bg-slate-900 border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ກຳລັງດຳເນີນການ (Active)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-500">{stats.activeToday}</div>
          <span className="text-[11px] text-slate-400 font-medium">
            {stats.criticalToday} ເຫດດ່ວນວິກິດສູງ
          </span>
        </Card>

        {/* Resolved Today */}
        <Card className="!p-4 bg-slate-900 border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ແກ້ໄຂສຳເລັດ (Resolved)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.resolvedToday}</div>
          <span className="text-[11px] text-slate-400 font-medium">
            {stats.totalToday > 0 ? Math.round((stats.resolvedToday / stats.totalToday) * 100) : 0}% ອັດຕາສຳເລັດ
          </span>
        </Card>

        {/* Average Response Time */}
        <Card className="!p-4 bg-slate-900 border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ເວລາຕອບສະໜອງສະເລ່ຍ</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {stats.averageResponseTimeMinutes}
            <span className="text-sm font-normal text-slate-400 ml-1">min</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            ເວລາຮອດຈຸດເກີດເຫດ
          </span>
        </Card>

        {/* Avg Dispatch Time */}
        <Card className="!p-4 bg-slate-900 border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ເວລາສັ່ງການ (Dispatch)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400">
            {stats.avgDispatchMinutes}
            <span className="text-sm font-normal text-slate-400 ml-1">min</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            ຈາກຮັບແຈ້ງຫາສັ່ງການ
          </span>
        </Card>
      </div>

      {/* Hourly Incident Trend (Pure SVG / CSS Bar Chart) */}
      <Card className="!p-4 sm:!p-5 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>ແນວໂນ້ມເຫດການຕາມຊ່ວງເວລາ 24 ຊົ່ວໂມງ (Today's Hourly Trend)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">24H Breakdown</span>
        </div>

        {/* Bar chart grid */}
        <div className="h-44 sm:h-52 flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
          {stats.hourlyTrend.map((item, idx) => {
            const heightPercent = Math.max(8, Math.round((item.count / maxHourlyCount) * 100));
            const isPeak = item.count === maxHourlyCount && item.count > 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Count badge on hover or peak */}
                <span
                  className={`text-[10px] font-mono transition-opacity ${
                    isPeak
                      ? 'text-rose-400 font-bold opacity-100'
                      : 'text-slate-400 opacity-60 group-hover:opacity-100'
                  }`}
                >
                  {item.count}
                </span>

                {/* Animated bar column */}
                <div className="w-full max-w-[32px] bg-slate-800/80 rounded-t-lg overflow-hidden flex items-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125 ${
                      isPeak
                        ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-md shadow-rose-900/40'
                        : 'bg-gradient-to-t from-blue-700 to-blue-500'
                    }`}
                  />
                </div>

                {/* Hour label */}
                <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                  {item.hour}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mid Grid: By Emergency Type (Left) & By Province (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Emergency Type */}
        <Card className="!p-4 sm:!p-5 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ຈຳແນກຕາມປະເພດເຫດການ (By Emergency Type)
            </span>
            <span className="text-xs font-mono text-slate-500">
              {stats.totalToday} ເຫດການ
            </span>
          </div>

          <div className="space-y-3">
            {(Object.keys(stats.byType) as EmergencyType[]).map((type) => {
              const count = stats.byType[type] || 0;
              const percent = stats.totalToday > 0 ? Math.round((count / stats.totalToday) * 100) : 0;

              return (
                <div key={type} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <span className="font-semibold text-slate-200">{getTypeLabel(type)}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white">{count}</span>
                      <span className="text-[11px] text-slate-500">({percent}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        type === 'fire'
                          ? 'bg-orange-500'
                          : type === 'medical'
                          ? 'bg-red-500'
                          : type === 'accident'
                          ? 'bg-amber-500'
                          : type === 'crime'
                          ? 'bg-blue-500'
                          : type === 'flood'
                          ? 'bg-cyan-500'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* By Province Breakdown */}
        <Card className="!p-4 sm:!p-5 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ຈຳແນກຕາມແຂວງ / ພາກພື້ນ (By Province)
            </span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-3">
            {Object.entries(stats.byProvince).map(([provinceName, count]) => {
              const percent = stats.totalToday > 0 ? Math.round((count / stats.totalToday) * 100) : 0;

              return (
                <div key={provinceName} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{provinceName}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white">{count}</span>
                      <span className="text-[11px] text-slate-500">({percent}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Incident Status Funnel / Pipeline */}
      <Card className="!p-4 sm:!p-5 bg-slate-900 border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            ຂັ້ນຕອນການປະຕິບັດງານ (Incident Lifecycle Pipeline)
          </span>
          <span className="text-xs font-mono text-slate-500">Real-time counts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {(Object.keys(stats.byStatus) as IncidentStatus[]).map((status) => {
            const count = stats.byStatus[status] || 0;

            return (
              <div
                key={status}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1"
              >
                <span className="text-[10px] text-slate-400 font-medium leading-tight">
                  {getStatusLabel(status).split(' ')[0]}
                </span>
                <span className="text-lg font-black text-white font-mono">{count}</span>
                <span className="text-[9px] text-slate-500 uppercase">{status}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
