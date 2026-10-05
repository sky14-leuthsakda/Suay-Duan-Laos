import { create } from 'zustand';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnSOS: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  bloodType: string;
  allergies: string;
  medicalNotes: string;
  emergencyContacts: EmergencyContact[];
  notifyTrustedContactsOnSOS: boolean;
}

interface ProfileState extends UserProfile {
  updateProfile: (data: Partial<UserProfile>) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (id: string) => void;
  toggleNotifyOnSOS: (id: string) => void;
}

const STORAGE_KEY = 'sdl_user_profile';

const defaultProfile: UserProfile = {
  name: '',
  phone: '',
  bloodType: '',
  allergies: '',
  medicalNotes: '',
  emergencyContacts: [
    {
      id: 'contact-default',
      name: 'ພໍ່ / ແມ່',
      phone: '020-55598765',
      relationship: 'ຄອບຄົວ',
      notifyOnSOS: true,
    },
  ],
  notifyTrustedContactsOnSOS: true,
};

const loadInitialProfile = (): UserProfile => {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...loadInitialProfile(),

  updateProfile: (data) => {
    const updated = { ...get(), ...data };
    set(data);
    if (typeof window !== 'undefined') {
      try {
        const { name, phone, bloodType, allergies, medicalNotes, emergencyContacts, notifyTrustedContactsOnSOS } = updated;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name, phone, bloodType, allergies, medicalNotes, emergencyContacts, notifyTrustedContactsOnSOS })
        );
      } catch {
        // storage disabled or quota exceeded
      }
    }
  },

  addEmergencyContact: (contact) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    const updated = [...get().emergencyContacts, newContact];
    get().updateProfile({ emergencyContacts: updated });
  },

  removeEmergencyContact: (id) => {
    const updated = get().emergencyContacts.filter((c) => c.id !== id);
    get().updateProfile({ emergencyContacts: updated });
  },

  toggleNotifyOnSOS: (id) => {
    const updated = get().emergencyContacts.map((c) =>
      c.id === id ? { ...c, notifyOnSOS: !c.notifyOnSOS } : c
    );
    get().updateProfile({ emergencyContacts: updated });
  },
}));
