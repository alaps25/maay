'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VectorRings, type RingState } from './VectorRings';
import { useHaptics } from '../../hooks/useHaptics';
import { useContractionStore } from '../../stores/contractionStore';
import { framerSpring } from './spring';
import { t } from '../../i18n';

interface VectorAuraButtonProps {
  onContractionStart?: () => void;
  onContractionEnd?: (duration: number) => void;
  locale?: 'en' | 'es';
  color?: string;
}

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const INHALE_DURATION = 4000;
const HOLD_DURATION = 2000;
const EXHALE_DURATION = 4000;
const CYCLE_DURATION = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION;

/**
 * VectorAuraButton Component
 * 
 * Living Vector implementation of the Aura Button.
 * - Concentric vibrating rings instead of solid circle
 * - Breathing wave animation when pressed
 * - Intensity increases noise frequency, not color
 * - All movements use spring physics
 */
export function VectorAuraButton({
  onContractionStart,
  onContractionEnd,
  locale = 'en',
  color = '#2C2420',
}: VectorAuraButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ringState, setRingState] = useState<RingState>('idle');
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');
  const [breathProgress, setBreathProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intensity, setIntensity] = useState(0);
  
  const startTimeRef = useRef<number | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { trigger, startBreathingSequence, stopBreathingSequence } = useHaptics();
  const { startContraction, endContraction } = useContractionStore();
  
  const translations = t(locale);
  
  // Breathing cycle management
  useEffect(() => {
    if (!isPressed) {
      setBreathPhase('idle');
      setBreathProgress(0);
      setRingState('idle');
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      return;
    }
    
    setRingState('breathing');
    let cycleStart = Date.now();
    
    const updateBreath = () => {
      const elapsed = Date.now() - cycleStart;
      const cyclePosition = elapsed % CYCLE_DURATION;
      const normalizedProgress = cyclePosition / CYCLE_DURATION;
      
      setBreathProgress(normalizedProgress);
      
      if (cyclePosition < INHALE_DURATION) {
        setBreathPhase('inhale');
      } else if (cyclePosition < INHALE_DURATION + HOLD_DURATION) {
        setBreathPhase('hold');
      } else {
        setBreathPhase('exhale');
      }
      
      // Increase intensity over time (simulating contraction building)
      const contractionElapsed = Date.now() - (startTimeRef.current || Date.now());
      const newIntensity = Math.min(1, contractionElapsed / 60000); // Max intensity at 1 minute
      setIntensity(newIntensity);
    };
    
    breathIntervalRef.current = setInterval(updateBreath, 50);
    updateBreath();
    
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [isPressed]);
  
  // Haptic triggers
  useEffect(() => {
    if (!isPressed) return;
    
    if (breathPhase === 'inhale' && breathProgress < 0.02) trigger('inhale');
    else if (breathPhase === 'hold' && breathProgress > 0.39 && breathProgress < 0.41) trigger('hold');
    else if (breathPhase === 'exhale' && breathProgress > 0.59 && breathProgress < 0.61) trigger('exhale');
  }, [breathPhase, breathProgress, isPressed, trigger]);
  
  // Timer
  useEffect(() => {
    if (isPressed && startTimeRef.current) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current!) / 1000));
      }, 100);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setElapsedTime(0);
    }
    
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPressed]);
  
  const handleStart = useCallback(() => {
    setIsPressed(true);
    setRingState('pressed');
    startTimeRef.current = Date.now();
    trigger('tap');
    startContraction();
    startBreathingSequence();
    onContractionStart?.();
    
    // Transition to breathing state
    setTimeout(() => setRingState('breathing'), 200);
  }, [trigger, startContraction, startBreathingSequence, onContractionStart]);
  
  const handleEnd = useCallback(() => {
    if (!isPressed) return;
    setRingState('releasing');
    
    const duration = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
      : 0;
    
    startTimeRef.current = null;
    trigger('success');
    endContraction();
    stopBreathingSequence();
    onContractionEnd?.(duration);
    
    // Reset after release animation
    setTimeout(() => {
      setIsPressed(false);
      setIntensity(0);
      setRingState('idle');
    }, 300);
  }, [isPressed, trigger, endContraction, stopBreathingSequence, onContractionEnd]);
  
  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isPressed) handleStart();
    }
  }, [isPressed, handleStart]);
  
  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleEnd();
    }
  }, [handleEnd]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };
  
  const getBreathText = () => {
    switch (breathPhase) {
      case 'inhale': return translations.wait.breathing.inhale;
      case 'hold': return translations.wait.breathing.hold;
      case 'exhale': return translations.wait.breathing.exhale;
      default: return '';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
      }}
    >
      {/* Screen reader announcements */}
      <div
        id="breath-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isPressed && getBreathText()}
      </div>
      
      {/* Vector Rings */}
      <div style={{ position: 'relative' }}>
        <VectorRings
          state={ringState}
          size={280}
          ringCount={5}
          strokeWidth={1.5}
          color={color}
          intensity={intensity}
          breathPhase={breathProgress}
        />
        
        {/* Interactive touch/click area */}
        <motion.button
          ref={buttonRef}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={() => isPressed && handleEnd()}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          aria-label={isPressed 
            ? `Contraction timer: ${formatTime(elapsedTime)}. ${getBreathText()}. Release to stop.`
            : translations.wait.auraButton.idle
          }
          aria-pressed={isPressed}
          transition={framerSpring}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            zIndex: 1,
          }}
        >
          <AnimatePresence mode="wait">
            {isPressed ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                    fontSize: 36,
                    fontWeight: 300,
                    color: color,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formatTime(elapsedTime)}
                </span>
                <motion.span
                  key={breathPhase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  style={{
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                    fontSize: 13,
                    fontWeight: 400,
                    fontStyle: 'italic',
                    color: color,
                    marginTop: 4,
                  }}
                >
                  {getBreathText()}
                </motion.span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                    fontSize: 15,
                    fontWeight: 400,
                    color: color,
                    opacity: 0.7,
                    textAlign: 'center',
                    letterSpacing: '0.02em',
                  }}
                >
                  {translations.wait.auraButton.idle}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      
      {/* Instruction text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 24,
          fontFamily: 'var(--font-serif, Georgia, serif)',
          fontSize: 14,
          fontWeight: 400,
          fontStyle: 'italic',
          color: color,
          opacity: 0.5,
          textAlign: 'center',
          letterSpacing: '0.01em',
        }}
        aria-hidden="true"
      >
        {isPressed 
          ? translations.wait.auraButton.release 
          : translations.wait.auraButton.active}
      </motion.p>
    </div>
  );
}

export default VectorAuraButton;
