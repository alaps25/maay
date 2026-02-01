import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Share } from 'lucide-react';
import { SheetDragHandle } from '../SheetDragHandle';
import type { PairSheetProps } from '../../types';
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
 * Sheet for pairing with a partner for real-time sync
 */
export function PairSheet({
  onClose,
  lineColor,
  bgColor,
  isNight,
  pairSession,
}: PairSheetProps) {
  const theme = getThemeColors(isNight);
  const {
    isConnected,
    sessionCode,
    myCode,
    createMySession,
    joinPartnerSession,
    leaveSession,
    isSyncing,
  } = pairSession;
  
  const [partnerCode, setPartnerCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasCreatedSession = useRef(false);
  
  // Reset hasCreatedSession when sessionCode becomes null (after unpair)
  useEffect(() => {
    if (!sessionCode) {
      hasCreatedSession.current = false;
    }
  }, [sessionCode]);
  
  // Create session when sheet opens (so code is ready to share) - only once per session
  useEffect(() => {
    if (!hasCreatedSession.current && !isConnected && !sessionCode && myCode) {
      hasCreatedSession.current = true;
      createMySession();
    }
  }, [isConnected, sessionCode, myCode, createMySession]);
  
  const handleShare = useCallback(() => {
    const codeToShare = sessionCode || myCode;
    if (navigator.share) {
      navigator.share({
        title: 'Join me on MAAY',
        text: `Use code ${codeToShare} to track contractions together`,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(codeToShare);
    }
  }, [sessionCode, myCode]);
  
  const handleJoin = useCallback(async () => {
    if (partnerCode.length !== 6) return;
    
    setError(null);
    const success = await joinPartnerSession(partnerCode);
    
    if (success) {
      setShowSuccess(true);
      // Don't auto-close - the UI will update to show "PAIRED" state
    } else {
      setError('Invalid or expired code');
    }
  }, [partnerCode, joinPartnerSession]);

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

  const sectionLabelStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.medium,
    color: lineColor,
    opacity: 0.4,
    display: 'block' as const,
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
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${spacing[8]}px ${spacing[9]}px ${spacing[6]}px`,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              ...iconButtonStyle,
              opacity: 0.6,
            }}
            aria-label="Close"
          >
            <X size={sizes.iconMd} strokeWidth={sizes.strokeNormal} />
          </button>
          
          {/* Title */}
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: fontSizes.button,
              fontWeight: fontWeights.medium,
              letterSpacing: letterSpacing.standard,
              color: lineColor,
            }}
          >
            PAIR WITH PARTNER
          </span>
          
          {/* Share button */}
          <button
            onClick={handleShare}
            style={iconButtonStyle}
            aria-label="Share code"
          >
            <Share size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
          </button>
        </div>
        
        {/* Content */}
        <div style={{ 
          padding: `${spacing[4]}px ${spacing[12]}px ${spacing[13]}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing[10],
        }}>
          {/* Session Code Section */}
          <div style={{ textAlign: 'center' }}>
            <span style={sectionLabelStyle}>
              {isConnected ? 'PAIRED' : 'SESSION CODE'}
              {isConnected && <span style={{ opacity: 0.6, fontSize: fontSizes.nano, marginLeft: spacing[3] }}>• SYNCING</span>}
              {!isConnected && sessionCode && <span style={{ opacity: 0.6, fontSize: fontSizes.nano, marginLeft: spacing[3] }}>• READY</span>}
            </span>
            
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSizes.code,
                fontWeight: fontWeights.semibold,
                letterSpacing: letterSpacing.extraWide,
                color: lineColor,
                padding: `${spacing[8]}px ${spacing[11]}px`,
                backgroundColor: `${lineColor}${opacity.faint}`,
                borderRadius: radii.md,
                marginTop: -spacing[6],
                marginBottom: -spacing[10],
                position: 'relative',
              }}
            >
              {isSyncing || !myCode ? '...' : (sessionCode || myCode)}
            </div>
          </div>
          
          {isConnected ? (
            // Joined partner's session - show unpair option
            <>
              <p style={{
                fontFamily: fonts.sans,
                fontSize: fontSizes.button,
                color: lineColor,
                opacity: 0.5,
                textAlign: 'center',
                lineHeight: 1.6,
                maxWidth: maxWidths.contentMd,
              }}>
                Contractions sync automatically between paired devices
              </p>
              
              <motion.button
                onClick={() => leaveSession()}
                whileHover={{ scale: animation.scale.hover }}
                whileTap={{ scale: animation.scale.tap }}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: fontSizes.button,
                  fontWeight: fontWeights.semibold,
                  letterSpacing: letterSpacing.wide,
                  color: colors.error,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.error}30`,
                  padding: `${spacing[7]}px ${spacing[13]}px`,
                  borderRadius: radii.full,
                  cursor: 'pointer',
                }}
              >
                UNPAIR
              </motion.button>
            </>
          ) : (
            // Not paired yet - show share code + join option
            <>
              <p style={{
                fontFamily: fonts.sans,
                fontSize: fontSizes.caption,
                color: lineColor,
                opacity: 0.4,
                textAlign: 'center',
                maxWidth: maxWidths.contentSm,
                lineHeight: 1.5,
              }}>
                Share your code with partner, or enter their code below
              </p>
              
              {/* Divider */}
              <div
                style={{
                  width: '100%',
                  maxWidth: maxWidths.contentMd,
                  height: 1,
                  backgroundColor: `${lineColor}${opacity.medium}`,
                }}
              />
              
              {/* Partner Code Section */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%', 
                maxWidth: maxWidths.content,
              }}>
                <span
                  style={{
                    ...sectionLabelStyle,
                    marginBottom: spacing[4],
                  }}
                >
                  PARTNER'S CODE
                </span>
                
                {showSuccess ? (
                  <div style={{ padding: `${spacing[9]}px 0` }}>
                    <Check size={sizes.buttonIcon} color={lineColor} style={{ opacity: 0.8 }} />
                    <p style={{
                      fontFamily: fonts.sans,
                      fontSize: fontSizes.button,
                      color: lineColor,
                      opacity: 0.6,
                      marginTop: spacing[4],
                    }}>
                      Connected!
                    </p>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={partnerCode}
                      onChange={(e) => {
                        setPartnerCode(e.target.value.toUpperCase().slice(0, 6));
                        setError(null);
                      }}
                      placeholder="XXXXXX"
                      maxLength={6}
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: fontSizes.xlarge,
                        fontWeight: fontWeights.semibold,
                        letterSpacing: letterSpacing.extraWide,
                        color: lineColor,
                        padding: `${spacing[7]}px ${spacing[9]}px`,
                        backgroundColor: `${lineColor}${opacity.whisper}`,
                        border: `1px solid ${error ? colors.error : `${lineColor}${opacity.light}`}`,
                        borderRadius: radii.md,
                        textAlign: 'center',
                        width: '100%',
                        maxWidth: maxWidths.input,
                        outline: 'none',
                      }}
                    />
                    
                    {error && (
                      <p style={{
                        fontFamily: fonts.sans,
                        fontSize: fontSizes.caption,
                        color: colors.error,
                        marginTop: spacing[4],
                      }}>
                        {error}
                      </p>
                    )}
                    
                    <motion.button
                      onClick={handleJoin}
                      whileHover={{ scale: animation.scale.hover }}
                      whileTap={{ scale: animation.scale.tap }}
                      disabled={partnerCode.length !== 6 || isSyncing}
                      style={{
                        marginTop: spacing[8],
                        fontFamily: fonts.sans,
                        fontSize: fontSizes.button,
                        fontWeight: fontWeights.semibold,
                        letterSpacing: letterSpacing.wide,
                        color: partnerCode.length === 6 ? bgColor : lineColor,
                        backgroundColor: partnerCode.length === 6 ? lineColor : 'transparent',
                        border: partnerCode.length === 6 ? 'none' : `1px solid ${lineColor}${opacity.medium}`,
                        padding: `${spacing[7]}px ${spacing[13]}px`,
                        borderRadius: radii.full,
                        cursor: partnerCode.length === 6 ? 'pointer' : 'not-allowed',
                        opacity: partnerCode.length === 6 ? 1 : 0.3,
                      }}
                    >
                      {isSyncing ? '...' : 'JOIN'}
                    </motion.button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default PairSheet;
