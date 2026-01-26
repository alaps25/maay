'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WaitScreen } from './wait/WaitScreen';
import { MomentScreen } from './moment/MomentScreen';
import { RhythmScreen } from './rhythm/RhythmScreen';
import { useAppStore, usePhase, useTheme } from '../stores/appStore';
import { useContractionStore } from '../stores/contractionStore';
import { useSyncSession } from '../hooks/useSyncSession';
import { framerSpring, framerGentleSpring } from '../components/vector/spring';

interface BabyAppProps {
  locale?: 'en' | 'es';
}

/**
 * BabyApp - Living Vector Design
 * 
 * Main application container with fluidic transitions.
 * Lines never "jump" - they morph smoothly between states.
 * Uses spring physics for all movements.
 * 
 * DEV SHORTCUT: Press 'R' twice quickly to reset app
 */
export function BabyApp({ locale = 'en' }: BabyAppProps) {
  const phase = usePhase();
  const theme = useTheme();
  const { checkNightTime, resetApp } = useAppStore();
  const { clearAll: clearContractions } = useContractionStore();
  
  // Double-tap R to reset
  const lastRPressRef = useRef<number>(0);
  
  const handleReset = useCallback(() => {
    if (confirm('Reset app to beginning? This will clear all data.')) {
      resetApp();
      clearContractions();
      // Clear all localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      window.location.reload();
    }
  }, [resetApp, clearContractions]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.metaKey || e.ctrlKey) return;
      
      if (e.key.toLowerCase() === 'r') {
        const now = Date.now();
        if (now - lastRPressRef.current < 500) {
          // Double tap detected
          handleReset();
        }
        lastRPressRef.current = now;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReset]);
  
  // Initialize sync session
  useSyncSession();
  
  // Check night time periodically
  useEffect(() => {
    checkNightTime();
    const interval = setInterval(checkNightTime, 60000);
    return () => clearInterval(interval);
  }, [checkNightTime]);
  
  // Fluidic transition variants using spring physics
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        ...framerSpring,
        opacity: { duration: 0.5 },
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        ...framerGentleSpring,
        opacity: { duration: 0.3 },
      },
    },
  };
  
  // Special variants for the moment (celebration) screen
  const momentVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        ...framerGentleSpring,
        opacity: { duration: 0.8 },
      },
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      transition: {
        ...framerGentleSpring,
        opacity: { duration: 0.4 },
      },
    },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: theme === 'night' ? '#000' : '#f5f5f0',
      }}
      data-theme={theme}
    >
      <AnimatePresence mode="wait">
        {phase === 'wait' && (
          <motion.div
            key="wait"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ minHeight: '100vh' }}
          >
            <WaitScreen locale={locale} />
          </motion.div>
        )}
        
        {phase === 'moment' && (
          <motion.div
            key="moment"
            variants={momentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ minHeight: '100vh' }}
          >
            <MomentScreen locale={locale} />
          </motion.div>
        )}
        
        {phase === 'rhythm' && (
          <motion.div
            key="rhythm"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ minHeight: '100vh' }}
          >
            <RhythmScreen locale={locale} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BabyApp;
