export interface NearbyFacility {
  id: string;
  nameLo: string;
  nameEn: string;
  type: 'hospital' | 'police' | 'fire';
  addressLo: string;
  phone: string;
  lat: number;
  lng: number;
  open24h: boolean;
}

export const NEARBY_FACILITIES: NearbyFacility[] = [
  // Hospitals (ໂຮງໝໍ)
  {
    id: 'hosp-01',
    nameLo: 'ໂຮງໝໍ ມິດຕະພາບ (150 ຕຽງ)',
    nameEn: 'Mittaphab Hospital (150 Beds)',
    type: 'hospital',
    addressLo: 'ບ້ານ ໂພນຕ້ອງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '021-710006',
    lat: 17.9865,
    lng: 102.6280,
    open24h: true,
  },
  {
    id: 'hosp-02',
    nameLo: 'ໂຮງໝໍ ມະໂຫສົດ',
    nameEn: 'Mahosot Hospital',
    type: 'hospital',
    addressLo: 'ຖະໜົນ ຟ້າງຸ່ມ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '021-214018',
    lat: 17.9602,
    lng: 102.6075,
    open24h: true,
  },
  {
    id: 'hosp-03',
    nameLo: 'ໂຮງໝໍ ເສດຖາທິຣາດ',
    nameEn: 'Sethathirath Hospital',
    type: 'hospital',
    addressLo: 'ບ້าน ດົງໂພສີ, ເມືອງ ຫາດຊາຍຟອງ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '021-351111',
    lat: 17.9350,
    lng: 102.6520,
    open24h: true,
  },
  {
    id: 'hosp-04',
    nameLo: 'ໂຮງໝໍ ເດັກ ນະຄອນຫຼວງ',
    nameEn: 'Children Hospital Vientiane',
    type: 'hospital',
    addressLo: 'ບ້ານ ດົງປ່າລານ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '021-312151',
    lat: 17.9545,
    lng: 102.6235,
    open24h: true,
  },

  // Police Stations (ປ້ອມຕຳຫຼວດ)
  {
    id: 'pol-01',
    nameLo: 'ກອງບັນຊາການ ປກສ ນະຄອນຫຼວງວຽງຈັນ',
    nameEn: 'Vientiane Capital Police HQ',
    type: 'police',
    addressLo: 'ຖະໜົນ ລ້ານຊ້າງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '191',
    lat: 17.9698,
    lng: 102.6142,
    open24h: true,
  },
  {
    id: 'pol-02',
    nameLo: 'ປກສ ເມືອງ ສີສັດຕະນາກ',
    nameEn: 'Sisattanak District Police Station',
    type: 'police',
    addressLo: 'ບ້ານ ວັດນາກ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '021-312119',
    lat: 17.9450,
    lng: 102.6190,
    open24h: true,
  },
  {
    id: 'pol-03',
    nameLo: 'ປກສ ເມືອງ ສີໂຄດຕະບອງ',
    nameEn: 'Sikhottabong District Police Station',
    type: 'police',
    addressLo: 'ຖະໜົນ ລູກ 23, ເມືອງ ສີໂຄດຕະບອງ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '021-212720',
    lat: 17.9780,
    lng: 102.5850,
    open24h: true,
  },

  // Fire Stations (ສະຖານີດັບເພີງ)
  {
    id: 'fire-01',
    nameLo: 'ກອງດັບເພີງ ນະຄອນຫຼວງວຽງຈັນ (ສຳນັກງານໃຫຍ່)',
    nameEn: 'Vientiane Fire & Rescue HQ',
    type: 'fire',
    addressLo: 'ບ້ານ ໜອງບອນ, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '190',
    lat: 17.9645,
    lng: 102.6240,
    open24h: true,
  },
  {
    id: 'fire-02',
    nameLo: 'ໜ່ວຍດັບເພີງ ສະໜາມບິນສາກົນ ວັດໄຕ',
    nameEn: 'Wattay Airport Fire Service',
    type: 'fire',
    addressLo: 'ສະໜາມບິນວັດໄຕ, ເມືອງ ສີໂຄດຕະບອງ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '021-512165',
    lat: 17.9890,
    lng: 102.5630,
    open24h: true,
  },
];
