import type { ILiveActivityService, LiveActivityData } from './LiveActivityService';

/**
 * Web implementation of Live Activity Service
 * No-op implementation that logs to console
 */
export const LiveActivityService: ILiveActivityService = {
  async startActivity(data: LiveActivityData): Promise<void> {
    console.log('[LiveActivityService.web] Start Activity:', data);
    // Web doesn't support Live Activities
  },

  async updateActivity(id: string, data: Partial<LiveActivityData>): Promise<void> {
    console.log('[LiveActivityService.web] Update Activity:', id, data);
    // Web doesn't support Live Activities
  },

  async endActivity(id: string): Promise<void> {
    console.log('[LiveActivityService.web] End Activity:', id);
    // Web doesn't support Live Activities
  },

  isSupported(): boolean {
    return false;
  },
};
