import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DiaperEntry, DiaperType, SyncStatus } from './types';
import { diaperExpectations } from '../i18n';

interface DiaperState {
  // All entries
  entries: DiaperEntry[];
  
  // Birth date for day calculation
  birthDate: number | null;
  setBirthDate: (date: number) => void;
  
  // Actions
  addEntry: (type: DiaperType, notes?: string) => string;
  deleteEntry: (id: string) => void;
  clearAll: () => void;
  
  // Sync
  markSynced: (id: string) => void;
  getPendingSync: () => DiaperEntry[];
  
  // Analysis
  getCurrentDay: () => number;
  getTodayEntries: () => DiaperEntry[];
  getDayStats: (day?: number) => {
    wet: number;
    dirty: number;
    total: number;
    expectedWet: number;
    expectedDirty: number;
    meetsExpectation: boolean;
  };
}

const generateId = () => `diaper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return createJSONStorage(() => localStorage);
  }
  return createJSONStorage(() => ({
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  }));
};

export const useDiaperStore = create<DiaperState>()(
  persist(
    (set, get) => ({
      entries: [],
      birthDate: null,
      
      setBirthDate: (birthDate) => set({ birthDate }),
      
      addEntry: (type, notes) => {
        const id = generateId();
        const entry: DiaperEntry = {
          id,
          timestamp: Date.now(),
          type,
          notes,
          syncStatus: 'pending',
        };
        set((state) => ({
          entries: [...state.entries, entry],
        }));
        return id;
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },
      
      clearAll: () => {
        set({ entries: [] });
      },
      
      markSynced: (id) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, syncStatus: 'synced' as SyncStatus } : e
          ),
        }));
      },
      
      getPendingSync: () => {
        return get().entries.filter((e) => e.syncStatus === 'pending');
      },
      
      getCurrentDay: () => {
        const { birthDate } = get();
        if (!birthDate) return 1;
        
        const now = new Date();
        const birth = new Date(birthDate);
        const diffTime = now.getTime() - birth.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays + 1); // Day 1 is birth day
      },
      
      getTodayEntries: () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        return get().entries.filter(
          (e) => e.timestamp >= startOfDay.getTime()
        );
      },
      
      getDayStats: (day) => {
        const currentDay = day ?? get().getCurrentDay();
        const todayEntries = get().getTodayEntries();
        
        const wet = todayEntries.filter(
          (e) => e.type === 'wet' || e.type === 'both'
        ).length;
        
        const dirty = todayEntries.filter(
          (e) => e.type === 'dirty' || e.type === 'both'
        ).length;
        
        // Get expectations (cap at day 7 for expectations)
        const expectationDay = Math.min(currentDay, 7);
        const expectation = diaperExpectations[expectationDay - 1] || diaperExpectations[6];
        
        return {
          wet,
          dirty,
          total: todayEntries.length,
          expectedWet: expectation.wet,
          expectedDirty: expectation.dirty,
          meetsExpectation: wet >= expectation.wet && dirty >= expectation.dirty,
        };
      },
    }),
    {
      name: 'baby-diaper-storage',
      storage: getStorage(),
      partialize: (state) => ({
        entries: state.entries,
        birthDate: state.birthDate,
      }),
    }
  )
);

// Selector hooks
export const useCurrentDay = () => useDiaperStore((s) => s.getCurrentDay());
export const useDiaperStats = () => useDiaperStore((s) => s.getDayStats());
