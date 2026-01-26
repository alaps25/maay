import { NativeModules } from 'react-native';
import type { LiveActivityService, LiveActivityData } from './LiveActivityService';

/**
 * Native implementation of Live Activity Service
 * Bridges to Swift ActivityKit module
 * 
 * This will be implemented once the Swift native module is created
 */
const { ActivityKitModule } = NativeModules;

export const LiveActivityService: LiveActivityService = {
  async startActivity(data: LiveActivityData): Promise<void> {
    if (!ActivityKitModule) {
      throw new Error('ActivityKitModule is not available. Make sure the native module is properly linked.');
    }
    return ActivityKitModule.startActivity(data);
  },

  async updateActivity(id: string, data: Partial<LiveActivityData>): Promise<void> {
    if (!ActivityKitModule) {
      throw new Error('ActivityKitModule is not available. Make sure the native module is properly linked.');
    }
    return ActivityKitModule.updateActivity(id, data);
  },

  async endActivity(id: string): Promise<void> {
    if (!ActivityKitModule) {
      throw new Error('ActivityKitModule is not available. Make sure the native module is properly linked.');
    }
    return ActivityKitModule.endActivity(id);
  },

  isSupported(): boolean {
    return ActivityKitModule !== null && ActivityKitModule !== undefined;
  },
};
