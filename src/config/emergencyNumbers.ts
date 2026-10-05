export interface EmergencyContact {
  id: string;
  nameLo: string;
  nameEn: string;
  number: string;
  icon: 'police' | 'fire' | 'ambulance';
  color: string;
}

export const EMERGENCY_NUMBERS: EmergencyContact[] = [
  {
    id: 'police',
    nameLo: 'ຕຳຫຼວດ',
    nameEn: 'Police',
    number: '191',
    icon: 'police',
    color: 'blue',
  },
  {
    id: 'fire',
    nameLo: 'ດັບເພີງ',
    nameEn: 'Fire',
    number: '190',
    icon: 'fire',
    color: 'orange',
  },
  {
    id: 'ambulance',
    nameLo: 'ກູ້ໄພສຸກເສີນ',
    nameEn: 'Ambulance',
    number: '195',
    icon: 'ambulance',
    color: 'rose',
  },
];
