import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Sunrise, Flame, Zap } from 'lucide-react';
import { SheetDragHandle } from '../SheetDragHandle';
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

type LaborPhaseOption = 'early' | 'active' | 'transition';

interface LaborPhaseSheetProps {
  onClose: () => void;
  onSelect: (phase: LaborPhaseOption) => void;
  currentPhase: LaborPhaseOption | null;
  lineColor: string;
  isNight: boolean;
}

const PHASE_OPTIONS: { id: LaborPhaseOption; label: string; description: string; icon: typeof Sunrise }[] = [
  { 
    id: 'early', 
    label: 'Early Labor', 
    description: 'Contractions 5-20 min apart • Normal breathing pace',
    icon: Sunrise,
  },
  { 
    id: 'active', 
    label: 'Active Labor', 
    description: 'Contractions 3-5 min apart • Slower breathing pace',
    icon: Flame,
  },
  { 
    id: 'transition', 
    label: 'Transition', 
    description: 'Contractions 2-3 min apart • Slowest breathing pace',
    icon: Zap,
  },
];

/**
 * LaborPhaseSheet - Manual labor phase selection
 * 
 * Allows user to manually set their labor phase, which:
 * - Adjusts breathing guidance pace
 * - Records milestone in contractions history
 */
export function LaborPhaseSheet({
  onClose,
  onSelect,
  currentPhase,
  lineColor,
  isNight,
}: LaborPhaseSheetProps) {
  const theme = getThemeColors(isNight);
  const [selectedPhase, setSelectedPhase] = useState<LaborPhaseOption | null>(currentPhase);

  const handleConfirm = () => {
    if (selectedPhase && selectedPhase !== currentPhase) {
      onSelect(selectedPhase);
    }
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
            style={{
              ...iconButtonStyle,
              opacity: 0.6,
            }}
            aria-label="Cancel"
          >
            <X size={sizes.iconMd} strokeWidth={sizes.strokeNormal} />
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
            LABOR PHASE
          </span>
          
          <button
            onClick={handleConfirm}
            style={{
              ...iconButtonStyle,
              background: selectedPhase && selectedPhase !== currentPhase ? lineColor : `${lineColor}${opacity.subtle}`,
              borderRadius: radii.round,
              opacity: selectedPhase && selectedPhase !== currentPhase ? 1 : 0.4,
            }}
            aria-label="Confirm"
            disabled={!selectedPhase || selectedPhase === currentPhase}
          >
            <Check 
              size={sizes.iconSm} 
              strokeWidth={sizes.strokeThick} 
              color={selectedPhase && selectedPhase !== currentPhase ? (isNight ? '#000' : colors.white) : lineColor}
            />
          </button>
        </div>
        
        {/* Phase Options */}
        <div style={{ 
          padding: `${spacing[4]}px ${spacing[8]}px ${spacing[14]}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[4],
        }}>
          {PHASE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedPhase === option.id;
            const isCurrent = currentPhase === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setSelectedPhase(option.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[6],
                  padding: `${spacing[7]}px ${spacing[8]}px`,
                  background: isSelected ? `${lineColor}${opacity.light}` : `${lineColor}${opacity.faint}`,
                  border: isSelected ? `2px solid ${lineColor}` : '2px solid transparent',
                  borderRadius: radii.md,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: sizes.buttonIcon,
                    height: sizes.buttonIcon,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? lineColor : `${lineColor}${opacity.subtle}`,
                    borderRadius: radii.round,
                  }}
                >
                  <Icon 
                    size={sizes.iconSm} 
                    strokeWidth={sizes.strokeNormal}
                    color={isSelected ? (isNight ? '#000' : colors.white) : lineColor}
                  />
                </div>
                
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                    <span
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: fontSizes.button,
                        fontWeight: fontWeights.medium,
                        color: lineColor,
                      }}
                    >
                      {option.label}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: fontSizes.nano,
                          fontWeight: fontWeights.medium,
                          color: lineColor,
                          opacity: 0.5,
                          textTransform: 'uppercase',
                        }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: fontSizes.caption,
                      color: lineColor,
                      opacity: 0.5,
                    }}
                  >
                    {option.description}
                  </span>
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <Check 
                    size={sizes.iconSm} 
                    strokeWidth={sizes.strokeThick}
                    color={lineColor}
                  />
                )}
              </button>
            );
          })}
          
          {/* Help text */}
          <p
            style={{
              fontFamily: fonts.serif,
              fontSize: fontSizes.small,
              fontStyle: 'italic',
              color: lineColor,
              opacity: 0.5,
              textAlign: 'center',
              marginTop: spacing[6],
            }}
          >
            Changing phase adjusts breathing guidance and records a milestone
          </p>
        </div>
      </motion.div>
    </>
  );
}

export default LaborPhaseSheet;
