import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppPhase, ThemeMode, AppSettings, BabyInfo, HouseholdSync } from './types';

interface AppState {
  // Current phase
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  
  // Baby information
  babyInfo: BabyInfo | null;
  setBabyInfo: (info: BabyInfo) => void;
  
  // Birth celebration state
  hasCelebrated: boolean;
  setCelebrated: (celebrated: boolean) => void;
  celebrationTime: number | null;
  setCelebrationTime: (time: number) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Sync state
  sync: HouseholdSync;
  setHouseholdId: (id: string) => void;
  setPartnerId: (id: string) => void;
  setConnected: (connected: boolean) => void;
  updateLastSync: () => void;
  
  // Night mode detection
  isNightTime: boolean;
  checkNightTime: () => void;
  
  // Reset
  resetApp: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'auto',
  locale: 'en',
  hapticFeedback: true,
  soundEffects: true,
  notifications: true,
  use24Hour: false,
  measurementUnit: 'metric',
};

const defaultSync: HouseholdSync = {
  householdId: null,
  partnerId: null,
  lastSyncTime: null,
  isConnected: false,
};

// Platform-specific storage
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return createJSONStorage(() => localStorage);
  }
  // For React Native, we'll use AsyncStorage (injected at runtime)
  return createJSONStorage(() => ({
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  }));
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Phase
      phase: 'wait',
      setPhase: (phase) => set({ phase }),
      
      // Baby info
      babyInfo: null,
      setBabyInfo: (babyInfo) => set({ babyInfo }),
      
      // Celebration
      hasCelebrated: false,
      setCelebrated: (hasCelebrated) => set({ hasCelebrated }),
      celebrationTime: null,
      setCelebrationTime: (celebrationTime) => set({ celebrationTime }),
      
      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      
      // Sync
      sync: defaultSync,
      setHouseholdId: (householdId) =>
        set((state) => ({ sync: { ...state.sync, householdId } })),
      setPartnerId: (partnerId) =>
        set((state) => ({ sync: { ...state.sync, partnerId } })),
      setConnected: (isConnected) =>
        set((state) => ({ sync: { ...state.sync, isConnected } })),
      updateLastSync: () =>
        set((state) => ({ sync: { ...state.sync, lastSyncTime: Date.now() } })),
      
      // Night mode (3 AM usage optimization)
      isNightTime: false,
      checkNightTime: () => {
        const hour = new Date().getHours();
        const isNight = hour >= 21 || hour < 6; // 9 PM to 6 AM
        set({ isNightTime: isNight });
      },
      
      // Reset
      resetApp: () =>
        set({
          phase: 'wait',
          babyInfo: null,
          hasCelebrated: false,
          celebrationTime: null,
          settings: defaultSettings,
          sync: defaultSync,
        }),
    }),
    {
      name: 'baby-app-storage',
      storage: getStorage(),
      partialize: (state) => ({
        phase: state.phase,
        babyInfo: state.babyInfo,
        hasCelebrated: state.hasCelebrated,
        celebrationTime: state.celebrationTime,
        settings: state.settings,
        sync: state.sync,
      }),
    }
  )
);

// Selector hooks for common state slices
export const usePhase = () => useAppStore((state) => state.phase);
export const useSettings = () => useAppStore((state) => state.settings);
export const useTheme = () => useAppStore((state) => {
  const { settings, isNightTime } = state;
  if (settings.theme === 'auto') {
    return isNightTime ? 'night' : 'light';
  }
  return settings.theme;
});
