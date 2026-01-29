import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Plus, Droplets } from 'lucide-react';
import { SheetDragHandle } from './SheetDragHandle';
import { WavyBorder } from './WavyBorder';
import type { ContractionData } from '../types';
import type { WavyBorderParams } from '../constants';
import {
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
  viewportHeights,
  opacity,
  shadows,
  getThemeColors,
} from '../../../design';

interface ContractionsHistorySheetProps {
  contractions: ContractionData[];
  sheetExpanded: boolean;
  onSheetDragEnd: (event: unknown, info: { offset: { y: number }; velocity: { y: number } }) => void;
  onMenuOpen: () => void;
  onAddOpen: () => void;
  onEditContraction: (id: string) => void;
  onEditWaterBroke: (id: string) => void;
  lineColor: string;
  isNight: boolean;
  dimensions: { width: number; height: number };
  wavyParams: WavyBorderParams;
}

/**
 * iOS-style bottom sheet showing contractions history
 */
export function ContractionsHistorySheet({
  contractions,
  sheetExpanded,
  onSheetDragEnd,
  onMenuOpen,
  onAddOpen,
  onEditContraction,
  onEditWaterBroke,
  lineColor,
  isNight,
  dimensions,
  wavyParams,
}: ContractionsHistorySheetProps) {
  const theme = getThemeColors(isNight);
  
  const formatDuration = useCallback((seconds: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }, []);
  
  // Calculate interval between current contraction and the one before it (chronologically)
  // contractions is sorted newest-first, so "previous" is at index + 1
  const getInterval = useCallback((index: number) => {
    if (index >= contractions.length - 1) return null; // Last (oldest) item has no interval
    const current = contractions[index];
    const previous = contractions[index + 1]; // Previous chronologically = next in array (since newest-first)
    // Interval = time from end of previous contraction to start of current
    const interval = (current.startTime - ((previous.endTime || previous.startTime))) / 1000 / 60;
    return Math.round(interval * 10) / 10;
  }, [contractions]);

  // Style objects
  const headerLabelStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.nano,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.standard,
    color: lineColor,
    opacity: 0.5,
  };

  const dataValueStyle = {
    fontFamily: fonts.serif,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.light,
    color: lineColor,
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
    <motion.section
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={animation.drag.elastic}
      onDragEnd={onSheetDragEnd}
      transition={animation.spring.default}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: zIndex.historySheet,
        height: contractions.length === 0 
          ? viewportHeights.sheetMinimal 
          : (sheetExpanded ? viewportHeights.sheetExpanded : viewportHeights.sheetCollapsed),
        transition: `height ${animation.duration.normal}s ${animation.easing.out}`,
        backgroundColor: theme.sheetBgSubtle,
        backdropFilter: blur.subtle,
        WebkitBackdropFilter: blur.subtle,
        borderTopLeftRadius: radii.lg,
        borderTopRightRadius: radii.lg,
        boxShadow: shadows.sheet(lineColor),
        display: 'flex',
        flexDirection: 'column',
      }}
      aria-label="Contractions history"
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
        {/* 3-dot menu button */}
        <button
          onClick={onMenuOpen}
          style={{
            ...iconButtonStyle,
            opacity: 0.6,
          }}
          aria-label="More options"
        >
          <MoreVertical size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
        </button>
        
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: fontSizes.button,
            fontWeight: fontWeights.medium,
            letterSpacing: letterSpacing.standard,
            color: lineColor,
            opacity: contractions.length === 0 ? 0.4 : 1,
          }}
        >
          {contractions.length === 0 ? 'NO CONTRACTIONS' : 'CONTRACTIONS'}
        </span>
        
        {/* Plus button */}
        <button
          onClick={onAddOpen}
          style={iconButtonStyle}
          aria-label="Add contraction"
        >
          <Plus size={sizes.iconSm} strokeWidth={sizes.strokeThick} />
        </button>
      </div>
      
      {/* Content wrapper */}
      <div
        style={{
          padding: `0px 0px ${spacing[10]}px`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header row - only show when there are entries */}
        {contractions.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span style={headerLabelStyle}>DURATION</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={headerLabelStyle}>INTERVAL</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={headerLabelStyle}>TIME</span>
            </div>
          </div>
        )}
        
        {/* Data rows - tap to edit */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {contractions.map((contraction, idx) => {
            const interval = getInterval(idx);
            const startDate = new Date(contraction.startTime);
            const isWaterBroke = contraction.type === 'water_broke';
            
            // Special row for water broke with animated wavy border
            if (isWaterBroke) {
              return (
                <div
                  key={contraction.id}
                  onClick={() => onEditWaterBroke(contraction.id)}
                  style={{
                    margin: `${spacing[4]}px ${spacing[6]}px`,
                    padding: `${spacing[6]}px 0px`,
                    borderRadius: radii.md,
                    cursor: 'pointer',
                    background: `${lineColor}${opacity.ghost}`,
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    alignItems: 'center',
                  }}
                >
                  {/* Animated wavy border */}
                  <WavyBorder 
                    width={dimensions.width - spacing[10]} 
                    height={52} 
                    color={lineColor}
                    radius={60}
                    params={wavyParams}
                  />
                  
                  {/* Icon + Label */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: spacing[4],
                  }}>
                    <Droplets size={sizes.iconSm} strokeWidth={sizes.strokeNormal} color={lineColor} style={{ opacity: 0.5 }} />
                    <span style={{
                      fontFamily: fonts.serif,
                      fontSize: fontSizes.small,
                      fontWeight: fontWeights.regular,
                      fontStyle: 'italic',
                      color: lineColor,
                      opacity: 0.6,
                    }}>
                      Water broke
                    </span>
                  </div>
                  
                  {/* Empty middle column for alignment */}
                  <div />
                  
                  {/* Time - matching contraction row typography */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ ...dataValueStyle, opacity: 0.5 }}>
                      {startDate.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              );
            }
            
            // Regular contraction row
            return (
              <div
                key={contraction.id}
                onClick={() => onEditContraction(contraction.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  cursor: 'pointer',
                }}
              >
                <div style={{ padding: `${spacing[7]}px ${spacing[6]}px`, textAlign: 'center' }}>
                  <span style={dataValueStyle}>
                    {formatDuration(contraction.duration)}
                  </span>
                </div>
                <div style={{ padding: `${spacing[7]}px ${spacing[6]}px`, textAlign: 'center' }}>
                  <span style={dataValueStyle}>
                    {interval ? `${interval}m` : '—'}
                  </span>
                </div>
                <div style={{ padding: `${spacing[7]}px ${spacing[6]}px`, textAlign: 'center' }}>
                  <span style={{ ...dataValueStyle, opacity: 0.5 }}>
                    {startDate.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export default ContractionsHistorySheet;
