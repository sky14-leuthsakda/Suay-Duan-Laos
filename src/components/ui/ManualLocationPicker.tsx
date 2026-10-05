import React, { useState } from 'react';
import { LocationCoords } from '../../types';
import { X, MapPin } from 'lucide-react';

// ─── Laos administrative data (province → district → [lat, lng]) ────────────
// Approximate centroid coords for each province capital
const PROVINCES: Array<{
  nameLo: string;
  districts: Array<{ nameLo: string; lat: number; lng: number }>;
}> = [
  {
    nameLo: 'ນະຄອນຫຼວງວຽງຈັນ',
    districts: [
      { nameLo: 'ຈັນທະບູລີ', lat: 17.9712, lng: 102.6174 },
      { nameLo: 'ສີຫານ', lat: 17.9622, lng: 102.6374 },
      { nameLo: 'ໄຊທານີ', lat: 18.0292, lng: 102.6274 },
      { nameLo: 'ນາຊາຍທອງ', lat: 17.8892, lng: 102.5974 },
      { nameLo: 'ສີໂຄດຕະບອງ', lat: 17.9412, lng: 102.5874 },
      { nameLo: 'ສີສັດຕະນາກ', lat: 17.9512, lng: 102.6274 },
      { nameLo: 'ຫາດຊາຍຟອງ', lat: 17.9212, lng: 102.6474 },
      { nameLo: 'ໄຊເສດຖາ', lat: 17.9812, lng: 102.6474 },
      { nameLo: 'ສັງທອງ', lat: 17.8712, lng: 102.5274 },
    ],
  },
  {
    nameLo: 'ແຂວງຫຼວງພະບາງ',
    districts: [
      { nameLo: 'ຫຼວງພະບາງ', lat: 19.8847, lng: 102.1348 },
      { nameLo: 'ຊຽງງາມ', lat: 20.3000, lng: 102.1200 },
      { nameLo: 'ນານ', lat: 20.4000, lng: 102.4000 },
    ],
  },
  {
    nameLo: 'ແຂວງວຽງຈັນ',
    districts: [
      { nameLo: 'ສັນຂະ', lat: 18.2000, lng: 102.5000 },
      { nameLo: 'ວັງວຽງ', lat: 18.9333, lng: 102.4479 },
      { nameLo: 'ໂພນໂຮງ', lat: 18.5333, lng: 102.4667 },
    ],
  },
  {
    nameLo: 'ແຂວງສາວັນນະເຂດ',
    districts: [
      { nameLo: 'ໄກສອນພົມວິຫານ', lat: 16.5667, lng: 104.7500 },
      { nameLo: 'ຄັນທະບູລີ', lat: 16.6500, lng: 104.8000 },
    ],
  },
  {
    nameLo: 'ແຂວງຈຳປາສັກ',
    districts: [
      { nameLo: 'ປາກເຊ', lat: 15.1167, lng: 105.7833 },
      { nameLo: 'ໂຂງ', lat: 14.1167, lng: 105.8500 },
    ],
  },
  {
    nameLo: 'ແຂວງຜົ້ງສາລີ',
    districts: [
      { nameLo: 'ຜົ້ງສາລີ', lat: 21.6833, lng: 102.1000 },
    ],
  },
  {
    nameLo: 'ແຂວງຫຼວງນ້ຳທາ',
    districts: [
      { nameLo: 'ຫຼວງນ້ຳທາ', lat: 20.9500, lng: 101.4167 },
    ],
  },
  {
    nameLo: 'ແຂວງອຸດົມໄຊ',
    districts: [
      { nameLo: 'ໄຊ', lat: 20.6881, lng: 101.9829 },
    ],
  },
  {
    nameLo: 'ແຂວງບໍ່ແກ້ວ',
    districts: [
      { nameLo: 'ຫ້ວຍຊາຍ', lat: 20.2667, lng: 100.4333 },
    ],
  },
  {
    nameLo: 'ແຂວງຊຽງຂວາງ',
    districts: [
      { nameLo: 'ໂພນສະຫວັນ', lat: 19.4534, lng: 103.1882 },
    ],
  },
  {
    nameLo: 'ແຂວງຄຳມ່ວນ',
    districts: [
      { nameLo: 'ທ່າແຂກ', lat: 17.4000, lng: 104.8000 },
    ],
  },
  {
    nameLo: 'ແຂວງສາລະວັນ',
    districts: [
      { nameLo: 'ສາລະວັນ', lat: 15.7167, lng: 106.4167 },
    ],
  },
  {
    nameLo: 'ແຂວງເຊກອງ',
    districts: [
      { nameLo: 'ລະມາມ', lat: 15.5667, lng: 106.7333 },
    ],
  },
  {
    nameLo: 'ແຂວງອັດຕະປື',
    districts: [
      { nameLo: 'ສາມັກຄີໄຊ', lat: 14.8000, lng: 106.8333 },
    ],
  },
  {
    nameLo: 'ແຂວງຫົວພັນ',
    districts: [
      { nameLo: 'ຊຳເໜືອ', lat: 20.4167, lng: 104.0500 },
    ],
  },
  {
    nameLo: 'ແຂວງໄຊຍະບູລີ',
    districts: [
      { nameLo: 'ໄຊຍະບູລີ', lat: 19.2500, lng: 101.7000 },
    ],
  },
  {
    nameLo: 'ແຂວງໄຊສົມບູນ',
    districts: [
      { nameLo: 'ອານຸວົງ', lat: 18.8167, lng: 103.4167 },
    ],
  },
];

