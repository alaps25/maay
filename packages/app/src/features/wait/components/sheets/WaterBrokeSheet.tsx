import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Droplets } from 'lucide-react';
import { TimePicker } from '../../../../components/WheelPicker';
import { SheetDragHandle } from '../SheetDragHandle';
import type { WaterBrokeSheetProps } from '../../types';
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
 * Sheet for adding or editing water broke timestamp
 */
export function WaterBrokeSheet({
  onClose,
  onConfirm,
  onDelete,
  existingTime,
  lineColor,
  isNight,
}: WaterBrokeSheetProps) {
  const theme = getThemeColors(isNight);
  const isEditing = existingTime !== undefined;
  const initialDate = isEditing ? new Date(existingTime) : new Date();
  const [time, setTime] = useState({
    hours: initialDate.getHours(),
    minutes: initialDate.getMinutes(),
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleConfirm = () => {
    const date = new Date();
    date.setHours(time.hours);
    date.setMinutes(time.minutes);
    date.setSeconds(0);
    onConfirm(date.getTime());
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

  const headerTitleStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
    color: lineColor,
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
          <button
            onClick={onClose}
            style={iconButtonCancelStyle}
            aria-label="Cancel"
          >
            <X size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <Droplets size={sizes.iconXs} strokeWidth={sizes.strokeNormal} color={lineColor} />
            <span style={headerTitleStyle}>
              {isEditing ? 'EDIT WATER BROKE' : 'WATER BROKE'}
            </span>
          </div>
          
          <button
            onClick={handleConfirm}
            style={iconButtonSaveStyle}
            aria-label="Confirm"
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
                  backgroundColor: theme.sheetBgSubtle,
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
                    DELETE ENTRY
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
                        onDelete?.();
                        onClose();
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
        
        {/* Content */}
        <div style={{ 
          padding: `${spacing[10]}px ${spacing[8]}px ${spacing[14]}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing[10],
        }}>
          {/* Prompt text - only when adding */}
          {!isEditing && (
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
              When did your water break?
            </span>
          )}
          
          <TimePicker
            hours={time.hours}
            minutes={time.minutes}
            onChange={(hours, minutes) => setTime({ hours, minutes })}
            color={lineColor}
          />
          
          {/* Delete Button - only when editing */}
          {isEditing && onDelete && (
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
                marginTop: spacing[4],
              }}
            >
              <Trash2 size={sizes.iconXs} strokeWidth={sizes.strokeNormal} />
              DELETE ENTRY
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default WaterBrokeSheet;
