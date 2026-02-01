import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { DurationPicker, TimePicker } from '../../../../components/WheelPicker';
import { SheetDragHandle } from '../SheetDragHandle';
import type { AddSheetProps } from '../../types';
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
  animation,
  sizes,
  opacity,
  getThemeColors,
} from '../../../../design';

/**
 * Sheet for adding a new contraction manually
 */
export function AddContractionSheet({
  onClose,
  onAdd,
  lineColor,
  isNight,
}: AddSheetProps) {
  const theme = getThemeColors(isNight);
  const now = new Date();
  const [addDuration, setAddDuration] = useState({ mins: 1, secs: 0 });
  const [addTime, setAddTime] = useState({
    hours: now.getHours(),
    minutes: now.getMinutes(),
  });
  
  const handleAdd = () => {
    const date = new Date();
    date.setHours(addTime.hours);
    date.setMinutes(addTime.minutes);
    date.setSeconds(0);
    
    const durationSecs = addDuration.mins * 60 + addDuration.secs;
    onAdd(date.getTime(), durationSecs);
    onClose();
  };

  // Shared styles
  const backdropStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: colors.backdrop,
    zIndex: zIndex.modalBackdrop,
  };

  const sheetStyle = {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: zIndex.modalContent,
    backgroundColor: theme.sheetBgSubtle,
    backdropFilter: blur.subtle,
    WebkitBackdropFilter: blur.subtle,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  };

  const iconButtonCancelStyle = {
    width: sizes.buttonIcon,
    height: sizes.buttonIcon,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: `${lineColor}${opacity.subtle}`,
    border: 'none',
    borderRadius: radii.round,
    cursor: 'pointer' as const,
    color: lineColor,
    opacity: 0.6,
  };

  const iconButtonSaveStyle = {
    width: sizes.buttonIcon,
    height: sizes.buttonIcon,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: lineColor,
    border: 'none',
    borderRadius: radii.round,
    cursor: 'pointer' as const,
    color: isNight ? '#000' : colors.white,
  };

  const sectionLabelStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.nano,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
    color: lineColor,
    opacity: 0.4,
    marginBottom: spacing[8],
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
          if (info.offset.y > animation.drag.threshold * 2) onClose();
        }}
        transition={animation.spring.default}
        style={sheetStyle}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${spacing[2]}px ${spacing[8]}px ${spacing[6]}px`,
          }}
        >
          <button
            onClick={onClose}
            style={iconButtonCancelStyle}
            aria-label="Cancel"
          >
            <X size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
          </button>
          
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: fontSizes.button,
              fontWeight: fontWeights.medium,
              letterSpacing: letterSpacing.standard,
              color: lineColor,
            }}
          >
            RECORD CONTRACTION
          </span>
          
          <button
            onClick={handleAdd}
            style={iconButtonSaveStyle}
            aria-label="Add"
          >
            <Check size={sizes.iconSm} strokeWidth={sizes.strokeThick} />
          </button>
        </div>
        
        {/* Content */}
        <div style={{ 
          padding: `${spacing[10]}px ${spacing[8]}px ${spacing[14]}px`,
          display: 'flex',
          justifyContent: 'center',
          gap: spacing[14],
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={sectionLabelStyle}>
              TIME
            </div>
            <TimePicker
              hours={addTime.hours}
              minutes={addTime.minutes}
              onChange={(hours, minutes) => setAddTime({ hours, minutes })}
              color={lineColor}
            />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={sectionLabelStyle}>
              DURATION
            </div>
            <DurationPicker
              minutes={addDuration.mins}
              seconds={addDuration.secs}
              onChange={(mins, secs) => setAddDuration({ mins, secs })}
              color={lineColor}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default AddContractionSheet;
