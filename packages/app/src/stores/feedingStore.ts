import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FeedingSession, FeedingSide, SyncStatus } from './types';

interface FeedingState {
  // All feeding sessions
  sessions: FeedingSession[];
  
  // Current active session
  activeSession: FeedingSession | null;
  
  // Last used side (for alternating reminder)
  lastSide: FeedingSide | null;
  
  // Actions
  startFeeding: (side: FeedingSide) => string;
  endFeeding: (amount?: number, notes?: string) => void;
  cancelFeeding: () => void;
  deleteSession: (id: string) => void;
  clearAll: () => void;
  
  // Sync
  markSynced: (id: string) => void;
  getPendingSync: () => FeedingSession[];
  
  // Analysis
  getTimeSinceLastFeed: () => number | null;
  getTodaySessions: () => FeedingSession[];
  getRecommendedSide: () => FeedingSide;
  getDailyStats: () => {
    totalFeedings: number;
    totalDuration: number;
    leftCount: number;
    rightCount: number;
    bottleCount: number;
    bottleAmount: number;
  };
}

const generateId = () => `feeding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

export const useFeedingStore = create<FeedingState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSession: null,
      lastSide: null,
      
      startFeeding: (side) => {
        const id = generateId();
        const session: FeedingSession = {
          id,
          startTime: Date.now(),
          endTime: null,
          duration: null,
          side,
          syncStatus: 'pending',
        };
        set({ activeSession: session });
        return id;
      },
      
      endFeeding: (amount, notes) => {
        const { activeSession, sessions } = get();
        if (!activeSession) return;
        
        const endTime = Date.now();
        const duration = Math.round((endTime - activeSession.startTime) / 1000);
        
        const completedSession: FeedingSession = {
          ...activeSession,
          endTime,
          duration,
          amount,
          notes,
          syncStatus: 'pending',
        };
        
        set({
          sessions: [...sessions, completedSession],
          activeSession: null,
          lastSide: activeSession.side,
        });
      },
      
      cancelFeeding: () => {
        set({ activeSession: null });
      },
      
      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }));
      },
      
      clearAll: () => {
        set({ sessions: [], activeSession: null, lastSide: null });
      },
      
      markSynced: (id) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, syncStatus: 'synced' as SyncStatus } : s
          ),
        }));
      },
      
      getPendingSync: () => {
        return get().sessions.filter((s) => s.syncStatus === 'pending');
      },
      
      getTimeSinceLastFeed: () => {
        const { sessions } = get();
        if (sessions.length === 0) return null;
        
        const lastSession = sessions
          .filter((s) => s.endTime !== null)
          .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))[0];
        
        if (!lastSession?.endTime) return null;
        return Date.now() - lastSession.endTime;
      },
      
      getTodaySessions: () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        return get().sessions.filter(
          (s) => s.startTime >= startOfDay.getTime()
        );
      },
      
      getRecommendedSide: () => {
        const { lastSide } = get();
        if (!lastSide || lastSide === 'bottle') return 'left';
        return lastSide === 'left' ? 'right' : 'left';
      },
      
      getDailyStats: () => {
        const todaySessions = get().getTodaySessions();
        
        return {
          totalFeedings: todaySessions.length,
          totalDuration: todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
          leftCount: todaySessions.filter((s) => s.side === 'left').length,
          rightCount: todaySessions.filter((s) => s.side === 'right').length,
          bottleCount: todaySessions.filter((s) => s.side === 'bottle').length,
          bottleAmount: todaySessions
            .filter((s) => s.side === 'bottle')
            .reduce((sum, s) => sum + (s.amount || 0), 0),
        };
      },
    }),
    {
      name: 'baby-feeding-storage',
      storage: getStorage(),
      partialize: (state) => ({
        sessions: state.sessions,
        lastSide: state.lastSide,
      }),
    }
  )
);

// Selector hooks
export const useActiveFeeding = () => useFeedingStore((s) => s.activeSession);
export const useLastFeedTime = () => useFeedingStore((s) => s.getTimeSinceLastFeed());
export const useRecommendedSide = () => useFeedingStore((s) => s.getRecommendedSide());
export const useDailyFeedingStats = () => useFeedingStore((s) => s.getDailyStats());
