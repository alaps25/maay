import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { useContractionStore } from '../stores/contractionStore';
import { useFeedingStore } from '../stores/feedingStore';
import { useDiaperStore } from '../stores/diaperStore';
import type { SyncPayload, Contraction, FeedingSession, DiaperEntry, AppPhase } from '../stores/types';

interface SyncConfig {
  // Backend URL (Supabase, Firebase, custom)
  apiUrl?: string;
  // WebSocket URL for real-time updates
  wsUrl?: string;
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
}

interface UseSyncSessionReturn {
  // Connection state
  isConnected: boolean;
  isOnline: boolean;
  lastSyncTime: number | null;
  
  // Manual sync triggers
  syncNow: () => Promise<void>;
  
  // Partner sync
  joinHousehold: (householdId: string) => Promise<void>;
  createHousehold: () => Promise<string>;
  leaveHousehold: () => void;
  
  // Pending items count
  pendingCount: number;
}

/**
 * useSyncSession Hook
 * 
 * Manages real-time synchronization between partners:
 * - Optimistic UI updates (local first)
 * - WebSocket connection for real-time partner updates
 * - Automatic retry and offline queue
 * - Hospital mode (works offline, syncs when connection returns)
 */
export function useSyncSession(config: SyncConfig = {}): UseSyncSessionReturn {
  const {
    apiUrl = process.env.NEXT_PUBLIC_API_URL || '',
    wsUrl = process.env.NEXT_PUBLIC_WS_URL || '',
    maxRetries = 3,
    retryDelay = 1000,
  } = config;
  
  // Store access
  const { sync, setConnected, updateLastSync, setHouseholdId } = useAppStore();
  const contractionStore = useContractionStore();
  const feedingStore = useFeedingStore();
  const diaperStore = useDiaperStore();
  const phase = useAppStore((s) => s.phase);
  
  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // Calculate pending sync count
  const pendingCount = 
    contractionStore.getPendingSync().length +
    feedingStore.getPendingSync().length +
    diaperStore.getPendingSync().length;
  
  // Send data to backend
  const sendToBackend = useCallback(async (payload: SyncPayload): Promise<boolean> => {
    if (!apiUrl || !sync.householdId) return false;
    
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const response = await fetch(`${apiUrl}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
          return true;
        }
        
        retries++;
        if (retries < maxRetries) {
          await new Promise((r) => setTimeout(r, retryDelay * retries));
        }
      } catch (error) {
        retries++;
        if (retries < maxRetries) {
          await new Promise((r) => setTimeout(r, retryDelay * retries));
        }
      }
    }
    
    return false;
  }, [apiUrl, sync.householdId, maxRetries, retryDelay]);
  
  // Handle incoming sync message from partner
  const handlePartnerSync = useCallback((payload: SyncPayload) => {
    switch (payload.type) {
      case 'contraction':
        // Merge partner's contraction (avoid duplicates)
        const contraction = payload.data as Contraction;
        const existingContractions = contractionStore.contractions;
        if (!existingContractions.find((c) => c.id === contraction.id)) {
          // Add partner's contraction directly to store
          useContractionStore.setState((state) => ({
            contractions: [...state.contractions, { ...contraction, syncStatus: 'synced' }],
          }));
        }
        break;
        
      case 'feeding':
        const feeding = payload.data as FeedingSession;
        const existingFeedings = feedingStore.sessions;
        if (!existingFeedings.find((f) => f.id === feeding.id)) {
          useFeedingStore.setState((state) => ({
            sessions: [...state.sessions, { ...feeding, syncStatus: 'synced' }],
          }));
        }
        break;
        
      case 'diaper':
        const diaper = payload.data as DiaperEntry;
        const existingDiapers = diaperStore.entries;
        if (!existingDiapers.find((d) => d.id === diaper.id)) {
          useDiaperStore.setState((state) => ({
            entries: [...state.entries, { ...diaper, syncStatus: 'synced' }],
          }));
        }
        break;
        
      case 'phase_change':
        const newPhase = payload.data as AppPhase;
        useAppStore.setState({ phase: newPhase });
        break;
    }
  }, [contractionStore.contractions, feedingStore.sessions, diaperStore.entries]);
  
  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (!wsUrl || !sync.householdId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      const ws = new WebSocket(`${wsUrl}?household=${sync.householdId}`);
      
      ws.onopen = () => {
        setConnected(true);
        console.log('[Sync] WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as SyncPayload;
          handlePartnerSync(payload);
        } catch (e) {
          console.error('[Sync] Failed to parse message:', e);
        }
      };
      
      ws.onclose = () => {
        setConnected(false);
        console.log('[Sync] WebSocket disconnected');
        
        // Auto-reconnect after delay
        if (sync.householdId && isOnlineRef.current) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('[Sync] WebSocket error:', error);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('[Sync] Failed to connect WebSocket:', error);
    }
  }, [wsUrl, sync.householdId, setConnected, handlePartnerSync]);
  
  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, [setConnected]);
  
  // Sync all pending items
  const syncNow = useCallback(async () => {
    if (!sync.householdId || !isOnlineRef.current) return;
    
    const pendingContractions = contractionStore.getPendingSync();
    const pendingFeedings = feedingStore.getPendingSync();
    const pendingDiapers = diaperStore.getPendingSync();
    
    // Sync contractions
    for (const contraction of pendingContractions) {
      const success = await sendToBackend({
        type: 'contraction',
        timestamp: Date.now(),
        data: contraction,
        userId: '', // Would come from auth
        householdId: sync.householdId,
      });
      if (success) {
        contractionStore.markSynced(contraction.id);
      }
    }
    
    // Sync feedings
    for (const feeding of pendingFeedings) {
      const success = await sendToBackend({
        type: 'feeding',
        timestamp: Date.now(),
        data: feeding,
        userId: '',
        householdId: sync.householdId,
      });
      if (success) {
        feedingStore.markSynced(feeding.id);
      }
    }
    
    // Sync diapers
    for (const diaper of pendingDiapers) {
      const success = await sendToBackend({
        type: 'diaper',
        timestamp: Date.now(),
        data: diaper,
        userId: '',
        householdId: sync.householdId,
      });
      if (success) {
        diaperStore.markSynced(diaper.id);
      }
    }
    
    updateLastSync();
  }, [sync.householdId, contractionStore, feedingStore, diaperStore, sendToBackend, updateLastSync]);
  
  // Household management
  const joinHousehold = useCallback(async (householdId: string) => {
    setHouseholdId(householdId);
    connectWebSocket();
    await syncNow();
  }, [setHouseholdId, connectWebSocket, syncNow]);
  
  const createHousehold = useCallback(async (): Promise<string> => {
    // Generate household ID (in production, this would come from backend)
    const householdId = `household_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setHouseholdId(householdId);
    connectWebSocket();
    return householdId;
  }, [setHouseholdId, connectWebSocket]);
  
  const leaveHousehold = useCallback(() => {
    disconnectWebSocket();
    setHouseholdId('');
  }, [disconnectWebSocket, setHouseholdId]);
  
  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      if (sync.householdId) {
        connectWebSocket();
        syncNow();
      }
    };
    
    const handleOffline = () => {
      isOnlineRef.current = false;
      disconnectWebSocket();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [sync.householdId, connectWebSocket, disconnectWebSocket, syncNow]);
  
  // Connect on mount if household exists
  useEffect(() => {
    if (sync.householdId && isOnlineRef.current) {
      connectWebSocket();
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [sync.householdId, connectWebSocket, disconnectWebSocket]);
  
  // Auto-sync on data changes (debounced)
  useEffect(() => {
    if (pendingCount > 0 && sync.householdId && isOnlineRef.current) {
      const timeout = setTimeout(syncNow, 2000);
      return () => clearTimeout(timeout);
    }
  }, [pendingCount, sync.householdId, syncNow]);
  
  return {
    isConnected: sync.isConnected,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncTime: sync.lastSyncTime,
    syncNow,
    joinHousehold,
    createHousehold,
    leaveHousehold,
    pendingCount,
  };
}

export default useSyncSession;
