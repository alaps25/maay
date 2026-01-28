'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useContractionStore } from '../stores/contractionStore';
import {
  createSession,
  joinSession,
  checkSession,
  subscribeToContractions,
  subscribeToDeviceCount,
  addContractionToSession,
  updateContractionInSession,
  deleteContractionFromSession,
  clearSessionContractions,
  leaveSessionInFirebase,
  generatePairCode,
  getDeviceId,
  type SessionContraction,
} from '../services/firebase';

interface UsePairSessionReturn {
  // Session state
  isConnected: boolean;
  sessionCode: string | null;
  myCode: string;
  
  // Actions
  createMySession: () => Promise<void>;
  joinPartnerSession: (code: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  clearSession: () => Promise<void>; // Clear all session data (localStorage + Firebase)
  
  // Sync contractions to Firebase
  syncContraction: (contraction: { id: string; startTime: number; duration: number | null; type?: 'contraction' | 'water_broke' }) => void;
  syncDeleteContraction: (id: string) => void;
  
  // Sync status
  isSyncing: boolean;
  partnerDeviceCount: number;
}

/**
 * usePairSession Hook
 * 
 * Manages real-time pairing with partner via Firebase:
 * - Creates/joins sessions with 6-digit codes
 * - Syncs contractions in real-time
 * - Handles both adding and receiving contractions
 */
export function usePairSession(): UsePairSessionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [myCode, setMyCode] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [partnerDeviceCount, setPartnerDeviceCount] = useState(0);
  
  // Generate code only on client to avoid hydration mismatch
  useEffect(() => {
    if (!myCode) {
      setMyCode(generatePairCode());
    }
  }, [myCode]);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const unsubscribeDeviceCountRef = useRef<(() => void) | null>(null);
  const isInitialSyncRef = useRef(true);
  
  // Contraction store
  const contractions = useContractionStore((s) => s.contractions);
  const setContractions = useContractionStore((s) => s.setContractions);
  const addContraction = useContractionStore((s) => s.addContraction);
  
  // Check for existing session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedCode = localStorage.getItem('maay-session-code');
    const wasPaired = localStorage.getItem('maay-was-paired') === 'true';
    
