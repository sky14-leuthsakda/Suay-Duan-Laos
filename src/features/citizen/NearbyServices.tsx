import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { NEARBY_FACILITIES, NearbyFacility } from '../../data/nearbyServicesData';
import { useAppStore } from '../../stores/appStore';
import { useTranslation } from '../../i18n';
import {
  Building2,
  Shield,
  Flame,
  MapPin,
  Phone,
  Navigation,
  Search,
  LocateFixed,
} from 'lucide-react';
import { getCurrentLocation, DEFAULT_LAOS_COORDS } from '../../services/location';

// Distance in km (Haversine)
function calcDist(lat: number, lng: number, ulat: number, ulng: number): number {
  const R = 6371;
  const dLat = ((lat - ulat) * Math.PI) / 180;
  const dLng = ((lng - ulng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((ulat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

type FilterType = 'hospital' | 'police' | 'fire';

export const NearbyServices: React.FC = () => {
  const { t } = useTranslation();
  const { dataSaver, language } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [userCoords, setUserCoords] = useState(DEFAULT_LAOS_COORDS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isOfflineCached, setIsOfflineCached] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const listItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Get user location
  useEffect(() => {
    getCurrentLocation()
      .then((res) => {
        if (res.coords) setUserCoords({ lat: res.coords.lat, lng: res.coords.lng });
        else setIsOfflineCached(true);
      })
      .catch(() => setIsOfflineCached(true));
  }, []);

  // Filter facilities
  const filtered = NEARBY_FACILITIES.filter((f) => {
    if (activeFilters.size > 0 && !activeFilters.has(f.type)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return f.nameLo.toLowerCase().includes(q) || f.addressLo.toLowerCase().includes(q) || f.nameEn.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => calcDist(a.lat, a.lng, userCoords.lat, userCoords.lng) - calcDist(b.lat, b.lng, userCoords.lat, userCoords.lng));

  const toggleFilter = (type: FilterType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (dataSaver || !mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [userCoords.lat, userCoords.lng],
      zoom: 13,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OSM',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSaver]);

  // Update markers when filtered list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (dataSaver || !map) return;

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!filtered.find((f) => f.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // User location marker
    const userColor = '#3B82F6';
    if (!markersRef.current.has('user')) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${userColor};border:2px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      const m = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon });
      m.addTo(map);
      markersRef.current.set('user', m);
    }

    filtered.forEach((f) => {
      if (markersRef.current.has(f.id)) return;
      const color = f.type === 'hospital' ? '#DC2626' : f.type === 'fire' ? '#EA580C' : '#2563EB';
      const letter = f.type === 'hospital' ? 'H' : f.type === 'fire' ? 'F' : 'P';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:8px;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:1.5px solid rgba(0,0,0,0.2);box-shadow:0 2px 4px rgba(0,0,0,0.3)">${letter}</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });
      const marker = L.marker([f.lat, f.lng], { icon }).addTo(map);
      marker.on('click', () => {
        setExpandedId(f.id);
        // Scroll list item into view
        const el = listItemRefs.current.get(f.id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      markersRef.current.set(f.id, marker);
    });
  }, [dataSaver, filtered, userCoords]);

  // Map zoom-to when list item expanded
  const handleItemClick = (id: string, lat: number, lng: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
    mapInstanceRef.current?.flyTo([lat, lng], 15, { duration: 0.8 });
  };

  const typeIcon = (type: NearbyFacility['type'], className = 'w-5 h-5') => {
    if (type === 'hospital') return <Building2 className={`${className} text-red-500`} />;
    if (type === 'fire') return <Flame className={`${className} text-orange-500`} />;
    return <Shield className={`${className} text-blue-500`} />;
  };

  const typeCallColor = (type: NearbyFacility['type']) => {
    if (type === 'hospital') return 'bg-red-600 hover:bg-red-500 text-white';
    if (type === 'fire') return 'bg-orange-500 hover:bg-orange-400 text-white';
    return 'bg-blue-600 hover:bg-blue-500 text-white';
  };

  const filterConfig: Array<{ type: FilterType; label: string; letter: string; color: string; active: string }> = [
    { type: 'hospital', label: t('nearby.filterHospital'), letter: 'H', color: 'text-red-500 border-red-200 dark:border-red-900/50', active: 'bg-red-600 text-white border-red-600' },
    { type: 'police', label: t('nearby.filterPolice'), letter: 'P', color: 'text-blue-500 border-blue-200 dark:border-blue-900/50', active: 'bg-blue-600 text-white border-blue-600' },
    { type: 'fire', label: t('nearby.filterFire'), letter: 'F', color: 'text-orange-500 border-orange-200 dark:border-orange-900/50', active: 'bg-orange-500 text-white border-orange-500' },
  ];

  return (
    <div className="citizen-content flex flex-col overflow-hidden">
      {/* ── Search row + filter icon toggles ── */}
      <div className="shrink-0 flex items-center gap-2 px-4 pt-3 pb-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('nearby.searchPlaceholder')}
            className="w-full h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 text-[14px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </div>
        {/* Icon-only filter toggles */}
        {filterConfig.map((fc) => {
          const isActive = activeFilters.has(fc.type);
          return (
            <button
              key={fc.type}
              type="button"
              aria-label={fc.label}
              aria-pressed={isActive}
              onClick={() => toggleFilter(fc.type)}
              title={fc.label}
              className={`touch-icon w-11 h-11 rounded-xl border-2 font-bold text-[14px] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shrink-0 ${
                isActive ? fc.active : `bg-slate-50 dark:bg-slate-800 ${fc.color}`
              }`}
            >
              {fc.letter}
            </button>
          );
        })}
      </div>

      {/* Offline cache notice */}
      {isOfflineCached && (
        <div className="shrink-0 mx-4 mb-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-[12px] font-semibold flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{t('nearby.offlineCache')}</span>
        </div>
      )}

      {/* ── Map (~40% height) ── */}
      {!dataSaver && (
        <div className="shrink-0 mx-4 mb-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative" style={{ height: '38%', minHeight: '160px', maxHeight: '240px' }}>
          <div ref={mapContainerRef} className="w-full h-full" />
          {/* Recenter button */}
          <button
            type="button"
            aria-label={t('nearby.myLocation')}
            onClick={() => mapInstanceRef.current?.flyTo([userCoords.lat, userCoords.lng], 13)}
            className="absolute bottom-2 right-2 touch-icon w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Scrollable facility list ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-2">
        {filtered.length === 0 && (
          <div className="py-8 text-center text-[14px] text-slate-400">
            ບໍ່ພົບສະຖານທີ່ທີ່ຄ້ນຫາ
          </div>
        )}
        {filtered.map((f) => {
          const dist = calcDist(f.lat, f.lng, userCoords.lat, userCoords.lng);
          const isExpanded = expandedId === f.id;
          const callColor = typeCallColor(f.type);

          return (
            <div
              key={f.id}
              ref={(el) => { if (el) listItemRefs.current.set(f.id, el); }}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60'
              }`}
            >
              {/* Compact row — always visible */}
              <button
                type="button"
                onClick={() => handleItemClick(f.id, f.lat, f.lng)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 rounded-xl"
                style={{ minHeight: '64px' }}
              >
                {/* Type icon */}
                <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  {typeIcon(f.type)}
                </div>
                {/* Name + address */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight truncate">
                    {language === 'lo' ? f.nameLo : f.nameEn}
                  </p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5">
                    {f.addressLo}
                  </p>
                </div>
                {/* Distance + action buttons */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
                    {dist} ກມ.
                  </span>
                  {/* Call button */}
                  <a
                    href={`tel:${f.phone}`}
                    aria-label={`${t('nearby.call')} ${f.nameLo}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`touch-icon w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${callColor}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  {/* Directions */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t('nearby.directions')} ${f.nameLo}`}
                    onClick={(e) => e.stopPropagation()}
                    className="touch-icon w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition-all"
                  >
                    <Navigation className="w-4 h-4" />
                  </a>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[13px] space-y-1.5">
                  <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{f.addressLo}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${f.phone}`} className="font-mono font-semibold hover:underline">{f.phone}</a>
                  </div>
                  {!f.open24h && (
                    <p className="text-slate-400">ເວລາລັດຖະການ</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
