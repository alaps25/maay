'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import { OrganicWaves, type BreathPhase, type WaveParams } from '../../components/vector/OrganicWaves';
import { CelebrationAnimation, type CelebrationPhase } from '../../components/vector/CelebrationAnimation';
import { useContractionStore } from '../../stores/contractionStore';
import { useAppStore } from '../../stores/appStore';
import { useHaptics } from '../../hooks/useHaptics';
import { usePairSession } from '../../hooks/usePairSession';
import { framerSpring } from '../../components/vector/spring';
import { t } from '../../i18n';

// Import extracted components
import {
  SheetDragHandle,
  ContractionsHistorySheet,
  EditContractionSheet,
  AddContractionSheet,
  WaterBrokeSheet,
  MenuSheet,
  PairSheet,
  ExportSheet,
  AboutSheet,
  WavyBorderControls,
  BirthWaveControls,
} from './components';

// Import constants and types
import { INHALE_DURATION, EXHALE_DURATION, CYCLE_DURATION, wavyBorderParams } from './constants';
import type { WaitScreenProps, Tab } from './types';

// Import design system
import {
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
  lineHeights,
  spacing,
  radii,
  zIndex,
  animation,
  sizes,
  maxWidths,
  colors,
  getThemeColors,
} from '../../design';

/**
 * THE WAIT Screen - Organic UI
 * 
 * - Smooth organic rings with heartbeat pulse (always on)
 * - Inner rings are circular, outer rings are wavy + blurred
 * - Entire area is clickable to record
 * - During recording: breathing guidance helps manage contraction
 */
