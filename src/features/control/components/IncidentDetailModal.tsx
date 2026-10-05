import React, { useState } from 'react';
import { 
  IncidentStatus, 
  IncidentPriority 
} from '../../../types';
import { api } from '../../../services/api';
import { useDispatchStore } from '../../../stores/dispatchStore';
import { useTranslation } from '../../../i18n';
import { 
  StatusBadge, 
  PriorityBadge, 
  EmergencyTypeBadge, 
  Button, 
  IconButton,
  Card 
} from '../../../components';
import { 
  X, 
  Phone, 
  MapPin, 
  User, 
  Clock, 
  Truck, 
  MessageSquare, 
  Send, 
  CheckCircle2
} from 'lucide-react';

interface IncidentDetailModalProps {
  incidentId: string;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incidentId,
  onClose,
}) => {
  const { t } = useTranslation();
  const { incidents, units, updateIncidentInList } = useDispatchStore();
  const incident = incidents.find((i) => i.id === incidentId);

  const [newInternalNote, setNewInternalNote] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(incident?.assignedUnitId || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isAssigningUnit, setIsAssigningUnit] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!incident) return null;

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateIncidentStatus(
        incident.id, 
        newStatus, 
        `ສະຖານະຖືກປ່ຽນໂດຍສູນບັນຊາການເປັນ: ${newStatus}`
      );
      updateIncidentInList(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: IncidentPriority) => {
    setIsUpdatingPriority(true);
    try {
      const updated = await api.updateIncidentPriority(incident.id, newPriority);
      updateIncidentInList(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAssignUnit = async () => {
    if (!selectedUnitId) return;
    setIsAssigningUnit(true);
    try {
      const updated = await api.assignUnit(incident.id, selectedUnitId);
      updateIncidentInList(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssigningUnit(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInternalNote.trim()) return;
    setIsAddingNote(true);
    try {
      const updated = await api.addIncidentInternalNote(incident.id, newInternalNote.trim(), 'Dispatcher 01');
      updateIncidentInList(updated);
      setNewInternalNote('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span id="incident-detail-title" className="font-mono text-base font-black text-white">
                  #{incident.trackingCode}
                </span>
                <PriorityBadge priority={incident.priority} size="sm" />
                <EmergencyTypeBadge type={incident.type} size="sm" />
                <StatusBadge status={incident.status} size="sm" />
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5">
                ແຈ້ງເມື່ອ: {new Date(incident.createdAt).toLocaleString('lo-LA')}
              </span>
            </div>
          </div>

          <IconButton
            size="sm"
            aria-label="Close dialog"
            variant="ghost"
            onClick={onClose}
            className="!min-h-[40px] !min-w-[40px] text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Quick Operations Row: Status & Priority Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            {/* Change Status */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                ປ່ຽນສະຖານະເຫດ (Change Status)
              </label>
              <select
                disabled={isUpdatingStatus}
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="received">{t('status.received')}</option>
                <option value="acknowledged">{t('status.acknowledged')}</option>
                <option value="dispatched">{t('status.dispatched')}</option>
                <option value="on_the_way">{t('status.on_the_way')}</option>
                <option value="arrived">{t('status.arrived')}</option>
                <option value="resolved">{t('status.resolved')}</option>
                <option value="cancelled">{t('status.cancelled')}</option>
              </select>
            </div>

            {/* Change Priority */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                ປ່ຽນລະດັບຄວາມດ່ວນ (Change Priority)
              </label>
              <select
                disabled={isUpdatingPriority}
                value={incident.priority}
                onChange={(e) => handlePriorityChange(e.target.value as IncidentPriority)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-rose-500 disabled:opacity-50"
              >
                <option value="critical">{t('priority.critical')} (ວິກິດສູງສຸດ)</option>
                <option value="high">{t('priority.high')} (ດ່ວນຫຼາຍ)</option>
                <option value="medium">{t('priority.medium')} (ປານກາງ)</option>
                <option value="low">{t('priority.low')} (ທຳມະດາ)</option>
              </select>
            </div>
          </div>

          {/* Reporter & Location Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Reporter Information */}
            <Card className="bg-slate-950/60 border-slate-800 space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                <User className="w-4 h-4" />
                <span>ຂໍ້ມູນຜູ້ແຈ້ງເຫດ (Reporter Info)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">ຊື່ຜູ້ແຈ້ງ:</span>
                  <span className="font-semibold text-white">{incident.reporterName || 'ປະຊາຊົນ (Citizen)'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ເບີໂທລະສັບ:</span>
                  <span className="font-mono font-bold text-white">{incident.reporterPhone || 'ບໍ່ລະບຸ (Anonymous SOS)'}</span>
                </div>
              </div>

              {/* Call Reporter Button */}
              {incident.reporterPhone && (
                <a
                  href={`tel:${incident.reporterPhone}`}
                  className="touch-target w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>ໂທຫາຜູ້ແຈ້ງ ({incident.reporterPhone})</span>
                </a>
              )}
            </Card>

            {/* Location Details */}
            <Card className="bg-slate-950/60 border-slate-800 space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-slate-800 pb-2">
                <MapPin className="w-4 h-4" />
                <span>ສະຖານທີ່ເກີດເຫດ (Location)</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="font-semibold text-white">
                  {incident.location.address || 'ນະຄອນຫຼວງວຽງຈັນ'}
                </p>
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                  <span>GPS:</span>
                  <span>{incident.location.lat.toFixed(5)}, {incident.location.lng.toFixed(5)}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ເມືອງ: {incident.location.district || 'Chanthabouly'} • ແຂວງ: {incident.location.province || 'Vientiane Capital'}
                </div>
              </div>
            </Card>
          </div>

          {/* Reporter Note & Photo (If present) */}
          {(incident.note || incident.photoUrl) && (
            <Card className="bg-slate-950/60 border-slate-800 space-y-3 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block border-b border-slate-800 pb-2">
                ລາຍລະອຽດ & ຮູບພາບຈາກຜູ້ແຈ້ງ (Notes & Photo)
              </span>

              {incident.note && (
                <p className="text-xs sm:text-sm text-slate-200 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  "{incident.note}"
                </p>
              )}

              {incident.photoUrl && (
                <div className="max-w-xs rounded-xl overflow-hidden border border-slate-700 shadow-md">
                  <img src={incident.photoUrl} alt="Incident Attachment" className="w-full h-auto object-cover" />
                </div>
              )}
            </Card>
          )}

          {/* Assign / Reassign Unit Section */}
          <Card className="bg-slate-950/60 border-slate-800 space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Truck className="w-4 h-4" />
                <span>
                  {incident.assignedUnit ? 'ປ່ຽນໜ່ວຍງານປະຕິບັດການ (Reassign Unit)' : 'ມອບໝາຍໜ່ວຍງານ (Assign Unit)'}
                </span>
              </div>
              {incident.assignedUnit && (
                <span className="text-xs text-slate-400">
                  ປະຈຸບັນ: <strong className="text-white">{incident.assignedUnit.name}</strong>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full sm:flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- ເລືອກໜ່ວຍງານກູ້ໄພ (Select Response Unit) --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    [{u.type.toUpperCase()}] {u.name} ({u.status})
                  </option>
                ))}
              </select>

              <Button
                variant="success"
                size="default"
                disabled={!selectedUnitId || isAssigningUnit || selectedUnitId === incident.assignedUnitId}
                onClick={handleAssignUnit}
                className="w-full sm:w-auto !min-h-[44px] text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{incident.assignedUnitId ? 'ປ່ຽນໜ່ວຍງານ (Reassign)' : 'ສັ່ງການ (Assign)'}</span>
              </Button>
            </div>
          </Card>

          {/* Incident Timeline */}
          <Card className="bg-slate-950/60 border-slate-800 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              <Clock className="w-4 h-4" />
              <span>ປະຫວັດຂັ້ນຕອນເຫດການ (Incident Timeline)</span>
            </div>

            <div className="space-y-3 pl-1">
              {incident.timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white capitalize">{event.status.replace('_', ' ')}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    {event.note && <p className="text-slate-400 text-[11px] mt-0.5">{event.note}</p>}
                    {event.actorName && (
                      <span className="text-[10px] text-blue-400 block mt-0.5">ໂດຍ: {event.actorName}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Internal Notes Section */}
          <Card className="bg-slate-950/60 border-slate-800 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
              <MessageSquare className="w-4 h-4" />
              <span>ບັນທຶກພາຍໃນສູນສັ່ງການ (Internal Dispatcher Notes)</span>
            </div>

            {/* Existing notes */}
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {(!incident.internalNotes || incident.internalNotes.length === 0) ? (
                <p className="text-[11px] text-slate-500 italic">ຍັງບໍ່ມີບັນທຶກພາຍໃນ (No internal notes yet)</p>
              ) : (
                incident.internalNotes.map((note) => (
                  <div key={note.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-purple-300 font-semibold mb-1">
                      <span>{note.author}</span>
                      <span className="font-mono text-slate-500">
                        {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-200">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add new internal note input */}
            <form onSubmit={handleAddInternalNote} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
                placeholder="ເພີ່ມບັນທຶກພາຍໃນສູນ..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newInternalNote.trim() || isAddingNote}
                className="!bg-purple-600 hover:!bg-purple-500 !min-h-[40px] text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ບັນທຶກ</span>
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
