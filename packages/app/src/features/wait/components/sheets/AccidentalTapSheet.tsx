import React from 'react';
import { motion } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { SheetDragHandle } from '../SheetDragHandle';
import type { AccidentalTapSheetProps } from '../../types';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  zIndex,
  sizes,
  getThemeColors,
  // DS styles
  getSheetStyle,
  getCancelButtonStyle,
  getPrimaryButtonStyle,
  springTransition,
  animation,
} from '../../../../design';

/**
 * Sheet shown when user ends recording in less than 5 seconds
 * Asks if it was an accidental tap
 */
export function AccidentalTapSheet({
  onClose,
  onContinueRecording,
  onEndRecording,
  elapsedSeconds,
  lineColor,
  isNight,
}: AccidentalTapSheetProps) {
  const theme = getThemeColors(isNight);

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

  // Use DS button styles with flex layout modifications
  const cancelButtonStyle = {
    ...getCancelButtonStyle(lineColor),
    flex: 1,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[4],
  };

  const primaryButtonStyle = {
    ...getPrimaryButtonStyle(lineColor, isNight ? '#000' : colors.white),
    flex: 1,
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
        onClick={onEndRecording}
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
          if (info.offset.y > animation.drag.threshold * 2) onEndRecording();
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
              Was that accidental?
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
              Recording ended after {elapsedSeconds} second{elapsedSeconds !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Buttons - using DS styles */}
          <div
            style={{
              display: 'flex',
              gap: spacing[6],
            }}
          >
            {/* End Recording */}
            <button onClick={onEndRecording} style={cancelButtonStyle}>
              <X size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
              End
            </button>
            
            {/* Continue Recording */}
            <button onClick={onContinueRecording} style={primaryButtonStyle}>
              <Play size={sizes.iconSm} strokeWidth={sizes.strokeNormal} fill="currentColor" />
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default AccidentalTapSheet;
