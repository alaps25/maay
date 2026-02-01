/**
 * Core Types for App State
 */

export type AppPhase = 'wait' | 'moment' | 'rhythm';
export type ThemeMode = 'light' | 'dark' | 'night' | 'auto';
export type FeedingSide = 'left' | 'right' | 'bottle';
export type DiaperType = 'wet' | 'dirty' | 'both';
export type SyncStatus = 'synced' | 'pending' | 'offline' | 'error';

export type ContractionType = 'contraction' | 'water_broke';

export interface Contraction {
  id: string;
  startTime: number;
  endTime: number | null;
  duration: number | null; // in seconds
  type?: ContractionType; // undefined = regular contraction for backwards compatibility
  notes?: string;
  syncStatus: SyncStatus;
}

export interface FeedingSession {
  id: string;
  startTime: number;
  endTime: number | null;
  duration: number | null; // in seconds
  side: FeedingSide;
  amount?: number; // for bottle, in ml/oz
  notes?: string;
  syncStatus: SyncStatus;
}

export interface DiaperEntry {
  id: string;
  timestamp: number;
  type: DiaperType;
  notes?: string;
  syncStatus: SyncStatus;
}

export interface BabyInfo {
  name?: string;
  birthTime?: number;
  birthWeight?: number;
  birthLength?: number;
  gender?: 'male' | 'female' | 'other';
}

export interface HouseholdSync {
  householdId: string | null;
  partnerId: string | null;
  lastSyncTime: number | null;
  isConnected: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  locale: string;
  hapticFeedback: boolean;
  soundEffects: boolean;
  notifications: boolean;
  use24Hour: boolean;
  measurementUnit: 'metric' | 'imperial';
}

// Labor Phase Detection (based on international medical standards)
// - Early labor: contractions 5-20 min apart, 30-45 seconds
// - Active labor: contractions 3-5 min apart, 45-60 seconds
// - Transition: contractions 2-3 min apart, 60-90 seconds
export type LaborPhase = 'none' | 'early' | 'active' | 'transition';

// 5-1-1 Rule Analysis
export interface ContractionPattern {
  averageInterval: number; // in minutes
  averageDuration: number; // in seconds
  consistentForMinutes: number;
  meetsFiveOneOne: boolean;
  laborPhase: LaborPhase;
}

export interface SyncPayload {
  type: 'contraction' | 'feeding' | 'diaper' | 'phase_change' | 'baby_info';
  timestamp: number;
  data: Contraction | FeedingSession | DiaperEntry | AppPhase | BabyInfo;
  userId: string;
  householdId: string;
}
