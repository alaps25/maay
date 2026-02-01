import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SheetDragHandle } from '../SheetDragHandle';
import type { ExportSheetProps, ExportCount } from '../../types';
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
  maxWidths,
  getThemeColors,
} from '../../../../design';

/**
 * Sheet for exporting/sharing contraction data
 */
export function ExportSheet({
  onClose,
  contractions,
  lineColor,
  isNight,
}: ExportSheetProps) {
  const theme = getThemeColors(isNight);
  const [selectedCount, setSelectedCount] = useState<ExportCount | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${secs}s`;
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const generateExportText = (count: ExportCount) => {
    const entriesToExport = count === 'all' 
      ? contractions 
      : contractions.slice(0, count);
    
    const lines = ['CONTRACTION TRACKING REPORT', ''];
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Total entries: ${entriesToExport.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    
    entriesToExport.forEach((entry, index) => {
      if (entry.type === 'water_broke') {
        lines.push(`${index + 1}. WATER BROKE`);
        lines.push(`   Time: ${formatTime(entry.startTime)}`);
      } else {
        lines.push(`${index + 1}. Contraction`);
        lines.push(`   Time: ${formatTime(entry.startTime)}`);
        lines.push(`   Duration: ${formatDuration(entry.duration)}`);
      }
      lines.push('');
    });
    
    return lines.join('\n');
  };
  
  const handleExport = async (count: ExportCount) => {
    setSelectedCount(count);
    setIsSharing(true);
    
    const exportText = generateExportText(count);
    
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Contraction Tracking Report',
          text: exportText,
        });
        onClose();
      } catch (err) {
        // User cancelled or share failed, try download
        downloadAsFile(exportText);
      }
    } else {
      // Fallback to download
      downloadAsFile(exportText);
    }
    
    setIsSharing(false);
  };
  
  const downloadAsFile = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contractions-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };
  
  const countOptions: { value: ExportCount; label: string }[] = [
    { value: 10, label: 'LAST 10 ENTRIES' },
    { value: 20, label: 'LAST 20 ENTRIES' },
    { value: 50, label: 'LAST 50 ENTRIES' },
    { value: 'all', label: `ALL ENTRIES (${contractions.length})` },
  ];

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
              width: sizes.buttonIcon,
              height: sizes.buttonIcon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${lineColor}${opacity.subtle}`,
              border: 'none',
              borderRadius: radii.round,
              cursor: 'pointer',
              color: lineColor,
              opacity: 0.6,
            }}
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
            EXPORT DATA
          </span>
          
          {/* Empty space for balance */}
          <div style={{ width: sizes.buttonIcon }} />
        </div>
        
        {/* Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: spacing[8] }}>
          <span
            style={{
              fontFamily: fonts.serif,
              fontSize: fontSizes.body,
              fontStyle: 'italic',
              color: lineColor,
              opacity: 0.6,
            }}
          >
            Choose how many entries to export
          </span>
        </div>
        
        {/* Options - only show options that are possible */}
        <div style={{ 
          padding: `${spacing[4]}px ${spacing[8]}px ${spacing[13]}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing[4],
        }}>
          {countOptions
            .filter((option) => option.value === 'all' || contractions.length >= option.value)
            .map((option) => (
            <button
              key={option.value}
              onClick={() => handleExport(option.value)}
              disabled={isSharing}
              style={{
                width: '100%',
                maxWidth: maxWidths.content,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[5],
                padding: `${spacing[7]}px ${spacing[10]}px`,
                background: selectedCount === option.value ? `${lineColor}${opacity.light}` : `${lineColor}${opacity.faint}`,
                border: 'none',
                borderRadius: radii.md,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: fontSizes.button,
                  fontWeight: fontWeights.medium,
                  letterSpacing: letterSpacing.standard,
                  color: lineColor,
                }}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}

export default ExportSheet;
