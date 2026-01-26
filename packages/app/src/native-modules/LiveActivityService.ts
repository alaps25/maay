/**
 * Live Activity Service
 * 
 * Platform-specific implementation:
 * - Web: No-op/Log implementation
 * - Native: Interface for Swift ActivityKit integration
 * 
 * Usage:
 * import { LiveActivityService } from '@baby/app';
 * 
 * // Start a live activity
 * await LiveActivityService.startActivity({
 *   id: 'tracking-123',
 *   title: 'Tracking Session',
 *   status: 'active'
 * });
 */

export interface LiveActivityData {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'completed';
  metadata?: Record<string, any>;
}

export interface LiveActivityService {
  /**
   * Start a new Live Activity
   */
  startActivity(data: LiveActivityData): Promise<void>;
  
  /**
   * Update an existing Live Activity
   */
  updateActivity(id: string, data: Partial<LiveActivityData>): Promise<void>;
  
  /**
   * End a Live Activity
   */
  endActivity(id: string): Promise<void>;
  
  /**
   * Check if Live Activities are supported on this platform
   */
  isSupported(): boolean;
}

// Platform-specific implementations
// Metro (React Native) will automatically resolve .native.ts when importing from .ts
// Next.js webpack will automatically resolve .web.ts when importing from .ts
// 
// This file serves as the main entry point. The bundler will resolve:
// - Web: LiveActivityService.web.ts (via webpack resolve.extensions)
// - Native: LiveActivityService.native.ts (via Metro platform extensions)

export type { LiveActivityService, LiveActivityData };

// Default export - bundlers will resolve the correct platform file
// Metro prioritizes .native.ts, webpack prioritizes .web.ts
export { LiveActivityService } from './LiveActivityService.web';
