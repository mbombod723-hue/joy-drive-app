import { create } from 'zustand';

export type Language = 'en' | 'fr' | 'zu' | 'af';
export type Theme = 'light' | 'dark';
export type ServiceType = 'ride' | 'package' | 'moving';

interface AppState {
  language: Language;
  theme: Theme;
  isNotificationsEnabled: boolean;
  isLocationSharingEnabled: boolean;
  activeTrip: any | null;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleNotifications: () => void;
  toggleLocationSharing: () => void;
  setActiveTrip: (trip: any | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  theme: 'light',
  isNotificationsEnabled: true,
  isLocationSharingEnabled: true,
  activeTrip: null,
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  toggleNotifications: () => set((state) => ({ isNotificationsEnabled: !state.isNotificationsEnabled })),
  toggleLocationSharing: () => set((state) => ({ isLocationSharingEnabled: !state.isLocationSharingEnabled })),
  setActiveTrip: (activeTrip) => set({ activeTrip }),
}));

interface AuthState {
  user: any | null;
  userName: string;
  profilePic: string | null;
  setUser: (user: any | null) => void;
  setUserName: (name: string) => void;
  setProfilePic: (pic: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userName: 'Gael Muyumba',
  profilePic: null,
  setUser: (user) => set({ user }),
  setUserName: (userName) => set({ userName }),
  setProfilePic: (profilePic) => set({ profilePic }),
}));
