'use client';

import { initializeApp, getApps } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  onValue, 
  off,
  get,
  remove,
  serverTimestamp,
  type Database,
  type DatabaseReference
} from 'firebase/database';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

// Types
export interface SessionContraction {
  id: string;
  startTime: number;
  duration: number | null;
  type?: 'contraction' | 'water_broke';
  addedBy: string; // device ID
  createdAt: number;
}

export interface PairSession {
  code: string;
  createdAt: object; // serverTimestamp
  expiresAt: number;
  deviceIds: string[];
  contractions: Record<string, SessionContraction>;
}

// Generate a unique device ID (persisted in localStorage)
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let deviceId = localStorage.getItem('maay-device-id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('maay-device-id', deviceId);
  }
  return deviceId;
}

// Generate a 6-character pairing code
export function generatePairCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new pairing session
export async function createSession(code: string): Promise<string> {
  const sessionRef = ref(database, `sessions/${code}`);
  const deviceId = getDeviceId();
  
  const session: Omit<PairSession, 'contractions'> & { contractions: null } = {
    code,
    createdAt: serverTimestamp() as object,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    deviceIds: [deviceId],
    contractions: null,
  };
  
  await set(sessionRef, session);
  return code;
}

// Join an existing session
export async function joinSession(code: string): Promise<boolean> {
  const sessionRef = ref(database, `sessions/${code}`);
  const snapshot = await get(sessionRef);
  
  if (!snapshot.exists()) {
    return false;
  }
  
  const session = snapshot.val() as PairSession;
  
  // Check if expired
  if (session.expiresAt < Date.now()) {
    return false;
  }
  
  // Add this device to the session
  const deviceId = getDeviceId();
  const deviceIds = session.deviceIds || [];
  
  if (!deviceIds.includes(deviceId)) {
    deviceIds.push(deviceId);
    await set(ref(database, `sessions/${code}/deviceIds`), deviceIds);
  }
  
  return true;
}

// Check if a session exists and is valid
export async function checkSession(code: string): Promise<boolean> {
  const sessionRef = ref(database, `sessions/${code}`);
  const snapshot = await get(sessionRef);
  
  if (!snapshot.exists()) {
    return false;
  }
  
  const session = snapshot.val() as PairSession;
  return session.expiresAt > Date.now();
}

// Add a contraction to the session
export async function addContractionToSession(
  sessionCode: string, 
  contraction: Omit<SessionContraction, 'addedBy' | 'createdAt'>
): Promise<void> {
  const contractionRef = ref(database, `sessions/${sessionCode}/contractions/${contraction.id}`);
  
  await set(contractionRef, {
    ...contraction,
    addedBy: getDeviceId(),
    createdAt: Date.now(),
  });
}

// Update a contraction in the session
export async function updateContractionInSession(
  sessionCode: string,
  contractionId: string,
  updates: Partial<SessionContraction>
): Promise<void> {
  const contractionRef = ref(database, `sessions/${sessionCode}/contractions/${contractionId}`);
  const snapshot = await get(contractionRef);
  
  if (snapshot.exists()) {
    const existing = snapshot.val();
    await set(contractionRef, { ...existing, ...updates });
  }
}

// Delete a contraction from the session
export async function deleteContractionFromSession(
  sessionCode: string,
  contractionId: string
): Promise<void> {
  const contractionRef = ref(database, `sessions/${sessionCode}/contractions/${contractionId}`);
  await remove(contractionRef);
}

// Subscribe to contractions updates
export function subscribeToContractions(
  sessionCode: string,
  callback: (contractions: SessionContraction[]) => void
): () => void {
  const contractionsRef = ref(database, `sessions/${sessionCode}/contractions`);
  
  const unsubscribe = onValue(contractionsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const contractions = Object.values(data) as SessionContraction[];
      // Sort by startTime descending (newest first)
      contractions.sort((a, b) => b.startTime - a.startTime);
      callback(contractions);
    } else {
      callback([]);
    }
  });
  
  // Return cleanup function
  return () => off(contractionsRef);
}

// Clear all contractions in a session (Start Fresh)
export async function clearSessionContractions(sessionCode: string): Promise<void> {
  const contractionsRef = ref(database, `sessions/${sessionCode}/contractions`);
  await remove(contractionsRef);
}

// Remove device from session (when unpairing)
export async function leaveSessionInFirebase(sessionCode: string): Promise<void> {
  const deviceId = getDeviceId();
  const deviceIdsRef = ref(database, `sessions/${sessionCode}/deviceIds`);
  const snapshot = await get(deviceIdsRef);
  
  if (snapshot.exists()) {
    const deviceIds = snapshot.val() as string[];
    const filtered = deviceIds.filter(id => id !== deviceId);
    await set(deviceIdsRef, filtered.length > 0 ? filtered : null);
  }
}

// Subscribe to session device count (to know when partner joins)
export function subscribeToDeviceCount(
  sessionCode: string,
  callback: (count: number) => void
): () => void {
  const deviceIdsRef = ref(database, `sessions/${sessionCode}/deviceIds`);
  
  const unsubscribe = onValue(deviceIdsRef, (snapshot) => {
    const data = snapshot.val();
    const count = Array.isArray(data) ? data.length : 0;
    callback(count);
  });
  
  // Return cleanup function
  return () => off(deviceIdsRef);
}

// Export database for advanced usage
export { database, ref, onValue, off };
export type { Database, DatabaseReference };
