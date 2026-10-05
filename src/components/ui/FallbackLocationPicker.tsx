import React, { useState } from 'react';
import { LocationCoords } from '../../types';
import { LAO_PROVINCES } from '../../data/laoProvincesData';
import { Button } from './Button';
import { MapPin, X, Navigation } from 'lucide-react';

interface FallbackLocationPickerProps {
  isOpen: boolean;
  onSelectLocation: (location: LocationCoords) => void;
  onClose: () => void;
}

export const FallbackLocationPicker: React.FC<FallbackLocationPickerProps> = ({
  isOpen,
  onSelectLocation,
  onClose,
}) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState(LAO_PROVINCES[0].id);
  const selectedProvince = LAO_PROVINCES.find((p) => p.id === selectedProvinceId) || LAO_PROVINCES[0];

  const [selectedDistrictId, setSelectedDistrictId] = useState(selectedProvince.districts[0].id);
  const [villageName, setVillageName] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const province = selectedProvince.nameLo;
    const district = selectedProvince.districts.find((d) => d.id === selectedDistrictId)?.nameLo || '';
    const village = villageName.trim() || 'ຈຸດໃຈກາງເມືອງ (Center)';

    const formattedAddress = `${village}, ${district}, ${province}`;

    // Approximate coords for province centers
    const approxCoords: Record<string, { lat: number; lng: number }> = {
      vientiane_cap: { lat: 17.9712, lng: 102.6174 },
      luang_prabang: { lat: 19.8900, lng: 102.1350 },
      champasak: { lat: 15.1167, lng: 105.7833 },
      savannakhet: { lat: 16.5500, lng: 104.7500 },
    };

    const base = approxCoords[selectedProvinceId] || { lat: 17.9712, lng: 102.6174 };

    onSelectLocation({
      lat: base.lat,
      lng: base.lng,
      address: formattedAddress,
      province,
      district,
      village,
      accuracy: 500,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 text-slate-100"
    >
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm sm:text-base">
            <Navigation className="w-5 h-5" />
            <h2 id="location-picker-title" className="text-white">ເລືອກສະຖານທີ່ແຈ້ງເຫດ (Manual Location)</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed text-left">
          ກະລຸນາເລືອກແຂວງ ແລະ ເມືອງຂອງທ່ານ ເພື່ອໃຫ້ເຈົ້າໜ້າທີ່ກູ້ໄພສາມາດຊອກຫາຈຸດເກີດເຫດໄດ້ວ່ອງໄວ (ກໍລະນີ GPS ບໍ່ສາມາດເຮັດວຽກໄດ້).
        </p>

        <div className="space-y-3 text-left">
          {/* Province Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">ແຂວງ / ນະຄອນຫຼວງ (Province)</label>
            <select
              value={selectedProvinceId}
              onChange={(e) => {
                setSelectedProvinceId(e.target.value);
                const prov = LAO_PROVINCES.find((p) => p.id === e.target.value);
                if (prov && prov.districts.length > 0) {
                  setSelectedDistrictId(prov.districts[0].id);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
            >
              {LAO_PROVINCES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameLo}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">ເມືອງ (District)</label>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
            >
              {selectedProvince.districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameLo}
                </option>
              ))}
            </select>
          </div>

          {/* Village / Landmark Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">ບ້ານ / ຈຸດສັງເກດ (Village or Landmark)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" />
              <input
                type="text"
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                placeholder="ຕົວຢ່າງ: ບ້ານໂພນຕ້ອງ, ໃກ້ຕະຫຼາດ, ຖະໜົນ 13..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            size="default"
            onClick={handleConfirm}
            className="w-full font-bold text-xs sm:text-sm"
          >
            ຢືນຢັນສະຖານທີ່ນີ້ (Confirm Location)
          </Button>

          <Button
            variant="secondary"
            size="default"
            onClick={onClose}
            className="w-full text-xs font-semibold"
          >
            ຍົກເລີກ (Cancel)
          </Button>
        </div>
      </div>
    </div>
  );
};
