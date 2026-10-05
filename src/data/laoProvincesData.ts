export interface LaoDistrict {
  id: string;
  nameLo: string;
  nameEn: string;
}

export interface LaoProvince {
  id: string;
  nameLo: string;
  nameEn: string;
  districts: LaoDistrict[];
}

export const LAO_PROVINCES: LaoProvince[] = [
  {
    id: 'vientiane_cap',
    nameLo: 'ນະຄອນຫຼວງວຽງຈັນ (Vientiane Capital)',
    nameEn: 'Vientiane Capital',
    districts: [
      { id: 'chanthabouly', nameLo: 'ເມືອງ ຈັນທະບູລີ', nameEn: 'Chanthabouly' },
      { id: 'sikhottabong', nameLo: 'ເມືອງ ສີໂຄດຕະບອງ', nameEn: 'Sikhottabong' },
      { id: 'xaysettha', nameLo: 'ເມືອງ ໄຊເສດຖາ', nameEn: 'Xaysettha' },
      { id: 'sisattanak', nameLo: 'ເມືອງ ສີສັດຕະນາກ', nameEn: 'Sisattanak' },
      { id: 'hadxayfong', nameLo: 'ເມືອງ ຫາດຊາຍຟອງ', nameEn: 'Hadxayfong' },
      { id: 'xaythany', nameLo: 'ເມືອງ ໄຊທານີ', nameEn: 'Xaythany' },
      { id: 'naxaithong', nameLo: 'ເມືອງ ນາຊາຍທອງ', nameEn: 'Naxaithong' },
    ],
  },
  {
    id: 'luang_prabang',
    nameLo: 'ແຂວງ ຫຼວງພະບາງ (Luang Prabang)',
    nameEn: 'Luang Prabang',
    districts: [
      { id: 'lp_city', nameLo: 'ນະຄອນ ຫຼວງພະບາງ', nameEn: 'Luang Prabang City' },
      { id: 'xiengngeun', nameLo: 'ເມືອງ ຊຽງເງິນ', nameEn: 'Xiengngeun' },
      { id: 'nan', nameLo: 'ເມືອງ ນານ', nameEn: 'Nan' },
      { id: 'pak_ou', nameLo: 'ເມືອງ ປາກອູ', nameEn: 'Pak Ou' },
      { id: 'chomphet', nameLo: 'ເມືອງ ຈອມເພັດ', nameEn: 'Chomphet' },
    ],
  },
  {
    id: 'champasak',
    nameLo: 'ແຂວງ ຈຳປາສັກ (Champasak)',
    nameEn: 'Champasak',
    districts: [
      { id: 'pakse', nameLo: 'ນະຄອນ ປາກເຊ', nameEn: 'Pakse' },
      { id: 'sanasomboun', nameLo: 'ເມືອງ ຊະນະສົມບູນ', nameEn: 'Sanasomboun' },
      { id: 'bachiang', nameLo: 'ເມືອງ ບາຈຽງຈະເລີນສຸກ', nameEn: 'Bachiangchaleunsook' },
      { id: 'champasak_dist', nameLo: 'ເມືອງ ຈຳປາສັກ', nameEn: 'Champasak' },
      { id: 'khong', nameLo: 'ເມືອງ ໂຂງ', nameEn: 'Khong' },
    ],
  },
  {
    id: 'savannakhet',
    nameLo: 'ແຂວງ ສະຫວັນນະເຂດ (Savannakhet)',
    nameEn: 'Savannakhet',
    districts: [
      { id: 'kaysone', nameLo: 'ນະຄອນ ໄກສອນ ພົມວິຫານ', nameEn: 'Kaysone Phomvihane' },
      { id: 'outhoumphone', nameLo: 'ເມືອງ ອຸທຸມພອນ', nameEn: 'Outhoumphone' },
      { id: 'champhone', nameLo: 'ເມືອງ ຈຳພອນ', nameEn: 'Champhone' },
      { id: 'songkhone', nameLo: 'ເມືອງ ສອງຄອນ', nameEn: 'Songkhone' },
    ],
  },
];