// ─── Props ──────────────────────────────────────────────────────────────────
export interface ManualLocationPickerProps {
  onConfirm: (coords: LocationCoords) => void;
  onClose: () => void;
  /** If true, the picker cannot be dismissed (GPS unavailable, user MUST pick) */
  required?: boolean;
}

export const ManualLocationPicker: React.FC<ManualLocationPickerProps> = ({
  onConfirm,
  onClose,
  required = false,
}) => {
  const [selectedProvinceIdx, setSelectedProvinceIdx] = useState<number | null>(null);
  const [selectedDistrictIdx, setSelectedDistrictIdx] = useState<number | null>(null);
  const [village, setVillage] = useState('');

  const province = selectedProvinceIdx !== null ? PROVINCES[selectedProvinceIdx] : null;
  const district = province && selectedDistrictIdx !== null
    ? province.districts[selectedDistrictIdx]
    : null;

  const handleConfirm = () => {
    if (!district) return;
    const coords: LocationCoords = {
      lat: district.lat,
      lng: district.lng,
      accuracy: undefined,
      address: `${village ? village + ', ' : ''}${district.nameLo}, ${province!.nameLo}`,
      province: province!.nameLo,
      district: district.nameLo,
      village: village || undefined,
    };
    onConfirm(coords);
  };

  return (
    <>
      {/* Backdrop */}
      {!required && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      )}

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-picker-title"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-250"
        style={{ maxHeight: '85dvh', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 id="location-picker-title" className="text-[17px] font-bold text-slate-900 dark:text-white">
              ເລືອກຕຳແໜ່ງດ້ວຍຕົນເອງ
            </h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
              ເລືອກແຂວງ → ເມືອງ → ບ້ານ (ຖ້າທາ)
            </p>
          </div>
          {!required && (
            <button
              type="button"
              onClick={onClose}
              aria-label="ປິດ"
              className="touch-icon rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-4">
          {/* GPS unavailable notice */}
          {required && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-[13px]">
              <MapPin className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold">ໃຊ້ GPS ບໍ່ໄດ້</p>
                <p className="mt-0.5 text-[12px]">ເລືອກຕຳແໜ່ງດ້ວຍຕົນເອງເພື່ອສົ່ງ SOS</p>
              </div>
            </div>
          )}

          {/* Province list */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
              ແຂວງ / ນະຄອນຫຼວງ
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PROVINCES.map((prov, idx) => (
                <button
                  key={prov.nameLo}
                  type="button"
                  aria-pressed={selectedProvinceIdx === idx}
                  onClick={() => { setSelectedProvinceIdx(idx); setSelectedDistrictIdx(null); setVillage(''); }}
                  className={`py-2.5 px-3 rounded-xl border-2 text-[14px] font-semibold text-left transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                    selectedProvinceIdx === idx
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {prov.nameLo}
                </button>
              ))}
            </div>
          </div>

          {/* District list */}
          {province && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
                ເມືອງ
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {province.districts.map((dist, idx) => (
                  <button
                    key={dist.nameLo}
                    type="button"
                    aria-pressed={selectedDistrictIdx === idx}
                    onClick={() => setSelectedDistrictIdx(idx)}
                    className={`py-2.5 px-3 rounded-xl border-2 text-[14px] font-semibold text-left transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                      selectedDistrictIdx === idx
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dist.nameLo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Village name (optional) */}
          {district && (
            <div className="animate-in fade-in duration-150">
              <label
                htmlFor="village-input"
                className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5"
              >
                ບ້ານ (ບໍ່ບັງຄັບ)
              </label>
              <input
                id="village-input"
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="ຊື່ບ້ານ..."
                className="w-full h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          )}
        </div>

        {/* Confirm button */}
        <div className="px-4 pt-2 shrink-0">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!district}
            className="w-full min-h-[52px] rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <MapPin className="w-4 h-4" />
            <span>ຢືນຢັນຕຳແໜ່ງ</span>
          </button>
        </div>
      </div>
    </>
  );
};
