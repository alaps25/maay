import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Contraction, ContractionPattern, SyncStatus, ContractionType } from './types';

interface ContractionState {
  // All contractions
  contractions: Contraction[];
  
  // Current active contraction
  activeContraction: Contraction | null;
  
  // Actions
  startContraction: () => string;
  endContraction: (notes?: string) => void;
  cancelContraction: () => void;
  addContraction: (startTime: number, duration: number) => void;
  addWaterBroke: (time: number) => void;
  updateContraction: (id: string, updates: { duration?: number; startTime?: number }) => void;
  deleteContraction: (id: string) => void;
  clearAll: () => void;
  setContractions: (contractions: Contraction[]) => void;
  
  // Sync status updates
  markSynced: (id: string) => void;
  markPending: (ids: string[]) => void;
  getPendingSync: () => Contraction[];
  
  // Analysis
  getPattern: () => ContractionPattern | null;
  checkFiveOneOne: () => boolean;
  getRecentContractions: (minutes: number) => Contraction[];
}

const generateId = () => `contraction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Platform-specific storage
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

export const useContractionStore = create<ContractionState>()(
  persist(
    (set, get) => ({
      contractions: [],
      activeContraction: null,
      
      startContraction: () => {
        const id = generateId();
        const contraction: Contraction = {
          id,
          startTime: Date.now(),
          endTime: null,
          duration: null,
          syncStatus: 'pending',
        };
        set({ activeContraction: contraction });
        return id;
      },
      
      endContraction: (notes) => {
        const { activeContraction, contractions } = get();
        if (!activeContraction) return;
        
        const endTime = Date.now();
        const duration = Math.round((endTime - activeContraction.startTime) / 1000);
        
        const completedContraction: Contraction = {
          ...activeContraction,
          endTime,
          duration,
          notes,
          syncStatus: 'pending',
        };
        
        set({
          contractions: [...contractions, completedContraction],
          activeContraction: null,
        });
      },
      
      cancelContraction: () => {
        set({ activeContraction: null });
      },
      
      addContraction: (startTime, duration) => {
        const id = generateId();
        const contraction: Contraction = {
          id,
          startTime,
          endTime: startTime + duration * 1000,
          duration,
          type: 'contraction',
          syncStatus: 'pending',
        };
        set((state) => ({
          contractions: [...state.contractions, contraction],
        }));
      },
      
      addWaterBroke: (time) => {
        const id = `water_broke_${Date.now()}`;
        const entry: Contraction = {
          id,
          startTime: time,
          endTime: time,
          duration: null,
          type: 'water_broke',
          syncStatus: 'pending',
        };
        set((state) => ({
          contractions: [...state.contractions, entry],
        }));
      },
      
      updateContraction: (id, updates) => {
        set((state) => ({
          contractions: state.contractions.map((c) => {
            if (c.id !== id) return c;
            
            const newStartTime = updates.startTime ?? c.startTime;
            const newDuration = updates.duration ?? c.duration;
            const newEndTime = newDuration !== null ? newStartTime + newDuration * 1000 : c.endTime;
            
            return {
              ...c,
              startTime: newStartTime,
              duration: newDuration,
              endTime: newEndTime,
              syncStatus: 'pending' as SyncStatus,
            };
          }),
        }));
      },
      
      deleteContraction: (id) => {
        set((state) => ({
          contractions: state.contractions.filter((c) => c.id !== id),
        }));
      },
      
      clearAll: () => {
        set({ contractions: [], activeContraction: null });
      },
      
      setContractions: (contractions) => {
        set({ contractions });
      },
      
      markSynced: (id) => {
        set((state) => ({
          contractions: state.contractions.map((c) =>
            c.id === id ? { ...c, syncStatus: 'synced' as SyncStatus } : c
          ),
        }));
      },
      
      markPending: (ids) => {
        set((state) => ({
          contractions: state.contractions.map((c) =>
            ids.includes(c.id) ? { ...c, syncStatus: 'pending' as SyncStatus } : c
          ),
        }));
      },
      
      getPendingSync: () => {
        return get().contractions.filter((c) => c.syncStatus === 'pending');
      },
      
      getRecentContractions: (minutes) => {
        const cutoff = Date.now() - minutes * 60 * 1000;
        return get().contractions.filter(
          (c) => c.endTime && c.endTime >= cutoff
        );
      },
      
      getPattern: () => {
        const contractions = get().getRecentContractions(60); // Last hour
        if (contractions.length < 3) return null;
        
        // Sort by start time
        const sorted = [...contractions].sort((a, b) => a.startTime - b.startTime);
        
        // Calculate intervals between contractions
        const intervals: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
          const interval = (sorted[i].startTime - (sorted[i - 1].endTime || sorted[i - 1].startTime)) / 1000 / 60;
          intervals.push(interval);
        }
        
        // Calculate durations
        const durations = sorted
          .filter((c) => c.duration !== null)
          .map((c) => c.duration as number);
        
        const avgInterval = intervals.length > 0
          ? intervals.reduce((a, b) => a + b, 0) / intervals.length
          : 0;
        
        const avgDuration = durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0;
        
        // Check if pattern is consistent (within 60 minutes)
        const oldestInPattern = sorted[0].startTime;
        const consistentForMinutes = (Date.now() - oldestInPattern) / 1000 / 60;
        
        // 5-1-1 Rule: 5 mins apart, 1 min (60s) duration, for 1 hour
        const meetsFiveOneOne =
          avgInterval <= 5 &&
          avgInterval >= 3 &&
          avgDuration >= 45 && // Allow some flexibility (45-90 seconds)
          avgDuration <= 90 &&
          consistentForMinutes >= 60 &&
          contractions.length >= 6; // At least 6 contractions in an hour
        
        return {
          averageInterval: Math.round(avgInterval * 10) / 10,
          averageDuration: Math.round(avgDuration),
          consistentForMinutes: Math.round(consistentForMinutes),
          meetsFiveOneOne,
        };
      },
      
      checkFiveOneOne: () => {
        const pattern = get().getPattern();
        return pattern?.meetsFiveOneOne ?? false;
      },
    }),
    {
      name: 'baby-contractions-storage',
      storage: getStorage(),
      partialize: (state) => ({
        contractions: state.contractions,
      }),
    }
  )
);

// Selector hooks
export const useActiveContraction = () => useContractionStore((s) => s.activeContraction);
export const useContractionCount = () => useContractionStore((s) => s.contractions.length);
export const useContractionPattern = () => useContractionStore((s) => s.getPattern());
