import { config as defaultConfig } from '@tamagui/config';
import { createTamagui, createTokens } from 'tamagui';

// Custom tokens for the organic, high-end feel
const tokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    // Aura colors
    auraGold: '#D4AF37',
    auraGoldLight: '#F4E4BC',
    auraChampagne: '#F7E7CE',
    auraWhite: '#FEFEFA',
    auraCream: '#FFFDD0',
    
    // Night Nursery Mode - OLED optimized
    nightBlack: '#000000',
    nightSurface: '#0A0A0A',
    nightCard: '#121212',
    nightText: '#E8E0D5',
    nightTextMuted: '#6B6560',
    nightAccent: '#D4AF37',
    nightAccentMuted: '#8B7355',
    
    // Phase colors
    waitPrimary: '#E8D5C4',
    waitSecondary: '#C9B8A8',
    momentGold: '#D4AF37',
    momentGlow: '#FFD700',
    rhythmPrimary: '#B8D4E3',
    rhythmSecondary: '#8BB8CC',
    
    // Medical/Care colors
    careGreen: '#7CB342',
    careAmber: '#FFB300',
    careRed: '#E57373',
    careBlue: '#64B5F6',
  },
  space: {
    ...defaultConfig.tokens.space,
    // Extra large touch targets for one-handed use
    touchTarget: 56,
    touchTargetLarge: 72,
  },
  radius: {
    ...defaultConfig.tokens.radius,
    organic: 24,
    organicLarge: 40,
    pill: 9999,
  },
});

// Night Nursery Theme - OLED blacks, low intensity
const nightTheme = {
  background: tokens.color.nightBlack,
  backgroundHover: tokens.color.nightSurface,
  backgroundPress: tokens.color.nightCard,
  backgroundFocus: tokens.color.nightSurface,
  backgroundStrong: tokens.color.nightCard,
  backgroundTransparent: 'rgba(0,0,0,0)',
  
  color: tokens.color.nightText,
  colorHover: tokens.color.nightText,
  colorPress: tokens.color.nightTextMuted,
  colorFocus: tokens.color.nightText,
  colorTransparent: 'rgba(232,224,213,0)',
  
  borderColor: tokens.color.nightCard,
  borderColorHover: tokens.color.nightAccentMuted,
  borderColorFocus: tokens.color.nightAccent,
  borderColorPress: tokens.color.nightCard,
  
  placeholderColor: tokens.color.nightTextMuted,
};

// Warm Day Theme - organic, calming
const warmTheme = {
  ...defaultConfig.themes.light,
  background: '#FDFBF7',
  backgroundHover: '#FAF6F0',
  backgroundPress: '#F5F0E8',
  backgroundFocus: '#FAF6F0',
  backgroundStrong: '#F0E8DC',
  
  color: '#2C2420',
  colorHover: '#1A1614',
  colorPress: '#3E3830',
  colorFocus: '#2C2420',
  
  borderColor: '#E8E0D5',
  borderColorHover: tokens.color.auraGold,
  borderColorFocus: tokens.color.auraGold,
};

const appConfig = createTamagui({
  ...defaultConfig,
  tokens,
  themes: {
    ...defaultConfig.themes,
    light: warmTheme,
    dark: defaultConfig.themes.dark,
    night: nightTheme,
    warm: warmTheme,
  },
  media: {
    ...defaultConfig.media,
    // Custom breakpoints for responsive design
    short: { maxHeight: 820 },
    tall: { minHeight: 821 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

export default appConfig;

export type AppConfig = typeof appConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
