const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for resolving platform-specific extensions
config.resolver.sourceExts.push('native.ts', 'native.tsx', 'web.ts', 'web.tsx');

module.exports = config;
