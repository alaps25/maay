'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';
import { useContractionStore } from '../stores/contractionStore';
import { t } from '../i18n';

interface AuraButtonProps {
  onContractionStart?: () => void;
  onContractionEnd?: (duration: number) => void;
  locale?: 'en' | 'es';
}

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const INHALE_DURATION = 4000;
const HOLD_DURATION = 2000;
const EXHALE_DURATION = 4000;
const CYCLE_DURATION = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION;

/**
 * AuraButton Component
 * 
 * A large, organic, pulsating button that "breathes" with the user.
 * Follows WCAG accessibility guidelines with proper ARIA attributes.
 * Uses Framer Motion for smooth, organic animations.
 */
export function AuraButton({ 
  onContractionStart, 
  onContractionEnd,
  locale = 'en' 
}: AuraButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');
  const [breathProgress, setBreathProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
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
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      return;
    }
    
    let cycleStart = Date.now();
    
    const updateBreath = () => {
      const elapsed = Date.now() - cycleStart;
      const cyclePosition = elapsed % CYCLE_DURATION;
      
      if (cyclePosition < INHALE_DURATION) {
        setBreathPhase('inhale');
        setBreathProgress(cyclePosition / INHALE_DURATION);
      } else if (cyclePosition < INHALE_DURATION + HOLD_DURATION) {
        setBreathPhase('hold');
        setBreathProgress((cyclePosition - INHALE_DURATION) / HOLD_DURATION);
      } else {
        setBreathPhase('exhale');
        setBreathProgress((cyclePosition - INHALE_DURATION - HOLD_DURATION) / EXHALE_DURATION);
      }
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
    
    if (breathPhase === 'inhale' && breathProgress < 0.05) trigger('inhale');
    else if (breathPhase === 'hold' && breathProgress < 0.1) trigger('hold');
    else if (breathPhase === 'exhale' && breathProgress < 0.05) trigger('exhale');
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
  
  // Announce breathing phase for screen readers
  useEffect(() => {
    if (isPressed && breathPhase !== 'idle') {
      const announcement = document.getElementById('breath-announcement');
      if (announcement) {
        announcement.textContent = getBreathText();
      }
    }
  }, [breathPhase, isPressed]);
  
  const handleStart = useCallback(() => {
    setIsPressed(true);
    startTimeRef.current = Date.now();
    trigger('tap');
    startContraction();
    startBreathingSequence();
    onContractionStart?.();
  }, [trigger, startContraction, startBreathingSequence, onContractionStart]);
  
  const handleEnd = useCallback(() => {
    if (!isPressed) return;
    setIsPressed(false);
    const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    startTimeRef.current = null;
    
    trigger('success');
    endContraction();
    stopBreathingSequence();
    onContractionEnd?.(duration);
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
  
  const getActiveScale = () => {
    if (!isPressed) return 1;
    switch (breathPhase) {
      case 'inhale': return 1 + (breathProgress * 0.18);
      case 'hold': return 1.18;
      case 'exhale': return 1.18 - (breathProgress * 0.18);
      default: return 1;
    }
  };
  
  const activeScale = getActiveScale();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
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
      />
      
      {/* Decorative organic shapes */}
      <motion.svg
        width="320"
        height="320"
        viewBox="0 0 320 320"
        style={{
          position: 'absolute',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {/* Outer flowing ring */}
        <motion.ellipse
          cx="160"
          cy="160"
          rx="150"
          ry="145"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.5"
          strokeOpacity={isPressed ? 0.6 : 0.2}
          animate={{
            rx: isPressed ? [150 * activeScale, 152 * activeScale, 150 * activeScale] : [150, 155, 150],
            ry: isPressed ? [145 * activeScale, 148 * activeScale, 145 * activeScale] : [145, 150, 145],
            rotate: [0, 3, 0, -3, 0],
          }}
          transition={{
            duration: isPressed ? 10 : 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Middle organic shape */}
        <motion.path
          d="M160 35 
             C220 35 275 80 280 150 
             C285 220 230 280 160 285 
             C90 290 40 230 35 160 
             C30 90 85 40 160 35Z"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
          strokeOpacity={isPressed ? 0.5 : 0.25}
          animate={{
            scale: isPressed ? activeScale * 0.95 : [1, 1.03, 1],
            rotate: isPressed ? 0 : [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: isPressed ? 0.15 : 6,
            repeat: isPressed ? 0 : Infinity,
            ease: "easeInOut"
          }}
          style={{ transformOrigin: '160px 160px' }}
        />
        
        {/* Inner flowing shape */}
        <motion.path
          d="M160 60
             C205 60 245 95 248 140
             C251 185 215 225 160 228
             C105 231 70 195 67 150
             C64 105 100 65 160 60Z"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeOpacity={isPressed ? 0.6 : 0.35}
          animate={{
            scale: isPressed ? activeScale * 0.98 : [1, 1.02, 1],
          }}
          transition={{
            duration: isPressed ? 0.15 : 4,
            repeat: isPressed ? 0 : Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{ transformOrigin: '160px 160px' }}
        />
      </motion.svg>
      
      {/* Main interactive button */}
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
        role="button"
        tabIndex={0}
        animate={{
          scale: isPressed ? activeScale : [1, 1.04, 1],
          boxShadow: isPressed 
            ? '0 0 80px rgba(212, 175, 55, 0.6), 0 0 120px rgba(212, 175, 55, 0.3)'
            : [
                '0 0 40px rgba(212, 175, 55, 0.3), 0 0 60px rgba(212, 175, 55, 0.15)',
                '0 0 60px rgba(212, 175, 55, 0.45), 0 0 90px rgba(212, 175, 55, 0.25)',
                '0 0 40px rgba(212, 175, 55, 0.3), 0 0 60px rgba(212, 175, 55, 0.15)',
              ],
        }}
        transition={{
          scale: { duration: isPressed ? 0.15 : 4, repeat: isPressed ? 0 : Infinity, ease: "easeInOut" },
          boxShadow: { duration: isPressed ? 0.2 : 3, repeat: isPressed ? 0 : Infinity, ease: "easeInOut" },
        }}
        whileHover={{ scale: isPressed ? activeScale : 1.02 }}
        whileFocus={{ scale: isPressed ? activeScale : 1.02 }}
        style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          backgroundColor: isPressed ? '#D4AF37' : '#C9A030',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          position: 'relative',
          zIndex: 1,
          fontFamily: 'var(--font-serif, Georgia, serif)',
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
                  fontSize: 38,
                  fontWeight: 300,
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatTime(elapsedTime)}
              </span>
              <motion.span
                key={breathPhase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0.9, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: 15,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'white',
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
                  fontSize: 17,
                  fontWeight: 500,
                  color: 'white',
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
      
      {/* Instruction text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 32,
          fontFamily: 'var(--font-serif, Georgia, serif)',
          fontSize: 16,
          fontWeight: 400,
          fontStyle: 'italic',
          color: '#8B8178',
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

export default AuraButton;
