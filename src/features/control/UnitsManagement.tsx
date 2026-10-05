import React, { useState, useEffect } from 'react';
import { Unit, UnitType, UnitStatus } from '../../types';
import { api } from '../../services/api';
import { useDispatchStore } from '../../stores/dispatchStore';
import { Card } from '../../components';
import { 
  Search, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Ambulance, 
  Flame, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';

export const UnitsManagement: React.FC = () => {
  const { units, incidents, selectIncident } = useDispatchStore();
  const [unitList, setUnitList] = useState<Unit[]>(units);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<UnitType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null);

  // Sync with store units
  useEffect(() => {
    setUnitList(units);
  }, [units]);

  // Load latest units on mount
  useEffect(() => {
    api.getUnits().then(setUnitList).catch(console.error);
  }, []);

  const handleStatusChange = async (unitId: string, newStatus: UnitStatus) => {
    setUpdatingUnitId(unitId);
    try {
      const updated = await api.updateUnitStatus(unitId, newStatus);
      setUnitList((prev) => prev.map((u) => (u.id === unitId ? updated : u)));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUnitId(null);
    }
  };

  const filteredUnits = unitList.filter((unit) => {
    if (typeFilter !== 'all' && unit.type !== typeFilter) return false;
    if (statusFilter !== 'all' && unit.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = unit.name.toLowerCase().includes(q);
      const matchPlate = unit.plateNumber?.toLowerCase().includes(q);
      const matchPhone = unit.contactNumber.toLowerCase().includes(q);
      if (!matchName && !matchPlate && !matchPhone) return false;
    }
    return true;
  });

  const getUnitIcon = (type: UnitType) => {
    switch (type) {
      case 'ambulance':
        return <Ambulance className="w-5 h-5 text-emerald-400" />;
      case 'fire_truck':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'police':
        return <ShieldAlert className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>ພ້ອມປະຕິບັດການ (Available)</span>
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>ກຳລັງປະຕິບັດໜ້າທີ່ (Busy)</span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 border border-slate-500/30 text-slate-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>ພັກຜ່ອນ/ອອບລາຍ (Offline)</span>
          </span>
        );
    }
  };

  const availableCount = unitList.filter((u) => u.status === 'available').length;
  const busyCount = unitList.filter((u) => u.status === 'busy').length;
  const offlineCount = unitList.filter((u) => u.status === 'offline').length;

  return (
    <div className="space-y-4">
      {/* Top Header & Status Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>ຈັດການໜ່ວຍງານກູ້ໄພ (Response Units Management)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ຕິດຕາມ ແລະ ຄວບຄຸມສະຖານະໜ່ວຍງານລົດພະຍາບານ, ດັບເພີງ, ແລະ ສາຍກວດ 191
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
            {availableCount} Available
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
            {busyCount} Busy
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold">
            {offlineCount} Offline
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search unit name, plate, phone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Unit Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as UnitType | 'all')}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Unit Type: All (ທຸກປະເພດ)</option>
            <option value="ambulance">Ambulance (ລົດກູ້ໄພ/ພະຍາບານ)</option>
            <option value="fire_truck">Fire Truck (ລົດດັບເພີງ)</option>
            <option value="police">Police (ລົດສາຍກວດ 191)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UnitStatus | 'all')}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Status: All (ທຸກສະຖານະ)</option>
            <option value="available">Available (ພ້ອມປະຕິບັດການ)</option>
            <option value="busy">Busy (ກຳລັງປະຕິບັດໜ້າທີ່)</option>
            <option value="offline">Offline (ພັກຜ່ອນ/ອອບລາຍ)</option>
          </select>
        </div>
      </div>

      {/* Units Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredUnits.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            ບໍ່ພົບໜ່ວຍງານທີ່ກົງກັບເງື່ອນໄຂ (No units matching filters)
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const isUpdating = updatingUnitId === unit.id;
            const assignedIncident = incidents.find((i) => i.assignedUnitId === unit.id);

            return (
              <Card
                key={unit.id}
                className="bg-slate-900 border-slate-800 space-y-3 p-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header: Icon, Name, and Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                        {getUnitIcon(unit.type)}
                      </div>
                      <div className="text-left">
                        <h2 className="font-bold text-sm sm:text-base text-white leading-tight">
                          {unit.name}
                        </h2>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          ທະບຽນ: {unit.plateNumber || 'ກກ-0000'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(unit.status)}
                    </div>
                  </div>

                  {/* Position Details */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-tight">
                        {unit.location.address || 'Vientiane Capital'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                      <span>Coordinates:</span>
                      <span>{unit.location.lat.toFixed(4)}, {unit.location.lng.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Active Assignment (if busy) */}
                  {assignedIncident && (
                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs flex items-center justify-between text-blue-300">
                      <span>ມອບໝາຍເຫດ: <strong>#{assignedIncident.trackingCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => selectIncident(assignedIncident.id)}
                        className="flex items-center gap-1 font-bold text-blue-400 hover:underline"
                      >
                        <span>ເບິ່ງເຫດ</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls: Change Status & Direct Call */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs text-slate-400 font-semibold">ປ່ຽນສະຖານະ:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={isUpdating || unit.status === 'available'}
                        onClick={() => handleStatusChange(unit.id, 'available')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          unit.status === 'available'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Available
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating || unit.status === 'busy'}
                        onClick={() => handleStatusChange(unit.id, 'busy')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          unit.status === 'busy'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Busy
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating || unit.status === 'offline'}
                        onClick={() => handleStatusChange(unit.id, 'offline')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          unit.status === 'offline'
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Offline
                      </button>
                    </div>
                  </div>

                  {/* Direct Call Unit Hotline */}
                  <a
                    href={`tel:${unit.contactNumber}`}
                    className="touch-target w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ໂທ: {unit.contactNumber}</span>
                  </a>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
