import { ConfigPlugin, withInfoPlist } from '@expo/config-plugins';

/**
 * Expo Config Plugin for ActivityKit support
 * 
 * This plugin ensures the necessary Info.plist entries are set
 * for Live Activities and Dynamic Island support.
 */
export const withActivityKit: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    // Ensure NSSupportsLiveActivities is set
    config.modResults.NSSupportsLiveActivities = true;
    return config;
  });
};
