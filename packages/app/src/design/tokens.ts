/**
 * Maay Design System - Design Tokens
 * 
 * Centralized design tokens for consistent UI across the app.
 * These values are derived from the existing UI patterns.
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Base colors (mode-dependent, use getThemeColors() instead)
  light: {
    line: '#1a1a1a',
    background: '#f5f5f0',
  },
  dark: {
    line: '#E8E0D5',
    background: '#000000',
  },
  
  // Semantic colors
  error: '#e53935',
  white: '#ffffff',
  
  // Sheet backgrounds
  sheet: {
    light: 'rgba(255, 255, 255, 0.98)',
    lightAlt: 'rgba(255, 255, 255, 0.95)',
    lightSubtle: 'rgba(255, 255, 255, 0.6)',
    dark: 'rgba(0, 0, 0, 0.95)',
    darkAlt: 'rgba(0, 0, 0, 0.9)',
    darkSubtle: 'rgba(30, 30, 30, 0.6)',
  },
  
  // Overlay
  backdrop: 'rgba(0,0,0,0.5)',
  
  // Warning colors
  warning: {
    bgLight: 'rgba(200,150,50,0.1)',
    bgDark: 'rgba(255,200,100,0.1)',
    borderLight: 'rgba(200,150,50,0.2)',
    borderDark: 'rgba(255,200,100,0.2)',
  },
} as const;

/**
 * Get theme-aware colors based on night mode
 */
export function getThemeColors(isNight: boolean) {
  const base = isNight ? colors.dark : colors.light;
  const sheetBg = isNight ? colors.sheet.dark : colors.sheet.light;
  const sheetBgAlt = isNight ? colors.sheet.darkAlt : colors.sheet.lightAlt;
  const sheetBgSubtle = isNight ? colors.sheet.darkSubtle : colors.sheet.lightSubtle;
  
  return {
    line: base.line,
    bg: base.background,
    sheetBg,
    sheetBgAlt,
    sheetBgSubtle,
    error: colors.error,
    white: colors.white,
    backdrop: colors.backdrop,
    warningBg: isNight ? colors.warning.bgDark : colors.warning.bgLight,
    warningBorder: isNight ? colors.warning.borderDark : colors.warning.borderLight,
  };
}

/**
 * Color with alpha - creates rgba string from a color with opacity suffix
 * Usage: colorWithAlpha(lineColor, 0.2) or use the preset opacities below
 */
