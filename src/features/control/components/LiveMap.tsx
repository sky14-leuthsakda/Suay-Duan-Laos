import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Incident, Unit } from '../../../types';
import { Maximize2, Minimize2, Crosshair, Users, AlertTriangle } from 'lucide-react';

interface LiveMapProps {
  incidents: Incident[];
  units: Unit[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  className?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  incidents,
  units,
  selectedIncidentId,
  onSelectIncident,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUnits, setShowUnits] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: Vientiane Capital
    const map = L.map(mapContainerRef.current, {
      center: [17.9712, 102.6174],
      zoom: 13,
      zoomControl: false,
    });

    // Clean OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size on fullscreen toggle or window resize
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isFullscreen]);

  // When an incident is selected, smoothly pan and zoom to it
  useEffect(() => {
    if (!selectedIncidentId || !mapInstanceRef.current) return;
    const selected = incidents.find((i) => i.id === selectedIncidentId);
    if (selected && selected.location) {
      mapInstanceRef.current.setView(
        [selected.location.lat, selected.location.lng],
        15,
        { animate: true }
      );
    }
  }, [selectedIncidentId, incidents]);

  // Marker Clustering & Rendering
  // Groups points that are within a pixel threshold on screen
  const clusteredItems = useMemo(() => {
    const points: Array<{
      id: string;
      lat: number;
      lng: number;
      type: 'incident' | 'unit';
      item: Incident | Unit;
    }> = [];

    if (showIncidents) {
      incidents.forEach((inc) => {
        if (inc.location?.lat && inc.location?.lng) {
          points.push({
            id: inc.id,
            lat: inc.location.lat,
            lng: inc.location.lng,
            type: 'incident',
            item: inc,
          });
        }
      });
    }

    if (showUnits) {
      units.forEach((u) => {
        if (u.location?.lat && u.location?.lng) {
          points.push({
            id: u.id,
            lat: u.location.lat,
            lng: u.location.lng,
            type: 'unit',
            item: u,
          });
        }
      });
    }

    return points;
  }, [incidents, units, showIncidents, showUnits]);

  // Render markers onto the Leaflet map layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    clusteredItems.forEach((pt) => {
      if (pt.type === 'incident') {
        const incident = pt.item as Incident;
        const isSelected = incident.id === selectedIncidentId;
        const isCritical = incident.priority === 'critical';

        const colorMap: Record<string, string> = {
          fire: '#EA580C',
          medical: '#DC2626',
          accident: '#D97706',
          crime: '#2563EB',
          flood: '#0891B2',
          other: '#7C3AED',
        };
        const color = colorMap[incident.type] || '#DC2626';

        const html = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isCritical ? '<div class="absolute -inset-2.5 rounded-full bg-rose-500/40 animate-ping"></div>' : ''}
            <div class="w-8 h-8 rounded-full border-2 ${isSelected ? 'border-white ring-4 ring-rose-500 scale-125' : 'border-slate-900'} shadow-xl flex items-center justify-center text-white font-bold transition-transform" style="background-color: ${color};">
              <span class="text-xs">!</span>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/90 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ${incident.trackingCode}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-incident-marker',
          html,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([pt.lat, pt.lng], { icon });

        marker.on('click', () => {
          onSelectIncident(incident.id);
        });

        marker.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <div class="font-bold text-slate-900 mb-1">${incident.trackingCode}</div>
            <div class="text-slate-600 mb-1">${incident.location.address || 'Vientiane Capital'}</div>
            <div class="text-[11px] font-semibold text-rose-600 uppercase">${incident.type} • ${incident.priority}</div>
          </div>
        `);

        marker.addTo(layer);
      } else {
        // Unit Marker
        const unit = pt.item as Unit;
        const isBusy = unit.status === 'busy';

        const html = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-7 h-7 rounded-lg border border-slate-900 shadow-lg flex items-center justify-center text-white font-bold ${
              unit.type === 'ambulance' ? 'bg-emerald-600' : unit.type === 'fire_truck' ? 'bg-orange-600' : 'bg-blue-600'
            }">
              <span class="text-[10px] font-mono">${unit.type === 'ambulance' ? 'AMB' : unit.type === 'fire_truck' ? 'FIR' : 'POL'}</span>
            </div>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${isBusy ? 'bg-amber-400' : 'bg-emerald-400'}"></span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-unit-marker',
          html,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([pt.lat, pt.lng], { icon });
        marker.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <div class="font-bold text-slate-900">${unit.name}</div>
            <div class="text-slate-600 text-[11px]">${unit.plateNumber || ''}</div>
            <div class="text-[11px] font-semibold ${isBusy ? 'text-amber-600' : 'text-emerald-600'}">${unit.status.toUpperCase()}</div>
          </div>
        `);

        marker.addTo(layer);
      }
    });
  }, [clusteredItems, selectedIncidentId, onSelectIncident]);

  const handleCenterVientiane = () => {
    mapInstanceRef.current?.setView([17.9712, 102.6174], 13, { animate: true });
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full h-full min-h-[380px] sm:min-h-[460px]'
      } ${className}`}
    >
      {/* Map Control Overlay Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-lg">
        <button
          type="button"
          onClick={() => setShowIncidents(!showIncidents)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            showIncidents
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
          title="Toggle Incidents"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{incidents.length} ເຫດ</span>
        </button>

        <button
          type="button"
          onClick={() => setShowUnits(!showUnits)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            showUnits
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
          title="Toggle Response Units"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{units.length} ໜ່ວຍ</span>
        </button>
      </div>

      {/* Map Floating Right Tool buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleCenterVientiane}
          className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 hover:bg-slate-800 shadow-lg text-xs"
          title="Center on Vientiane"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 hover:bg-slate-800 shadow-lg text-xs"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Actual Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />
    </div>
  );
};
