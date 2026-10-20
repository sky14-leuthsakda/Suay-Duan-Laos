import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Incident, Unit } from '../../types';
import { Crosshair, ChevronRight, Navigation2 } from 'lucide-react';

interface CitizenLiveMapProps {
  incident: Incident;
  assignedUnit?: Unit | null;
  onShowDetails: () => void;
  className?: string;
}

export const CitizenLiveMap: React.FC<CitizenLiveMapProps> = ({
  incident,
  assignedUnit,
  onShowDetails,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const incidentMarkerRef = useRef<L.Marker | null>(null);
  const unitMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const lat = incident.location?.lat || 17.9712;
    const lng = incident.location?.lng || 102.6174;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Invalidate size to ensure tiles render immediately
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Incident Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !incident.location) return;

    const { lat, lng } = incident.location;

    if (incidentMarkerRef.current) {
      incidentMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const html = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping"></div>
          <div class="w-9 h-9 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-sm">
            SOS
          </div>
        </div>
      `;
      const icon = L.divIcon({
        className: 'citizen-incident-marker',
        html,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      incidentMarkerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    }
  }, [incident.location]);

  // Update Unit Marker and Connecting Line
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!assignedUnit || !assignedUnit.location) {
      if (unitMarkerRef.current) {
        unitMarkerRef.current.remove();
        unitMarkerRef.current = null;
      }
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      return;
    }

    const unitLat = assignedUnit.location.lat;
    const unitLng = assignedUnit.location.lng;
    const incLat = incident.location?.lat || 17.9712;
    const incLng = incident.location?.lng || 102.6174;

    const unitColor = assignedUnit.type === 'ambulance' ? 'bg-emerald-600' : assignedUnit.type === 'fire_truck' ? 'bg-orange-600' : 'bg-blue-600';
    const unitLabel = assignedUnit.type === 'ambulance' ? 'AMB' : assignedUnit.type === 'fire_truck' ? 'FIR' : 'POL';

    const unitHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-xl ${unitColor} border-2 border-white shadow-xl flex items-center justify-center text-white font-mono font-bold text-[11px]">
          ${unitLabel}
        </div>
        <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-pulse"></span>
      </div>
    `;

    const unitIcon = L.divIcon({
      className: 'citizen-unit-marker',
      html: unitHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (unitMarkerRef.current) {
      unitMarkerRef.current.setLatLng([unitLat, unitLng]);
    } else {
      unitMarkerRef.current = L.marker([unitLat, unitLng], { icon: unitIcon }).addTo(map);
    }

    // Polyline connecting unit to incident
    if (polylineRef.current) {
      polylineRef.current.setLatLngs([
        [unitLat, unitLng],
        [incLat, incLng],
      ]);
    } else {
      polylineRef.current = L.polyline(
        [
          [unitLat, unitLng],
          [incLat, incLng],
        ],
        {
          color: '#e11d48',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.85,
        }
      ).addTo(map);
    }

    // Auto-fit bounds when unit is assigned
    try {
      const bounds = L.latLngBounds([
        [unitLat, unitLng],
        [incLat, incLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } catch {
      // Ignore if coordinates are identical
    }
  }, [assignedUnit, incident.location]);

  const handleCenter = () => {
    if (!mapRef.current) return;
    if (assignedUnit?.location && incident.location) {
      const bounds = L.latLngBounds([
        [assignedUnit.location.lat, assignedUnit.location.lng],
        [incident.location.lat, incident.location.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (incident.location) {
      mapRef.current.setView([incident.location.lat, incident.location.lng], 15, { animate: true });
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[220px] bg-slate-100 dark:bg-slate-800 ${className}`}>
      {/* Leaflet DOM container */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Top Overlay Indicator */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" aria-hidden="true" />
          <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-none">
            {assignedUnit ? assignedUnit.name : 'ກຳລັງປະສານງານໜ່ວຍກູ້ໄພ'}
          </span>
        </div>
      </div>

      {/* Top Right Tool Buttons */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleCenter}
          aria-label="Center map"
          className="touch-icon w-9 h-9 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Right Details Button */}
      <button
        type="button"
        onClick={onShowDetails}
        className="absolute bottom-2.5 right-2.5 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-[12px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 hover:bg-white dark:hover:bg-slate-900 transition-colors"
      >
        <span>ລາຍລະອຽດ</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* ETA overlay if unit moving */}
      {assignedUnit?.etaMinutes && (
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white shadow-md flex items-center gap-1.5">
          <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[12px] font-bold">
            ໄລຍະທາງປະມານ: ~{Math.round(assignedUnit.etaMinutes)} ນາທີ
          </span>
        </div>
      )}
    </div>
  );
};
