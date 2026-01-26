'use client';

import React, { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrganicWaves, type BreathPhase } from '../../components/vector/OrganicWaves';
import { useContractionStore } from '../../stores/contractionStore';
import { useAppStore } from '../../stores/appStore';
import { useHaptics } from '../../hooks/useHaptics';
import { framerSpring } from '../../components/vector/spring';
import { t } from '../../i18n';

interface WaitScreenProps {
  locale?: 'en' | 'es';
  onBabyArrived?: () => void;
}

type Tab = 'contractions' | 'birth';

// Medical standard breathing for labor (4-7-8 technique)
// Promotes relaxation and pain management during contractions
const INHALE_DURATION = 4000;  // 4 seconds - breathe in through nose
const HOLD_DURATION = 7000;    // 7 seconds - hold breath
const EXHALE_DURATION = 8000;  // 8 seconds - breathe out through mouth
const CYCLE_DURATION = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION; // 19 seconds total

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
  
  // Bottom sheet drag handling
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartExpanded = useRef<boolean>(false);
  
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathCycleStart = useRef<number>(0);
  
  const contractions = useContractionStore((s) => s.contractions);
  const { startContraction, endContraction } = useContractionStore();
  const { setPhase } = useAppStore();
  const isNight = useAppStore((s) => s.isNightTime);
  const { trigger } = useHaptics();
  
  const translations = t(locale);
  const lineColor = isNight ? '#E8E0D5' : '#1a1a1a';
  const bgColor = isNight ? '#000' : '#f5f5f0';
  
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
        
        // Update breathing phase
        const cycleElapsed = (Date.now() - breathCycleStart.current) % CYCLE_DURATION;
        
        if (cycleElapsed < INHALE_DURATION) {
          setBreathPhase('inhale');
          setBreathProgress(cycleElapsed / INHALE_DURATION);
        } else if (cycleElapsed < INHALE_DURATION + HOLD_DURATION) {
          setBreathPhase('hold');
          setBreathProgress((cycleElapsed - INHALE_DURATION) / HOLD_DURATION);
        } else {
          setBreathPhase('exhale');
          setBreathProgress((cycleElapsed - INHALE_DURATION - HOLD_DURATION) / EXHALE_DURATION);
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
    } else if (breathPhase === 'hold' && breathProgress < 0.1) {
      trigger('hold');
    } else if (breathPhase === 'exhale' && breathProgress < 0.05) {
      trigger('exhale');
    }
  }, [breathPhase, breathProgress, isRecording, trigger]);
  
  const handleRecordPress = useCallback(() => {
    if (activeTab !== 'contractions') return;
    
    if (isRecording) {
      // Stop recording
      const duration = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
        : 0;
      
      setIsRecording(false);
      startTimeRef.current = null;
      trigger('success');
      endContraction();
    } else {
      // Start recording
      setIsRecording(true);
      startTimeRef.current = Date.now();
      breathCycleStart.current = Date.now();
      trigger('tap');
      startContraction();
    }
  }, [isRecording, activeTab, trigger, startContraction, endContraction]);
  
  const handleBabyArrived = useCallback(() => {
    trigger('success');
    setPhase('moment');
    onBabyArrived?.();
  }, [trigger, setPhase, onBabyArrived]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };
  
  const getInterval = (index: number) => {
    if (index === 0) return null;
    const current = contractions[index];
    const previous = contractions[index - 1];
    const interval = (current.startTime - (previous.endTime || previous.startTime)) / 1000 / 60;
    return Math.round(interval * 10) / 10;
  };
  
  const getBreathText = () => {
    switch (breathPhase) {
      case 'inhale': return 'breathe in';
      case 'hold': return 'hold';
      case 'exhale': return 'breathe out';
    }
  };
  
  // All contractions, newest first
  const allContractions = [...contractions].reverse();
  
  // Bottom sheet drag handlers
  const handleSheetTouchStart = useCallback((e: TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartExpanded.current = sheetExpanded;
  }, [sheetExpanded]);
  
  const handleSheetTouchEnd = useCallback((e: TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - dragStartY.current;
    const threshold = 50;
    
    if (dragStartExpanded.current) {
      // If expanded, drag down to collapse
      if (deltaY > threshold) {
        setSheetExpanded(false);
      }
    } else {
      // If collapsed, drag up to expand
      if (deltaY < -threshold) {
        setSheetExpanded(true);
      }
    }
  }, []);
  
  const toggleSheet = useCallback(() => {
    setSheetExpanded(prev => !prev);
  }, []);

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
      {/* Organic flowing rings with heartbeat - Press 'S' for controls */}
      <OrganicWaves
        state={isRecording ? 'recording' : 'idle'}
        breathPhase={breathPhase}
        breathProgress={breathProgress}
        width={dimensions.width}
        height={dimensions.height}
        strokeWidth={1.2}
        color={lineColor}
      />
      
      {/* Top Navigation Pill */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={framerSpring}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          padding: '24px 24px 0',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          style={{
            display: 'flex',
            backgroundColor: lineColor,
            borderRadius: 50,
            padding: 4,
          }}
        >
          <button
            onClick={() => setActiveTab('contractions')}
            aria-pressed={activeTab === 'contractions'}
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: activeTab === 'contractions' ? lineColor : bgColor,
              backgroundColor: activeTab === 'contractions' ? bgColor : 'transparent',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 50,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            CONTRACTIONS
          </button>
          <button
            onClick={() => setActiveTab('birth')}
            aria-pressed={activeTab === 'birth'}
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: activeTab === 'birth' ? lineColor : bgColor,
              backgroundColor: activeTab === 'birth' ? bgColor : 'transparent',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 50,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.3s ease',
            }}
          >
            BIRTH <span aria-hidden="true">→</span>
          </button>
        </div>
      </motion.nav>
      
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
              ? `Recording contraction: ${formatTime(elapsedTime)}. ${getBreathText()}. Tap to stop.` 
              : 'Tap anywhere to start recording contraction'
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
              cursor: 'pointer',
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    {/* Timer */}
                    <span
                      style={{
                        fontFamily: 'var(--font-serif, Georgia, serif)',
                        fontSize: 56,
                        fontWeight: 300,
                        color: lineColor,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {formatTime(elapsedTime)}
                    </span>
                    
                    {/* Breathing guidance */}
                    <motion.span
                      key={breathPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        fontFamily: 'var(--font-serif, Georgia, serif)',
                        fontSize: 18,
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: lineColor,
                        opacity: 0.6,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {getBreathText()}
                    </motion.span>
                    
                    {/* Tap to stop hint */}
                    <span
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 10,
                        fontWeight: 400,
                        letterSpacing: '0.15em',
                        color: lineColor,
                        opacity: 0.3,
                        marginTop: 24,
                      }}
                    >
                      TAP TO STOP
                    </span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      fontFamily: 'var(--font-sans, sans-serif)',
                      fontSize: 14,
                      fontWeight: 400,
                      letterSpacing: '0.35em',
                      color: lineColor,
                      opacity: 0.5,
                    }}
                  >
                    R E C O R D
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        ) : (
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
              zIndex: 5,
              padding: 32,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 18,
                fontStyle: 'italic',
                color: lineColor,
                opacity: 0.5,
                textAlign: 'center',
                maxWidth: 280,
                marginBottom: 32,
                lineHeight: 1.6,
              }}
            >
              When the moment arrives,<br />hold to celebrate
            </p>
            
            <motion.button
              onMouseDown={(e) => {
                const btn = e.currentTarget;
                let held = true;
                const timeout = setTimeout(() => {
                  if (held) handleBabyArrived();
                }, 2000);
                const cleanup = () => { held = false; clearTimeout(timeout); };
                btn.addEventListener('mouseup', cleanup, { once: true });
                btn.addEventListener('mouseleave', cleanup, { once: true });
              }}
              onTouchStart={(e) => {
                const btn = e.currentTarget;
                let held = true;
                const timeout = setTimeout(() => {
                  if (held) handleBabyArrived();
                }, 2000);
                const cleanup = () => { held = false; clearTimeout(timeout); };
                btn.addEventListener('touchend', cleanup, { once: true });
                btn.addEventListener('touchcancel', cleanup, { once: true });
              }}
              whileTap={{ scale: 0.95 }}
              transition={framerSpring}
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.15em',
                color: bgColor,
                backgroundColor: lineColor,
                border: 'none',
                padding: '18px 40px',
                borderRadius: 50,
                cursor: 'pointer',
              }}
            >
              BABY IS HERE
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* iOS-style Bottom Sheet - Contractions History */}
      <AnimatePresence>
        {activeTab === 'contractions' && allContractions.length > 0 && (
          <motion.section
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ 
              y: 0,
              height: sheetExpanded ? 'calc(100vh - 100px)' : 'auto',
            }}
            exit={{ y: '100%' }}
            transition={framerSpring}
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              backgroundColor: isNight ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: `0 -4px 20px ${lineColor}15`,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: sheetExpanded ? 'calc(100vh - 100px)' : 'none',
            }}
            aria-label="Contractions history"
          >
            {/* Drag handle */}
            <button
              onClick={toggleSheet}
              style={{
                padding: '0px 0 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                flexShrink: 0,
              }}
              aria-label={sheetExpanded ? 'Collapse history' : 'Expand history'}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  backgroundColor: lineColor,
                  opacity: 0.2,
                  borderRadius: 2,
                  margin: '0 auto',
                }}
              />
            </button>
            
            {/* Content wrapper */}
            <div
              style={{
                padding: '0px 0px 24px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Header row - always visible */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  flexShrink: 0,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    color: lineColor,
                    opacity: 0.5,
                  }}>
                    DURATION
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    color: lineColor,
                    opacity: 0.5,
                  }}>
                    INTERVAL
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    color: lineColor,
                    opacity: 0.5,
                  }}>
                    TIME
                  </span>
                </div>
              </div>
              
              {/* Data rows - height depends on expanded state */}
              <div
                style={{
                  flex: sheetExpanded ? 1 : 'none',
                  maxHeight: sheetExpanded ? 'none' : 125, // ~2.5 rows when collapsed
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                  }}
                >
                  {allContractions.map((contraction, idx) => {
                    const actualIndex = contractions.length - 1 - idx;
                    const interval = getInterval(actualIndex);
                    
                    return (
                      <React.Fragment key={contraction.id}>
                        <div style={{ 
                          padding: '14px 12px', 
                          textAlign: 'center',
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-serif, Georgia, serif)',
                            fontSize: 18,
                            fontWeight: 300,
                            color: lineColor,
                          }}>
                            {formatDuration(contraction.duration)}
                          </span>
                        </div>
                        <div style={{ 
                          padding: '14px 12px', 
                          textAlign: 'center',
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-serif, Georgia, serif)',
                            fontSize: 18,
                            fontWeight: 300,
                            color: lineColor,
                          }}>
                            {interval ? `${interval}m` : '—'}
                          </span>
                        </div>
                        <div style={{ 
                          padding: '14px 12px', 
                          textAlign: 'center',
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-serif, Georgia, serif)',
                            fontSize: 18,
                            fontWeight: 300,
                            color: lineColor,
                            opacity: 0.5,
                          }}>
                            {new Date(contraction.startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              
              {/* Hint when collapsed */}
              {!sheetExpanded && allContractions.length > 2 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '10px 0 0',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    color: lineColor,
                    opacity: 0.25,
                  }}>
                    ↑ PULL UP FOR MORE
                  </span>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

export default WaitScreen;
