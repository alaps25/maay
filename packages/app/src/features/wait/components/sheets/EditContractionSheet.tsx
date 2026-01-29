import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2 } from 'lucide-react';
import { DurationPicker, TimePicker } from '../../../../components/WheelPicker';
import { SheetDragHandle } from '../SheetDragHandle';
import type { EditSheetProps } from '../../types';
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
 * Sheet for editing an existing contraction's time and duration
 */
export function EditContractionSheet({
  contraction,
  onClose,
  onSave,
  onDelete,
  lineColor,
  isNight,
}: EditSheetProps) {
  const theme = getThemeColors(isNight);
  
  // Initialize state directly from contraction
  const initialDuration = contraction ? {
    mins: Math.floor((contraction.duration || 0) / 60),
    secs: (contraction.duration || 0) % 60,
  } : { mins: 0, secs: 0 };
  
  const initialTime = contraction ? {
    hours: new Date(contraction.startTime).getHours(),
    minutes: new Date(contraction.startTime).getMinutes(),
  } : { hours: 12, minutes: 0 };
  
  const [editDuration, setEditDuration] = useState(initialDuration);
  const [editTime, setEditTime] = useState(initialTime);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Update when contraction changes (for when sheet stays open but contraction changes)
  useEffect(() => {
    if (contraction) {
      const durationSecs = contraction.duration || 0;
      setEditDuration({
        mins: Math.floor(durationSecs / 60),
        secs: durationSecs % 60,
      });
      
      const date = new Date(contraction.startTime);
      setEditTime({
        hours: date.getHours(),
        minutes: date.getMinutes(),
      });
    }
  }, [contraction?.id]); // Only re-run if contraction ID changes
  
  const handleSave = () => {
    if (!contraction) return;
    
    const newDate = new Date(contraction.startTime);
    newDate.setHours(editTime.hours);
    newDate.setMinutes(editTime.minutes);
    
    onSave(contraction.id, {
      duration: editDuration.mins * 60 + editDuration.secs,
      startTime: newDate.getTime(),
    });
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
    backgroundColor: theme.sheetBgAlt,
    backdropFilter: blur.sheet,
    WebkitBackdropFilter: blur.sheet,
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

  const headerTitleStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
    color: lineColor,
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
  
  if (!contraction) return null;
  
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={backdropStyle}
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
          ...sheetStyle,
          zIndex: zIndex.modalContent,
        }}
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
          {/* X button (cancel) */}
          <button
            onClick={onClose}
            style={iconButtonCancelStyle}
            aria-label="Cancel"
          >
            <X size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
          </button>
          
          <span style={headerTitleStyle}>
            EDIT CONTRACTION
          </span>
          
          {/* Check button (save) */}
          <button
            onClick={handleSave}
            style={iconButtonSaveStyle}
            aria-label="Save"
          >
            <Check size={sizes.iconSm} strokeWidth={sizes.strokeThick} />
          </button>
        </div>
        
        {/* Delete Confirmation Sheet */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  ...backdropStyle,
                  zIndex: zIndex.confirmationBackdrop,
                }}
              />
              {/* Confirmation Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={animation.spring.default}
                style={{
                  ...sheetStyle,
                  zIndex: zIndex.confirmationContent,
                  backgroundColor: theme.sheetBg,
                  padding: `${spacing[6]}px ${spacing[10]}px ${spacing[13]}px`,
                }}
              >
                <SheetDragHandle lineColor={lineColor} />
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing[9],
                  paddingTop: spacing[8],
                }}>
                  <span style={headerTitleStyle}>
                    DELETE RECORDING
                  </span>
                  
                  <span
                    style={{
                      fontFamily: fonts.serif,
                      fontSize: fontSizes.body,
                      fontStyle: 'italic',
                      color: lineColor,
                      opacity: 0.6,
                      textAlign: 'center',
                    }}
                  >
                    This action cannot be undone
                  </span>
                  
                  <div style={{ display: 'flex', gap: spacing[8], marginTop: spacing[4] }}>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
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
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        if (contraction) {
                          onDelete(contraction.id);
                          onClose();
                        }
                      }}
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: fontSizes.button,
                        fontWeight: fontWeights.medium,
                        letterSpacing: letterSpacing.narrow,
                        color: colors.white,
                        backgroundColor: colors.error,
                        border: 'none',
                        padding: `${spacing[6]}px ${spacing[10]}px`,
                        borderRadius: radii.full,
                        cursor: 'pointer',
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Content - Side by side pickers */}
        <div style={{ 
          padding: `${spacing[10]}px ${spacing[8]}px ${spacing[14]}px`,
          display: 'flex',
          justifyContent: 'center',
          gap: spacing[14],
        }}>
          {/* Start Time Section */}
          <div style={{ textAlign: 'center' }}>
            <div style={sectionLabelStyle}>
              TIME
            </div>
            <TimePicker
              hours={editTime.hours}
              minutes={editTime.minutes}
              onChange={(hours, minutes) => setEditTime({ hours, minutes })}
              color={lineColor}
            />
          </div>
          
          {/* Duration Section */}
          <div style={{ textAlign: 'center' }}>
            <div style={sectionLabelStyle}>
              DURATION
            </div>
            <DurationPicker
              minutes={editDuration.mins}
              seconds={editDuration.secs}
              onChange={(mins, secs) => setEditDuration({ mins, secs })}
              color={lineColor}
            />
          </div>
        </div>
        
        {/* Delete Button */}
        <div style={{ 
          padding: `${spacing[4]}px ${spacing[8]}px ${spacing[14]}px`,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[4],
              fontFamily: fonts.sans,
              fontSize: fontSizes.button,
              fontWeight: fontWeights.medium,
              letterSpacing: letterSpacing.narrow,
              color: colors.error,
              backgroundColor: 'transparent',
              border: 'none',
              padding: `${spacing[6]}px ${spacing[9]}px`,
              cursor: 'pointer',
              opacity: 0.8,
            }}
          >
            <Trash2 size={sizes.iconXs} strokeWidth={sizes.strokeNormal} />
            DELETE RECORDING
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default EditContractionSheet;
