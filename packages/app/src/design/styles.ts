/**
 * Maay Design System - Common Styles
 * 
 * Reusable style objects and helpers for consistent UI.
 */

import type { CSSProperties } from 'react';
import {
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
  lineHeights,
  spacing,
  radii,
  blur,
  animation,
  opacity,
} from './tokens';

// =============================================================================
// SHEET STYLES
// =============================================================================

/**
 * Base sheet container style
 * Uses subtle translucent background matching ContractionsHistorySheet
 */
export function getSheetStyle(isNight: boolean): CSSProperties {
  return {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    // Match ContractionsHistorySheet subtle background
    backgroundColor: isNight ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: blur.subtle,
    WebkitBackdropFilter: blur.subtle,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  };
}

/**
 * Sheet header style
 */
export const sheetHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${spacing[2]}px ${spacing[8]}px ${spacing[6]}px`,
};

/**
 * Sheet title style
 */
export function getSheetTitleStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
    color: lineColor,
  };
}

// =============================================================================
// BUTTON STYLES
// =============================================================================

/**
 * Primary button style
 */
export function getPrimaryButtonStyle(lineColor: string, bgColor: string): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.wide,
    color: bgColor,
    backgroundColor: lineColor,
    border: 'none',
    padding: `${spacing[8]}px ${spacing[14]}px`,
    borderRadius: radii.full,
    cursor: 'pointer',
  };
}

/**
 * Secondary button style
 */
export function getSecondaryButtonStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.wide,
    color: lineColor,
    backgroundColor: 'transparent',
    border: `1px solid ${lineColor}${opacity.heavy}`,
    padding: `${spacing[7]}px ${spacing[13]}px`,
    borderRadius: radii.full,
    cursor: 'pointer',
  };
}

/**
 * Ghost button style (no background, subtle)
 */
export function getGhostButtonStyle(lineColor: string): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[5],
    padding: `${spacing[7]}px ${spacing[10]}px`,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
    color: lineColor,
  };
}

/**
 * Icon button style (circular)
 */
export function getIconButtonStyle(lineColor: string, filled = false, isNight = false): CSSProperties {
  return {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: filled ? lineColor : `${lineColor}${opacity.subtle}`,
    border: 'none',
    borderRadius: radii.round,
    cursor: 'pointer',
    color: filled ? (isNight ? '#000' : '#fff') : lineColor,
    opacity: filled ? 1 : 0.6,
  };
}

/**
 * Delete/destructive button style
 */
export const deleteButtonStyle: CSSProperties = {
  fontFamily: fonts.sans,
  fontSize: fontSizes.button,
  fontWeight: fontWeights.medium,
  letterSpacing: letterSpacing.narrow,
  color: '#fff',
  backgroundColor: '#e53935',
  border: 'none',
  padding: `${spacing[6]}px ${spacing[10]}px`,
  borderRadius: radii.full,
  cursor: 'pointer',
};

/**
 * Cancel button style
 */
export function getCancelButtonStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.narrow,
    color: lineColor,
    backgroundColor: `${lineColor}${opacity.subtle}`,
    border: 'none',
    padding: `${spacing[6]}px ${spacing[10]}px`,
    borderRadius: radii.full,
    cursor: 'pointer',
  };
}

// =============================================================================
// TEXT STYLES
// =============================================================================

/**
 * Section heading style (small caps)
 */
export function getSectionHeadingStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.standard,
    color: lineColor,
    opacity: 0.6,
    marginBottom: spacing[6],
  };
}

/**
 * Body text style
 */
export function getBodyTextStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.serif,
    fontSize: fontSizes.small,
    lineHeight: lineHeights.relaxed,
    color: lineColor,
    opacity: 0.8,
  };
}

/**
 * Italic body text style
 */
export function getItalicTextStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.serif,
    fontSize: fontSizes.body,
    fontStyle: 'italic',
    color: lineColor,
    opacity: 0.6,
  };
}

/**
 * Label style (tiny uppercase)
 */
export function getLabelStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.nano,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
    color: lineColor,
    opacity: 0.4,
  };
}

/**
 * Timer display style
 */
export function getTimerStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.serif,
    fontSize: fontSizes.timer,
    fontWeight: fontWeights.light,
    color: lineColor,
    letterSpacing: letterSpacing.tight,
  };
}

/**
 * Monospace code style
 */
export function getCodeStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.mono,
    fontSize: fontSizes.code,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.extraWide,
    color: lineColor,
  };
}

/**
 * Branding text style (M A A Y)
 */
export function getBrandingTextStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.light,
    letterSpacing: letterSpacing.ultraWide,
    color: lineColor,
    opacity: 0.7,
  };
}

/**
 * Breathing guidance text style
 */
export function getBreathingTextStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.serif,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.regular,
    fontStyle: 'italic',
    letterSpacing: letterSpacing.compact,
    color: lineColor,
    opacity: 0.6,
  };
}

/**
 * Hint text style (e.g., "TAP TO END")
 */
export function getHintTextStyle(lineColor: string): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.wide,
    color: lineColor,
    opacity: 0.5,
  };
}

/**
 * Data row value style (used in contraction list)
 */
export function getDataValueStyle(lineColor: string, muted = false): CSSProperties {
  return {
    fontFamily: fonts.serif,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.light,
    color: lineColor,
    opacity: muted ? 0.5 : 1,
  };
}

// =============================================================================
// INPUT STYLES
// =============================================================================

/**
 * Text input style
 */
export function getInputStyle(lineColor: string, hasError = false): CSSProperties {
  return {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xlarge,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.extraWide,
    color: lineColor,
    padding: `${spacing[7]}px ${spacing[9]}px`,
    backgroundColor: `${lineColor}${opacity.whisper}`,
    border: `1px solid ${hasError ? '#e53935' : `${lineColor}${opacity.light}`}`,
    borderRadius: radii.md,
    textAlign: 'center',
    outline: 'none',
  };
}

// =============================================================================
// LAYOUT STYLES
// =============================================================================

/**
 * Centered flex container
 */
export const centeredFlexStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

/**
 * Row with gap
 */
export function getRowStyle(gap = spacing[8]): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap,
  };
}

/**
 * Column with gap
 */
export function getColumnStyle(gap = spacing[10]): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap,
  };
}

/**
 * Divider line
 */
export function getDividerStyle(lineColor: string): CSSProperties {
  return {
    width: '100%',
    maxWidth: 240,
    height: 1,
    backgroundColor: `${lineColor}${opacity.medium}`,
  };
}

// =============================================================================
// TAB STYLES
// =============================================================================

/**
 * Tab toggle container style
 */
export function getTabContainerStyle(lineColor: string): CSSProperties {
  return {
    display: 'flex',
    backgroundColor: lineColor,
    borderRadius: radii.full,
    padding: spacing[1],
  };
}

/**
 * Tab button style
 */
export function getTabButtonStyle(
  isActive: boolean,
  lineColor: string,
  bgColor: string
): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.narrow,
    color: isActive ? lineColor : bgColor,
    backgroundColor: isActive ? bgColor : 'transparent',
    border: 'none',
    padding: `${spacing[6]}px ${spacing[9]}px`,
    borderRadius: radii.full,
    cursor: 'pointer',
    transition: `background-color ${animation.duration.fast}s ${animation.easing.default}`,
  };
}

// =============================================================================
// ANIMATION HELPERS
// =============================================================================

/**
 * Standard spring transition for Framer Motion
 */
export const springTransition = animation.spring.default;

/**
 * Hover/tap scale animation props for Framer Motion
 */
export const scaleAnimationProps = {
  whileHover: { scale: animation.scale.hover },
  whileTap: { scale: animation.scale.tap },
};

/**
 * Slide up animation variants for sheets
 */
export const slideUpVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
};

/**
 * Fade animation variants
 */
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};