export function WaitScreen({ 
  locale = 'en',
  onBabyArrived 
}: WaitScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('contractions');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWaterBrokeId, setEditingWaterBrokeId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showWaterBrokeSheet, setShowWaterBrokeSheet] = useState(false);
  const [showAboutSheet, setShowAboutSheet] = useState(false);
  const [showPairSheet, setShowPairSheet] = useState(false);
  
  // Pair session for real-time sync with partner
  const pairSession = usePairSession();
  
  // Celebration states
  const [celebrationPhase, setCelebrationPhase] = useState<CelebrationPhase>('idle');
  const [showCelebrationContent, setShowCelebrationContent] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showWavyControls, setShowWavyControls] = useState(false);
  const [wavyParams, setWavyParams] = useState(wavyBorderParams);
  
  // Birth page wave controls (press B on birth tab)
  const [showBirthControls, setShowBirthControls] = useState(false);
  const [birthWaveParams, setBirthWaveParams] = useState<Partial<WaveParams>>({
    flowSpeed: 0.24,
    timeScale: 10,
  });
  
  // Welcome state - check if user has begun using the app
  // Start with true to avoid hydration mismatch, then check localStorage in useEffect
  const [hasBegun, setHasBegun] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Check localStorage after hydration
  useEffect(() => {
    const begun = localStorage.getItem('maay-has-begun') === 'true';
    setHasBegun(begun);
    setIsHydrated(true);
  }, []);
  
  // Handle BEGIN button click
  const handleBegin = useCallback(() => {
    localStorage.setItem('maay-has-begun', 'true');
    setHasBegun(true);
  }, []);
  
  // Key listener for wavy border controls (W key) and birth controls (B key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.metaKey || e.ctrlKey) return;
      
      const key = e.key.toLowerCase();
      if (key === 'w') {
        setShowWavyControls(prev => !prev);
        setShowBirthControls(false);
      } else if (key === 'b' && activeTab === 'birth') {
        setShowBirthControls(prev => !prev);
        setShowWavyControls(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);
  
  // Refs
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathCycleStart = useRef<number>(0);
  
  // Store and hooks
  const contractions = useContractionStore((s) => s.contractions);
  const { startContraction, endContraction, updateContraction, deleteContraction, addContraction, addWaterBroke, clearAll } = useContractionStore();
  const isNight = useAppStore((s) => s.isNightTime);
  const { trigger } = useHaptics();
  
  const translations = t(locale);
  const theme = getThemeColors(isNight);
  const lineColor = theme.line;
  const bgColor = theme.bg;
  
  // Get window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Timer and breathing cycle
  useEffect(() => {
    if (isRecording && startTimeRef.current) {
      breathCycleStart.current = Date.now();
      
      timerRef.current = setInterval(() => {
        // Update elapsed time
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current!) / 1000));
        
        // Update breathing phase (simple inhale/exhale cycle - no hold)
        const cycleElapsed = (Date.now() - breathCycleStart.current) % CYCLE_DURATION;
        
        if (cycleElapsed < INHALE_DURATION) {
          setBreathPhase('inhale');
          setBreathProgress(cycleElapsed / INHALE_DURATION);
        } else {
          setBreathPhase('exhale');
          setBreathProgress((cycleElapsed - INHALE_DURATION) / EXHALE_DURATION);
        }
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedTime(0);
      setBreathPhase('inhale');
      setBreathProgress(0);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);
  
  // Haptic feedback on breath phase change
  useEffect(() => {
    if (!isRecording) return;
    
    if (breathPhase === 'inhale' && breathProgress < 0.05) {
      trigger('inhale');
    } else if (breathPhase === 'exhale' && breathProgress < 0.05) {
      trigger('exhale');
    }
  }, [breathPhase, breathProgress, isRecording, trigger]);
  
  const handleRecordPress = useCallback(() => {
    if (activeTab !== 'contractions') return;
    if (!hasBegun) return; // Don't allow recording before BEGIN is clicked
    
    if (isRecording) {
      // Stop recording
      const duration = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
        : 0;
      
      setIsRecording(false);
      startTimeRef.current = null;
      trigger('success');
      
      // Get the active contraction before ending (for sync)
      const activeContraction = useContractionStore.getState().activeContraction;
      endContraction();
      
      // Sync to Firebase if paired
      if (activeContraction && pairSession.sessionCode) {
        const endTime = Date.now();
        const finalDuration = Math.round((endTime - activeContraction.startTime) / 1000);
        pairSession.syncContraction({
          id: activeContraction.id,
          startTime: activeContraction.startTime,
          duration: finalDuration,
          type: 'contraction',
        });
      }
    } else {
      // Start recording
      setIsRecording(true);
      setSheetExpanded(false); // Reset to collapsed state for when recording ends
      startTimeRef.current = Date.now();
      breathCycleStart.current = Date.now();
      trigger('tap');
      startContraction();
    }
  }, [isRecording, activeTab, trigger, startContraction, endContraction, hasBegun, pairSession]);
  
  const handleBabyArrived = useCallback(() => {
    trigger('success');
    setCelebrationPhase('dissolving');
  }, [trigger]);
  
  const handleDissolveComplete = useCallback(() => {
    setCelebrationPhase('complete');
    setTimeout(() => setShowCelebrationContent(true), 300);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getBreathText = () => {
    switch (breathPhase) {
      case 'inhale': return 'breathe in';
      case 'exhale': return 'breathe out';
    }
  };
  
  // All contractions, newest first (sort to ensure consistent order regardless of source)
  const allContractions = [...contractions].sort((a, b) => b.startTime - a.startTime);
  
  // Bottom sheet drag end handler - snap to expanded or collapsed state
  const handleSheetDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    const threshold = 50;
    const velocityThreshold = 500;
    
    // Use velocity for quick swipes, position for slow drags
    if (Math.abs(info.velocity.y) > velocityThreshold) {
      // Fast swipe - use velocity direction
      setSheetExpanded(info.velocity.y < 0);
    } else {
      // Slow drag - use position
      if (sheetExpanded) {
        // If expanded, drag down to collapse
        if (info.offset.y > threshold) {
          setSheetExpanded(false);
        }
      } else {
        // If collapsed, drag up to expand
        if (info.offset.y < -threshold) {
          setSheetExpanded(true);
        }
      }
    }
  }, [sheetExpanded]);

  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        backgroundColor: bgColor,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Organic flowing rings with heartbeat - Press 'S' for controls, 'B' on birth tab */}
      {celebrationPhase === 'idle' ? (
        <OrganicWaves
          state={isRecording ? 'recording' : 'idle'}
          breathPhase={breathPhase}
          breathProgress={breathProgress}
          width={dimensions.width}
          height={dimensions.height}
          strokeWidth={1.2}
          color={lineColor}
          externalParams={activeTab === 'birth' ? birthWaveParams : undefined}
          enableHeartbeat={activeTab !== 'birth'}
        />
      ) : (
        <CelebrationAnimation
          phase={celebrationPhase}
          onDissolveComplete={handleDissolveComplete}
          width={dimensions.width}
          height={dimensions.height}
          strokeWidth={1.2}
          color={lineColor}
        />
      )}
      
      {/* Top Navigation Pill - hides during recording, before BEGIN, and during celebration */}
      <motion.nav
        className="safe-area-top-extra"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: (isHydrated && !hasBegun) || isRecording || celebrationPhase !== 'idle' ? 0 : 1, 
          y: (isHydrated && !hasBegun) || isRecording || celebrationPhase !== 'idle' ? -60 : 0 
        }}
        transition={animation.spring.default}
        style={{
          position: 'relative',
          zIndex: zIndex.navigation,
          display: 'flex',
          justifyContent: 'center',
          padding: `${spacing[10]}px ${spacing[10]}px 0`,
          pointerEvents: (isHydrated && !hasBegun) || isRecording || celebrationPhase !== 'idle' ? 'none' : 'auto',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          style={{
            display: 'flex',
            backgroundColor: lineColor,
            borderRadius: radii.full,
            padding: spacing[1],
          }}
        >
          <button
            onClick={() => setActiveTab('contractions')}
            aria-pressed={activeTab === 'contractions'}
            style={{
              fontFamily: fonts.sans,
              fontSize: fontSizes.button,
              fontWeight: fontWeights.medium,
              letterSpacing: letterSpacing.narrow,
              color: activeTab === 'contractions' ? lineColor : bgColor,
              backgroundColor: activeTab === 'contractions' ? bgColor : 'transparent',
              border: 'none',
              padding: `${spacing[6]}px ${spacing[9]}px`,
              borderRadius: radii.full,
              cursor: 'pointer',
              transition: `all ${animation.duration.normal}s ${animation.easing.default}`,
            }}
          >
            THE WAIT
          </button>
          <button
            onClick={() => setActiveTab('birth')}
            aria-pressed={activeTab === 'birth'}
            style={{
              fontFamily: fonts.sans,
              fontSize: fontSizes.button,
              fontWeight: fontWeights.medium,
              letterSpacing: letterSpacing.narrow,
              color: activeTab === 'birth' ? lineColor : bgColor,
              backgroundColor: activeTab === 'birth' ? bgColor : 'transparent',
              border: 'none',
              padding: `${spacing[6]}px ${spacing[9]}px`,
              borderRadius: radii.full,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              transition: `all ${animation.duration.normal}s ${animation.easing.default}`,
            }}
          >
            BIRTH <span aria-hidden="true">→</span>
          </button>
        </div>
      </motion.nav>
      
      {/* About/Help Button - Top Left */}
      <motion.button
        className="safe-area-fixed-top"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: (isHydrated && !hasBegun) || isRecording || celebrationPhase !== 'idle' ? 0 : 0.5, 
        }}
        whileHover={{ opacity: 0.8 }}
        transition={{ duration: animation.duration.normal }}
        onClick={() => setShowAboutSheet(true)}
        style={{
          position: 'fixed',
          top: spacing[11],
          left: spacing[9],
          zIndex: zIndex.helpButton,
          width: sizes.buttonIcon,
          height: sizes.buttonIcon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: lineColor,
          pointerEvents: (isHydrated && !hasBegun) || isRecording || celebrationPhase !== 'idle' ? 'none' : 'auto',
        }}
        aria-label="About Maay"
      >
        <CircleHelp size={sizes.iconLg} strokeWidth={sizes.strokeMedium} />
      </motion.button>
      
      {/* Main Interactive Area - ENTIRE SPACE CLICKABLE */}
      <AnimatePresence mode="wait">
        {activeTab === 'contractions' ? (
          <motion.button
            key="contractions-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRecordPress}
            aria-label={isRecording 
              ? `Recording contraction: ${formatTime(elapsedTime)}. ${getBreathText()}. Tap to end.` 
              : hasBegun 
                ? 'Tap anywhere to start recording contraction'
                : 'Press BEGIN to start using the app'
            }
            aria-pressed={isRecording}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
              background: 'transparent',
              border: 'none',
              cursor: hasBegun ? 'pointer' : 'default',
              padding: 0,
              margin: 0,
            }}
          >
            {/* Center Content - absolutely centered on screen */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div
                    key="recording"
                    initial={{ opacity: 0, scale: animation.scale.exit }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: animation.scale.exit }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: spacing[8],
                    }}
                  >
                    {/* Timer */}
                    <span
                      style={{
                        fontFamily: fonts.serif,
                        fontSize: fontSizes.timer,
                        fontWeight: fontWeights.light,
                        color: lineColor,
                        letterSpacing: letterSpacing.tight,
                      }}
                    >
                      {formatTime(elapsedTime)}
                    </span>
                    
                    {/* Breathing guidance */}
                    <motion.span
                      key={breathPhase}
                      initial={{ opacity: 0, y: spacing[5] }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -spacing[5] }}
                      style={{
                        fontFamily: fonts.serif,
                        fontSize: fontSizes.large,
                        fontWeight: fontWeights.regular,
                        fontStyle: 'italic',
                        color: lineColor,
                        opacity: 0.6,
                        letterSpacing: letterSpacing.compact,
                      }}
                    >
                      {getBreathText()}
                    </motion.span>
                    
                    {/* Tap to end hint */}
                    <span
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: fontSizes.micro,
                        fontWeight: fontWeights.regular,
                        letterSpacing: letterSpacing.wide,
                        color: lineColor,
                        opacity: 0.5,
                        marginTop: spacing[10],
                      }}
                    >
                      TAP TO END
                    </span>
                  </motion.div>
                ) : (
                  <motion.span
                    key={(!isHydrated || hasBegun) ? "idle-add" : "idle-maay"}
                    initial={{ opacity: 0, scale: animation.scale.exit }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: animation.scale.exit }}
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: (isHydrated && !hasBegun) ? fontSizes.large : fontSizes.small,
                      fontWeight: (isHydrated && !hasBegun) ? fontWeights.light : fontWeights.regular,
                      letterSpacing: letterSpacing.ultraWide,
                      color: lineColor,
                      opacity: (isHydrated && !hasBegun) ? 0.7 : 0.5,
                    }}
                  >
                    {(isHydrated && !hasBegun) ? 'M A A Y' : 'R E C O R D'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        ) : celebrationPhase === 'idle' ? (
          <motion.div
            key="birth-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: zIndex.content,
              padding: spacing[12],
              marginTop: -spacing[13], // Offset to visually center (compensate for nav bar)
            }}
          >
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: fontSizes.large,
                fontStyle: 'italic',
                color: lineColor,
                opacity: 0.5,
                textAlign: 'center',
                maxWidth: maxWidths.content,
                marginBottom: spacing[6],
                lineHeight: lineHeights.normal,
              }}
            >
              This is it?
            </p>
            
            <motion.button
              onClick={handleBabyArrived}
              whileHover={{ scale: animation.scale.hover }}
              whileTap={{ scale: animation.scale.tap }}
              transition={framerSpring}
              style={{
                fontFamily: fonts.sans,
                fontSize: fontSizes.button,
                fontWeight: fontWeights.semibold,
                letterSpacing: letterSpacing.wide,
                color: bgColor,
                backgroundColor: lineColor,
                border: 'none',
                padding: `${spacing[8]}px ${spacing[14]}px`,
                borderRadius: radii.full,
                cursor: 'pointer',
              }}
            >
              BABY IS HERE
            </motion.button>
          </motion.div>
        ) : (
          /* Center text during celebration - same position as MAAY/ADD */
          <motion.div
            key="celebration-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: zIndex.content,
              pointerEvents: 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {celebrationPhase === 'complete' && (
                <motion.span
                  key="life-begins"
                  initial={{ opacity: 0, scale: animation.scale.exit }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  exit={{ opacity: 0, scale: animation.scale.exit }}
                  transition={{ duration: animation.duration.slow }}
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: fontSizes.large,
                    fontWeight: fontWeights.light,
                    letterSpacing: letterSpacing.ultraWide,
                    color: lineColor,
                    textAlign: 'center',
                    lineHeight: lineHeights.wide,
                  }}
                >
                  L I F E
                  <br />
                  B E G I N S
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Welcome Sheet - shown before user begins (only after hydration) */}
      <AnimatePresence>
        {isHydrated && !hasBegun && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={animation.spring.default}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: zIndex.welcomeOverlay,
              padding: `${spacing[13]}px ${spacing[12]}px ${spacing[15]}px`,
              background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor}f5 60%, ${bgColor}00 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing[10],
            }}
          >
            {/* Tagline */}
            <div
              style={{
                fontFamily: fonts.sans,
                fontSize: fontSizes.label,
                fontWeight: fontWeights.regular,
                letterSpacing: letterSpacing.standard,
                color: lineColor,
                opacity: 0.5,
                textAlign: 'center',
                lineHeight: lineHeights.wide,
                textTransform: 'uppercase',
              }}
            >
              Track contractions
              <br />
              breathe through every moment
            </div>
            
            {/* BEGIN button */}
            <motion.button
              onClick={handleBegin}
              whileHover={{ scale: animation.scale.hover }}
              whileTap={{ scale: animation.scale.tap }}
              style={{
                marginTop: spacing[4],
                fontFamily: fonts.sans,
                fontSize: fontSizes.button,
                fontWeight: fontWeights.semibold,
                letterSpacing: letterSpacing.wide,
                color: bgColor,
                backgroundColor: lineColor,
                border: 'none',
                padding: `${spacing[8]}px ${spacing[14]}px`,
                borderRadius: radii.full,
                cursor: 'pointer',
              }}
            >
              BEGIN
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* iOS-style Bottom Sheet - Contractions History (hidden during recording) */}
      <AnimatePresence>
        {activeTab === 'contractions' && !isRecording && (!isHydrated || hasBegun) && (
          <ContractionsHistorySheet
            contractions={allContractions}
            sheetExpanded={sheetExpanded}
            onSheetDragEnd={handleSheetDragEnd}
            onMenuOpen={() => setShowMenu(true)}
            onAddOpen={() => setShowAddSheet(true)}
            onEditContraction={setEditingId}
            onEditWaterBroke={setEditingWaterBrokeId}
            lineColor={lineColor}
            isNight={isNight}
            dimensions={dimensions}
            wavyParams={wavyParams}
          />
        )}
      </AnimatePresence>
      
      {/* Edit Contraction Sheet */}
      <AnimatePresence>
        {editingId && (
          <EditContractionSheet
            contraction={contractions.find(c => c.id === editingId) || null}
            onClose={() => setEditingId(null)}
            onSave={(id, updates) => {
              updateContraction(id, updates);
              // Sync update to Firebase if paired
              if (pairSession.sessionCode) {
                const contraction = contractions.find(c => c.id === id);
                if (contraction) {
                  pairSession.syncContraction({
                    id,
                    startTime: updates.startTime ?? contraction.startTime,
                    duration: updates.duration ?? contraction.duration,
                    type: contraction.type,
                  });
                }
              }
            }}
            onDelete={(id) => {
              deleteContraction(id);
              // Sync deletion to Firebase if paired
              if (pairSession.sessionCode) {
                pairSession.syncDeleteContraction(id);
              }
            }}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* About Sheet */}
      <AnimatePresence>
        {showAboutSheet && (
          <AboutSheet
            onClose={() => setShowAboutSheet(false)}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Menu Sheet */}
      <AnimatePresence>
        {showMenu && (
          <MenuSheet
            onClose={() => setShowMenu(false)}
            onWaterBroke={() => setShowWaterBrokeSheet(true)}
            onExport={() => setShowExportSheet(true)}
            onPairPartner={() => setShowPairSheet(true)}
            onClearAll={async () => {
              clearAll();
              // Clear Firebase session data and localStorage
              await pairSession.clearSession();
              // Return to welcome screen
              localStorage.removeItem('maay-has-begun');
              setHasBegun(false);
            }}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Pair with Partner Sheet */}
      <AnimatePresence>
        {showPairSheet && (
          <PairSheet
            onClose={() => setShowPairSheet(false)}
            lineColor={lineColor}
            bgColor={bgColor}
            isNight={isNight}
            pairSession={pairSession}
          />
        )}
      </AnimatePresence>
      
      {/* Export Sheet */}
      <AnimatePresence>
        {showExportSheet && (
          <ExportSheet
            onClose={() => setShowExportSheet(false)}
            contractions={allContractions}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Add Contraction Sheet */}
      <AnimatePresence>
        {showAddSheet && (
          <AddContractionSheet
            onClose={() => setShowAddSheet(false)}
            onAdd={(startTime, duration) => {
              addContraction(startTime, duration);
              // Sync to Firebase if paired
              if (pairSession.sessionCode) {
                // Get the newly added contraction (it's the last one with this startTime)
                setTimeout(() => {
                  const currentContractions = useContractionStore.getState().contractions;
                  const added = currentContractions.find(c => c.startTime === startTime && c.duration === duration);
                  if (added) {
                    pairSession.syncContraction({
                      id: added.id,
                      startTime: added.startTime,
                      duration: added.duration,
                      type: 'contraction',
                    });
                  }
                }, 0);
              }
            }}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Water Broke Sheet - for adding new */}
      <AnimatePresence>
        {showWaterBrokeSheet && (
          <WaterBrokeSheet
            onClose={() => setShowWaterBrokeSheet(false)}
            onConfirm={(time) => {
              addWaterBroke(time);
              // Sync to Firebase if paired
              if (pairSession.sessionCode) {
                setTimeout(() => {
                  const currentContractions = useContractionStore.getState().contractions;
                  const waterBroke = currentContractions.find(c => c.type === 'water_broke' && c.startTime === time);
                  if (waterBroke) {
                    pairSession.syncContraction({
                      id: waterBroke.id,
                      startTime: waterBroke.startTime,
                      duration: null,
                      type: 'water_broke',
                    });
                  }
                }, 0);
              }
            }}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Water Broke Sheet - for editing existing */}
      <AnimatePresence>
        {editingWaterBrokeId && (
          <WaterBrokeSheet
            onClose={() => setEditingWaterBrokeId(null)}
            onConfirm={(time) => {
              updateContraction(editingWaterBrokeId, { startTime: time });
              setEditingWaterBrokeId(null);
            }}
            onDelete={() => {
              deleteContraction(editingWaterBrokeId);
              // Sync deletion to Firebase if paired
              if (pairSession.sessionCode) {
                pairSession.syncDeleteContraction(editingWaterBrokeId);
              }
              setEditingWaterBrokeId(null);
            }}
            existingTime={contractions.find(c => c.id === editingWaterBrokeId)?.startTime}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Wavy Border Controls (press W to toggle) */}
      <AnimatePresence>
        {showWavyControls && (
          <WavyBorderControls
            params={wavyParams}
            setParams={setWavyParams}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Birth Wave Controls (press B on birth tab to toggle) */}
      <AnimatePresence>
        {showBirthControls && activeTab === 'birth' && (
          <BirthWaveControls
            params={birthWaveParams}
            setParams={setBirthWaveParams}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Celebration Content - same design as welcome splash */}
      <AnimatePresence>
        {showCelebrationContent && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 45,
              padding: '40px 32px 60px',
              background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor}f5 60%, ${bgColor}00 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* Subtitle message */}
            <div
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '0.1em',
                color: lineColor,
                opacity: 0.5,
                textAlign: 'center',
                lineHeight: 1.8,
                textTransform: 'uppercase',
              }}
            >
              Congratulations mama
              <br />
              You created life
            </div>
            
            {/* Export Button - secondary style */}
            <motion.button
              onClick={() => setShowExportSheet(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: 8,
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: lineColor,
                backgroundColor: 'transparent',
                border: `1px solid ${lineColor}40`,
                padding: '14px 40px',
                borderRadius: 50,
                cursor: 'pointer',
              }}
            >
              EXPORT DATA
            </motion.button>
            
            {/* Delete message */}
            <p style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 12,
              fontStyle: 'italic',
              color: lineColor,
              opacity: 0.5,
              marginTop: -12,
            }}>
              Now you can delete the app :)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default WaitScreen;