export function colorWithAlpha(color: string, alpha: number): string {
  // If color is hex, convert to rgba
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

// Preset opacity levels (append to hex color: `${lineColor}${opacity.medium}`)
export const opacity = {
  heavy: '40',      // 40% - borders
  medium: '20',     // 20% - borders, backgrounds
  light: '15',      // 15% - subtle borders
  subtle: '10',     // 10% - backgrounds
  faint: '08',      // 8% - very subtle backgrounds
  whisper: '05',    // 5% - barely visible
  ghost: '03',      // 3% - minimal
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const fonts = {
  sans: 'var(--font-sans, sans-serif)',
  serif: 'var(--font-serif, Georgia, serif)',
  mono: 'var(--font-mono, monospace)',
} as const;

export const fontSizes = {
  // Display
  timer: 56,        // Large timer display
  code: 28,         // Session code
  xlarge: 24,       // Large text
  
  // Body
  large: 18,        // Large body/heading
  body: 16,         // Standard body
  bodyAlt: 15,      // Body text variant
  small: 14,        // Small body
  
  // UI
  label: 13,        // Small text
  button: 12,       // Button/label text
  caption: 11,      // Small label
  micro: 10,        // Tiny text
  nano: 9,          // Micro text
} as const;

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

export const letterSpacing = {
  ultraWide: '0.35em',   // MAAY branding
  extraWide: '0.25em',   // Session codes
  wide: '0.15em',        // Primary buttons
  medium: '0.12em',      // Labels
  standard: '0.1em',     // Headings
  narrow: '0.08em',      // Secondary buttons
  compact: '0.05em',     // Breathing text
  tight: '-0.02em',      // Timer display
} as const;

export const lineHeights = {
  wide: 1.8,
  relaxed: 1.7,
  normal: 1.6,
  snug: 1.5,
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  // Base scale (4px increments)
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  9: 20,
  10: 24,
  11: 28,
  12: 32,
  13: 40,
  14: 48,
  15: 60,
} as const;

// Semantic spacing aliases
export const space = {
  xs: spacing[2],     // 4px
  sm: spacing[4],     // 8px
  md: spacing[6],     // 12px
  lg: spacing[8],     // 16px
  xl: spacing[10],    // 24px
  '2xl': spacing[12], // 32px
  '3xl': spacing[13], // 40px
  '4xl': spacing[14], // 48px
  '5xl': spacing[15], // 60px
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radii = {
  none: 0,
  micro: 2,       // Drag handle
  sm: 6,          // Small elements
  md: 12,         // Cards, inputs
  lg: 20,         // Sheets
  full: 50,       // Pills, buttons
  round: '50%',   // Circles
} as const;

// =============================================================================
// SHADOWS & EFFECTS
// =============================================================================

export const shadows = {
  sheet: (lineColor: string) => `0 -4px 20px ${lineColor}15`,
  panel: '0 4px 20px rgba(0,0,0,0.2)',
} as const;

export const blur = {
  sheet: 'blur(16px)',
  subtle: 'blur(4px)',
} as const;

// =============================================================================
// Z-INDEX LAYERS
// =============================================================================

export const zIndex = {
  base: 0,
  content: 5,
  navigation: 10,
  helpButton: 15,
  historySheet: 20,
  welcomeOverlay: 25,
  celebration: 45,
  modal: 100,
  modalBackdrop: 100,
  modalContent: 101,
  confirmation: 200,
  confirmationBackdrop: 200,
  confirmationContent: 201,
} as const;

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  // Spring configs
  spring: {
    default: { type: 'spring' as const, damping: 30, stiffness: 300 },
  },
  
  // Durations
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.8,
  },
  
  // Easing
  easing: {
    default: 'ease',
    out: 'ease-out',
  },
  
  // Scales
  scale: {
    hover: 1.02,
    tap: 0.98,
    exit: 0.9,
  },
  
  // Drag
  drag: {
    elastic: 0.2,
    threshold: 50,
    velocityThreshold: 500,
  },
} as const;

// =============================================================================
// DIMENSIONS
// =============================================================================

export const sizes = {
  // Icons
  iconXs: 14,
  iconSm: 16,
  iconMd: 18,
  iconLg: 20,
  
  // Buttons
  buttonIcon: 32,
  dragHandleWidth: 36,
  dragHandleHeight: 4,
  
  // Stroke widths
  strokeThin: 1,
  strokeMedium: 1.5,
  strokeNormal: 2,
  strokeThick: 2.5,
} as const;

export const viewportHeights = {
  sheetExpanded: '80vh',
  sheetCollapsed: '24vh',
  sheetMinimal: '12vh',
  controlPanel: '70vh',
  controlPanelAlt: '60vh',
} as const;

export const maxWidths = {
  content: 280,
  contentMd: 240,
  contentSm: 220,
  input: 180,
  controlLabel: 100,
  controlValue: 50,
} as const;

// =============================================================================
// COMPOSITE STYLES
// =============================================================================

/**
 * Common text styles
 */
export const textStyles = {
  heading: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: fontSizes.bodyAlt,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.relaxed,
  },
  button: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.wide,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.nano,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
  },
  timer: {
    fontFamily: fonts.serif,
    fontSize: fontSizes.timer,
    fontWeight: fontWeights.light,
    letterSpacing: letterSpacing.tight,
  },
  code: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.code,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.extraWide,
  },
} as const;

/**
 * Common button padding patterns
 */
export const buttonPadding = {
  primary: `${spacing[8]}px ${spacing[14]}px`,     // 16px 48px
  secondary: `${spacing[7]}px ${spacing[13]}px`,  // 14px 40px
  small: `${spacing[6]}px ${spacing[10]}px`,      // 12px 24px
  compact: `${spacing[7]}px ${spacing[10]}px`,    // 14px 24px
} as const;
