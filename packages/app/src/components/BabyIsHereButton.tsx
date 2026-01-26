'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VectorRings } from './vector/VectorRings';
import { useHaptics } from '../hooks/useHaptics';
import { useAppStore } from '../stores/appStore';
import { framerSpring } from './vector/spring';
import { t } from '../i18n';

interface BabyIsHereButtonProps {
  onTriggered: () => void;
  locale?: 'en' | 'es';
}

const HOLD_DURATION = 3000;

/**
 * BabyIsHereButton - Living Vector Design
 * 
 * Uses vector rings that tighten as the user holds.
 * Clean, minimal - no shadows or gradients.
 */
export function BabyIsHereButton({ 
  onTriggered,
  locale = 'en' 
}: BabyIsHereButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ringState, setRingState] = useState<'idle' | 'pressed' | 'celebrating'>('idle');
  
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { trigger } = useHaptics();
  const { setCelebrated, setCelebrationTime } = useAppStore();
  const isNight = useAppStore((s) => s.isNightTime);
  
  const translations = t(locale);
  const lineColor = isNight ? '#E8E0D5' : '#2C2420';
  
  const handlePressIn = useCallback(() => {
    if (isCompleted) return;
    setIsPressed(true);
    setRingState('pressed');
    setProgress(0);
    startTimeRef.current = Date.now();
    trigger('tap');
    
    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / HOLD_DURATION);
      setProgress(currentProgress);
      
      if (currentProgress >= 0.33 && currentProgress < 0.34) trigger('tap');
      else if (currentProgress >= 0.66 && currentProgress < 0.67) trigger('tap');
      
      if (currentProgress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsCompleted(true);
        setRingState('celebrating');
        trigger('success');
        setCelebrated(true);
        setCelebrationTime(Date.now());
        onTriggered();
      }
    }, 16);
  }, [isCompleted, trigger, onTriggered, setCelebrated, setCelebrationTime]);
  
  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    startTimeRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isCompleted) {
      setProgress(0);
      setRingState('idle');
    }
  }, [isCompleted]);
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
      }}
    >
      {/* Vector rings container */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <VectorRings
          state={ringState}
          size={120}
          ringCount={3}
          strokeWidth={1}
          color={lineColor}
          intensity={progress}
        />
        
        {/* Interactive button overlay */}
        <motion.button
          onMouseDown={handlePressIn}
          onMouseUp={handlePressOut}
          onMouseLeave={() => isPressed && handlePressOut()}
          onTouchStart={handlePressIn}
          onTouchEnd={handlePressOut}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handlePressIn();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handlePressOut();
            }
          }}
          disabled={isCompleted}
          aria-label={
            isCompleted 
              ? 'Baby arrival celebrated'
              : isPressed 
                ? `Hold for ${Math.ceil((1 - progress) * 3)} more seconds`
                : translations.moment.trigger.holdInstruction
          }
          aria-pressed={isPressed}
          transition={framerSpring}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: isCompleted ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
          }}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.span
                key="done"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.6 }}
                style={{ 
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: 24,
                  color: lineColor,
                }}
                aria-hidden="true"
              >
                ✦
              </motion.span>
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {isPressed ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-serif, Georgia, serif)',
                      fontSize: 24,
                      fontWeight: 300,
                      color: lineColor,
                    }}
                  >
                    {Math.ceil((1 - progress) * 3)}
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-serif, Georgia, serif)',
                      fontSize: 12,
                      fontWeight: 400,
                      color: lineColor,
                      opacity: 0.6,
                      textAlign: 'center',
                    }}
                  >
                    {translations.moment.trigger.prompt}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      
      {/* Instruction */}
      <p
        style={{
          marginTop: 16,
          fontFamily: 'var(--font-sans, sans-serif)',
          fontSize: 11,
          color: lineColor,
          opacity: 0.4,
          textAlign: 'center',
        }}
        aria-hidden="true"
      >
        {isPressed 
          ? `${Math.ceil((1 - progress) * 3)}s remaining`
          : translations.moment.trigger.holdInstruction}
      </p>
    </div>
  );
}

export default BabyIsHereButton;
