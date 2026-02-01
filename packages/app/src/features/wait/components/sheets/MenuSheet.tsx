import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Users, ArrowUpFromLine, ListX, Activity } from 'lucide-react';
import { SheetDragHandle } from '../SheetDragHandle';
import type { MenuSheetProps } from '../../types';
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
  maxWidths,
  opacity,
  getThemeColors,
} from '../../../../design';

/**
 * Main menu sheet with options for water broke, pair, export, and clear
 */
export function MenuSheet({
  onClose,
  onWaterBroke,
  onExport,
  onPairPartner,
  onLaborPhase,
  onClearAll,
  lineColor,
  isNight,
}: MenuSheetProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const theme = getThemeColors(isNight);
  
  // Shared styles using design tokens
  const backdropStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: colors.backdrop,
    zIndex: zIndex.modalBackdrop,
  };

  const sheetBaseStyle = {
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

  const menuItemStyle = {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[5],
    padding: `${spacing[7]}px ${spacing[10]}px`,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer' as const,
  };

  const menuItemTextStyle = {
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
          ...sheetBaseStyle,
          zIndex: zIndex.modalContent,
        }}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Clear All Confirmation Sheet */}
        <AnimatePresence>
          {showClearConfirm && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowClearConfirm(false)}
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
                  ...sheetBaseStyle,
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
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: fontSizes.button,
                      fontWeight: fontWeights.medium,
                      letterSpacing: letterSpacing.standard,
                      color: lineColor,
                    }}
                  >
                    CLEAR DATA
                  </span>
                  
                  <span
                    style={{
                      fontFamily: fonts.serif,
                      fontSize: fontSizes.body,
                      fontStyle: 'italic',
                      color: lineColor,
                      opacity: 0.6,
                      textAlign: 'center',
                      maxWidth: maxWidths.content,
                    }}
                  >
                    This will remove all recorded contractions. This cannot be undone.
                  </span>
                  
                  <div style={{ display: 'flex', gap: spacing[8], marginTop: spacing[4] }}>
                    <button
                      onClick={() => setShowClearConfirm(false)}
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
                        onClearAll();
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
                      CLEAR ALL
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <div style={{ 
          padding: `${spacing[9]}px ${spacing[8]}px ${spacing[13]}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing[2],
        }}>
          {/* Labor Phase */}
          <button
            onClick={() => {
              onClose();
              onLaborPhase();
            }}
            style={menuItemStyle}
          >
            <Activity size={sizes.iconSm} strokeWidth={sizes.strokeNormal} color={lineColor} />
            <span style={menuItemTextStyle}>
              LABOR PHASE
            </span>
          </button>
          
          {/* Water Broke */}
          <button
            onClick={() => {
              onClose();
              onWaterBroke();
            }}
            style={menuItemStyle}
          >
            <Droplets size={sizes.iconSm} strokeWidth={sizes.strokeNormal} color={lineColor} />
            <span style={menuItemTextStyle}>
              WATER BROKE
            </span>
          </button>
          
          {/* Pair with Partner */}
          <button
            onClick={() => {
              onClose();
              onPairPartner();
            }}
            style={menuItemStyle}
          >
            <Users size={sizes.iconSm} strokeWidth={sizes.strokeNormal} color={lineColor} />
            <span style={menuItemTextStyle}>
              PAIR WITH PARTNER
            </span>
          </button>
          
          {/* Export Data */}
          <button
            onClick={() => {
              onClose();
              onExport();
            }}
            style={menuItemStyle}
          >
            <ArrowUpFromLine size={sizes.iconSm} strokeWidth={sizes.strokeNormal} color={lineColor} />
            <span style={menuItemTextStyle}>
              EXPORT DATA
            </span>
          </button>
          
          {/* Clear Data */}
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              ...menuItemStyle,
              opacity: 0.5,
            }}
          >
            <ListX size={sizes.iconSm} strokeWidth={sizes.strokeNormal} color={lineColor} />
            <span style={menuItemTextStyle}>
              CLEAR DATA
            </span>
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default MenuSheet;
