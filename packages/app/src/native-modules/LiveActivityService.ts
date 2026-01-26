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

export interface ILiveActivityService {
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

// Re-export the web implementation as default for bundlers
export { LiveActivityService } from './LiveActivityService.web';