    if (savedCode) {
      // Verify session is still valid
      checkSession(savedCode).then((valid) => {
        if (valid) {
          setSessionCode(savedCode);
          // Only set isConnected if we were previously paired (joined someone's session)
          if (wasPaired) {
            setIsConnected(true);
          }
        } else {
          localStorage.removeItem('maay-session-code');
          localStorage.removeItem('maay-was-paired');
        }
      });
    }
  }, []);
  
  // Subscribe to contractions when we have a session
  useEffect(() => {
    if (!sessionCode) return;
    
    isInitialSyncRef.current = true;
    
    const unsubscribe = subscribeToContractions(sessionCode, (remoteContractions) => {
      // On initial sync, merge with local contractions
      if (isInitialSyncRef.current) {
        isInitialSyncRef.current = false;
        
        // Get local contractions
        const localContractions = useContractionStore.getState().contractions;
        
        // Upload any local contractions that aren't in remote
        const remoteIds = new Set(remoteContractions.map((c) => c.id));
        const toUpload = localContractions.filter((c) => !remoteIds.has(c.id));
        
        toUpload.forEach((c) => {
          addContractionToSession(sessionCode, {
            id: c.id,
            startTime: c.startTime,
            duration: c.duration,
            type: c.type,
          });
        });
        
        // Merge remote into local (remote takes precedence for conflicts)
        const localIds = new Set(localContractions.map((c) => c.id));
        const merged = [...localContractions];
        
        remoteContractions.forEach((remote) => {
          if (!localIds.has(remote.id)) {
            merged.push({
              id: remote.id,
              startTime: remote.startTime,
              endTime: remote.duration ? remote.startTime + remote.duration * 1000 : null,
              duration: remote.duration,
              type: remote.type,
              syncStatus: 'synced' as const,
            });
          }
        });
        
        // Sort by startTime descending
        merged.sort((a, b) => b.startTime - a.startTime);
        setContractions(merged);
      } else {
        // Subsequent updates - just use remote as source of truth
        const formatted = remoteContractions.map((c) => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.duration ? c.startTime + c.duration * 1000 : null,
          duration: c.duration,
          type: c.type,
          syncStatus: 'synced' as const,
        }));
        setContractions(formatted);
      }
    });
    
    unsubscribeRef.current = unsubscribe;
    
    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
    };
  }, [sessionCode, setContractions]);
  
  // Subscribe to device count to detect when partner joins/leaves
  useEffect(() => {
    if (!sessionCode) return;
    
    const unsubscribe = subscribeToDeviceCount(sessionCode, (count) => {
      setPartnerDeviceCount(count);
      // If more than 1 device is connected, we're paired!
      if (count > 1) {
        setIsConnected(true);
        // Save paired status to localStorage
        localStorage.setItem('maay-was-paired', 'true');
      } else if (count <= 1) {
        // Partner left - no longer paired
        setIsConnected(false);
        localStorage.removeItem('maay-was-paired');
      }
    });
    
    unsubscribeDeviceCountRef.current = unsubscribe;
    
    return () => {
      unsubscribe();
      unsubscribeDeviceCountRef.current = null;
    };
  }, [sessionCode]);
  
  // Create my session (for sharing code) - doesn't mean "paired" yet
  const createMySession = useCallback(async () => {
    if (!myCode) return; // Wait for code to be generated
    
    setIsSyncing(true);
    try {
      await createSession(myCode);
      setSessionCode(myCode);
      // Save to localStorage so session persists across page refreshes
      localStorage.setItem('maay-session-code', myCode);
      // Don't set isConnected here - just created a session to share
      // isConnected will be true when we join someone else's session
    } finally {
      setIsSyncing(false);
    }
  }, [myCode]);
  
  // Join partner's session
  const joinPartnerSession = useCallback(async (code: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const success = await joinSession(code);
      if (success) {
        setSessionCode(code);
        setIsConnected(true);
        localStorage.setItem('maay-session-code', code);
        localStorage.setItem('maay-was-paired', 'true');
      }
      return success;
    } finally {
      setIsSyncing(false);
    }
  }, []);
  
  // Leave session
  const leaveSession = useCallback(async () => {
    // Remove device from Firebase first (so partner sees the change)
    if (sessionCode) {
      await leaveSessionInFirebase(sessionCode);
    }
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (unsubscribeDeviceCountRef.current) {
      unsubscribeDeviceCountRef.current();
      unsubscribeDeviceCountRef.current = null;
    }
    setSessionCode(null);
    setIsConnected(false);
    setPartnerDeviceCount(0);
    // Generate a new code so next pairing is fresh
    setMyCode(generatePairCode());
    localStorage.removeItem('maay-session-code');
    localStorage.removeItem('maay-was-paired');
  }, [sessionCode]);
  
  // Sync a contraction to Firebase (call this when recording ends or contraction is edited)
  const syncContraction = useCallback((contraction: { 
    id: string; 
    startTime: number; 
    duration: number | null; 
    type?: 'contraction' | 'water_broke' 
  }) => {
    if (!sessionCode) return;
    
    addContractionToSession(sessionCode, {
      id: contraction.id,
      startTime: contraction.startTime,
      duration: contraction.duration,
      type: contraction.type,
    });
  }, [sessionCode]);
  
  // Sync deletion to Firebase
  const syncDeleteContraction = useCallback((id: string) => {
    if (!sessionCode) return;
    
    deleteContractionFromSession(sessionCode, id);
  }, [sessionCode]);
  
  // Clear all session data (for "Clear Data" flow)
  const clearSession = useCallback(async () => {
    // Clear Firebase contractions if we have an active session
    if (sessionCode) {
      try {
        await clearSessionContractions(sessionCode);
      } catch (e) {
        console.error('Failed to clear Firebase contractions:', e);
      }
    }
    
    // Unsubscribe from any active listeners
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (unsubscribeDeviceCountRef.current) {
      unsubscribeDeviceCountRef.current();
      unsubscribeDeviceCountRef.current = null;
    }
    
    // Clear local state
    setSessionCode(null);
    setIsConnected(false);
    setPartnerDeviceCount(0);
    setMyCode(generatePairCode());
    
    // Clear localStorage
    localStorage.removeItem('maay-session-code');
    localStorage.removeItem('maay-was-paired');
  }, [sessionCode]);
  
  return {
    isConnected,
    sessionCode,
    myCode,
    createMySession,
    joinPartnerSession,
    leaveSession,
    clearSession,
    syncContraction,
    syncDeleteContraction,
    isSyncing,
    partnerDeviceCount,
  };
}

// Export sync functions for use in contraction store
export {
  addContractionToSession,
  updateContractionInSession,
  deleteContractionFromSession,
  clearSessionContractions,
};

export default usePairSession;
