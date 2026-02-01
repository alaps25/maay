'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ChevronLeft } from 'lucide-react';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
  spacing,
  radii,
  blur,
  zIndex,
  sizes,
  opacity as opacityTokens,
  animation,
  getThemeColors,
} from '../design';

// =============================================================================
// SHEET DRAG HANDLE
// =============================================================================

interface SheetDragHandleProps {
  lineColor: string;
}

function SheetDragHandle({ lineColor }: SheetDragHandleProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: `${spacing[5]}px 0`,
      }}
    >
      <div
        style={{
          width: sizes.dragHandleWidth,
          height: 4,
          borderRadius: radii.full,
          backgroundColor: lineColor,
          opacity: 0.2,
        }}
      />
    </div>
  );
}

// =============================================================================
// SHEET HEADER
// =============================================================================

interface SheetHeaderProps {
  title: string;
  lineColor: string;
  onClose?: () => void;
  onBack?: () => void;
  onSave?: () => void;
  rightAction?: ReactNode;
  showBorder?: boolean;
}

/**
 * SheetHeader - Standard header for sheets
 * 
 * Supports: close button, back button, save button, or custom right action
 */
export function SheetHeader({
  title,
  lineColor,
  onClose,
  onBack,
  onSave,
  rightAction,
  showBorder = false,
}: SheetHeaderProps) {
  const iconButtonStyle = {
    width: sizes.buttonIcon,
    height: sizes.buttonIcon,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer' as const,
    color: lineColor,
    opacity: 0.6,
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${spacing[2]}px ${spacing[8]}px ${spacing[6]}px`,
        borderBottom: showBorder ? `1px solid ${lineColor}${opacityTokens.subtle}` : undefined,
      }}
    >
      {/* Left button */}
      {onBack ? (
        <button onClick={onBack} style={iconButtonStyle} aria-label="Back">
          <ChevronLeft size={sizes.iconMd} />
        </button>
      ) : onClose ? (
        <button onClick={onClose} style={iconButtonStyle} aria-label="Close">
          <X size={sizes.iconMd} strokeWidth={sizes.strokeNormal} />
        </button>
      ) : (
        <div style={{ width: sizes.buttonIcon }} />
      )}

      {/* Title */}
      <span
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: fonts.sans,
          fontSize: fontSizes.button,
          fontWeight: fontWeights.medium,
          letterSpacing: letterSpacing.standard,
          color: lineColor,
        }}
      >
        {title}
      </span>

      {/* Right button */}
      {onSave ? (
        <button
          onClick={onSave}
          style={{
            ...iconButtonStyle,
            background: lineColor,
            borderRadius: radii.round,
            opacity: 1,
          }}
          aria-label="Save"
        >
          <Check size={sizes.iconSm} strokeWidth={sizes.strokeThick} color={colors.white} />
        </button>
      ) : rightAction ? (
        rightAction
      ) : (
        <div style={{ width: sizes.buttonIcon }} />
      )}
    </div>
  );
}

// =============================================================================
// SHEET
// =============================================================================

type SheetVariant = 'modal' | 'dialog';
type SheetBackground = 'default' | 'alt' | 'subtle';

interface SheetProps {
  children: ReactNode;
  onClose: () => void;
  lineColor: string;
  isNight: boolean;
  variant?: SheetVariant;
  background?: SheetBackground;
  /** Fixed height like '85vh', or 'auto' for content-based */
  height?: string;
}

/**
 * Sheet - Reusable bottom sheet component
 * 
 * Variants:
 * - modal: Standard modal sheet with backdrop
 * - dialog: Simple dialog sheet with backdrop (for confirmations, alerts)
 * 
 * Backgrounds:
 * - default: Most opaque (sheetBg)
 * - alt: Slightly less opaque (sheetBgAlt)
 * - subtle: Translucent (sheetBgSubtle)
 */
export function Sheet({
  children,
  onClose,
  lineColor,
  isNight,
  variant = 'modal',
  background = 'subtle',
  height = 'auto',
}: SheetProps) {
  const theme = getThemeColors(isNight);

  // Select background based on prop
  const bgColor = {
    default: theme.sheetBg,
    alt: theme.sheetBgAlt,
    subtle: theme.sheetBgSubtle,
  }[background];

  // Use subtle blur for subtle background, standard for others
  const blurAmount = background === 'subtle' ? blur.subtle : blur.sheet;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: colors.backdrop,
          zIndex: zIndex.modalBackdrop,
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={animation.drag.elastic}
        onDragEnd={(_, info) => {
          if (info.offset.y > animation.drag.threshold * 2) onClose();
        }}
        transition={animation.spring.default}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: height === 'auto' ? undefined : height,
          zIndex: zIndex.modalContent,
          backgroundColor: bgColor,
          backdropFilter: blurAmount,
          WebkitBackdropFilter: blurAmount,
          borderTopLeftRadius: radii.lg,
          borderTopRightRadius: radii.lg,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SheetDragHandle lineColor={lineColor} />
        {children}
      </motion.div>
    </>
  );
}

// =============================================================================
// SHEET CONTENT HELPERS
// =============================================================================

interface SheetContentProps {
  children: ReactNode;
  centered?: boolean;
}

/**
 * SheetContent - Standard content wrapper with padding
 */
export function SheetContent({ children, centered = false }: SheetContentProps) {
  return (
    <div
      style={{
        padding: `${spacing[4]}px ${spacing[8]}px ${spacing[14]}px`,
        ...(centered && {
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          textAlign: 'center' as const,
        }),
      }}
    >
      {children}
    </div>
  );
}

interface SheetTitleProps {
  children: ReactNode;
  lineColor: string;
}

/**
 * SheetTitle - Serif italic title for dialog sheets
 */
export function SheetTitle({ children, lineColor }: SheetTitleProps) {
  return (
    <h3
      style={{
        fontFamily: fonts.serif,
        fontSize: fontSizes.large,
        fontWeight: fontWeights.regular,
        fontStyle: 'italic',
        color: lineColor,
        margin: 0,
        marginBottom: spacing[4],
      }}
    >
      {children}
    </h3>
  );
}

interface SheetSubtitleProps {
  children: ReactNode;
  lineColor: string;
}

/**
 * SheetSubtitle - Sans subtitle with reduced opacity
 */
export function SheetSubtitle({ children, lineColor }: SheetSubtitleProps) {
  return (
    <p
      style={{
        fontFamily: fonts.sans,
        fontSize: fontSizes.small,
        fontWeight: fontWeights.regular,
        color: lineColor,
        opacity: 0.5,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

export default Sheet;
