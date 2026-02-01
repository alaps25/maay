import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { SheetDragHandle } from '../SheetDragHandle';
import type { AutoEndSheetProps } from '../../types';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
  spacing,
  radii,
  zIndex,
  sizes,
  opacity,
  getThemeColors,
  // DS styles
  getSheetStyle,
  springTransition,
  animation,
} from '../../../../design';

/**
 * Sheet shown when recording exceeds typical contraction duration
 * Prompts user to confirm if contraction has ended
 */
export function AutoEndSheet({
  onClose,
  onConfirmEnd,
  onKeepRecording,
  elapsedSeconds,
  lineColor,
  isNight,
}: AutoEndSheetProps) {
  const theme = getThemeColors(isNight);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const backdropStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: colors.backdrop,
    zIndex: zIndex.modalBackdrop,
  };

  // Use DS sheet style
  const sheetStyle = {
    ...getSheetStyle(isNight),
    zIndex: zIndex.modalContent,
  };

  // Button styles - hug content, caps text
  const cancelButtonStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.narrow,
    color: lineColor,
    backgroundColor: `${lineColor}${opacity.subtle}`,
    border: 'none',
    padding: `${spacing[6]}px ${spacing[10]}px`,
    borderRadius: radii.full,
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[4],
  };

  const primaryButtonStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.narrow,
    color: isNight ? '#000' : colors.white,
    backgroundColor: lineColor,
    border: 'none',
    padding: `${spacing[6]}px ${spacing[10]}px`,
    borderRadius: radii.full,
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[4],
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onKeepRecording}
        style={backdropStyle}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={animation.drag.elastic}
        onDragEnd={(_, info) => {
          if (info.offset.y > animation.drag.threshold * 2) onKeepRecording();
        }}
        transition={springTransition}
        style={sheetStyle}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Content */}
        <div style={{ padding: `${spacing[4]}px ${spacing[8]}px ${spacing[14]}px` }}>
          {/* Question */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: spacing[10],
            }}
          >
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
              Did your contraction end?
            </h3>
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
              Recording for {formatDuration(elapsedSeconds)}
            </p>
          </div>
          
          {/* Buttons - centered, hug content */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: spacing[6],
            }}
          >
            {/* Keep Recording */}
            <button onClick={onKeepRecording} style={cancelButtonStyle}>
              <X size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
              KEEP RECORDING
            </button>
            
            {/* Confirm End */}
            <button onClick={onConfirmEnd} style={primaryButtonStyle}>
              <Check size={sizes.iconSm} strokeWidth={sizes.strokeThick} />
              CONFIRM END
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default AutoEndSheet;
