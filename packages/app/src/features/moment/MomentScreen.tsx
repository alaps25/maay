'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineMorph, type MorphStage } from '../../components/vector/LineMorph';
import { GoldenHourCard } from '../../components/GoldenHourCard';
import { useAppStore } from '../../stores/appStore';
import { useDiaperStore } from '../../stores/diaperStore';
import { framerSpring, framerGentleSpring } from '../../components/vector/spring';
import { t } from '../../i18n';

interface MomentScreenProps {
  locale?: 'en' | 'es';
  onContinue?: () => void;
}

type MomentPhase = 'morph' | 'celebration' | 'golden_hour' | 'complete';

/**
 * THE MOMENT Screen - Living Vector Design
 * 
 * The "untying" transition when Baby arrives.
 * Lines morph from contraction rings → flowing streams → celebration particles.
 */
export function MomentScreen({ 
  locale = 'en',
  onContinue 
}: MomentScreenProps) {
  const [phase, setPhase] = useState<MomentPhase>('morph');
  const [morphStage, setMorphStage] = useState<MorphStage>('rings');
  const [morphProgress, setMorphProgress] = useState(0);
  
  const { setPhase: setAppPhase, celebrationTime, setBabyInfo } = useAppStore();
  const { setBirthDate } = useDiaperStore();
  const isNight = useAppStore((s) => s.isNightTime);
  
  const translations = t(locale);
  const lineColor = isNight ? '#E8E0D5' : '#2C2420';
  
  useEffect(() => {
    const birthTime = celebrationTime || Date.now();
    setBirthDate(birthTime);
    setBabyInfo({ birthTime });
  }, [celebrationTime, setBirthDate, setBabyInfo]);
  
  // Morph sequence
  useEffect(() => {
    if (phase !== 'morph') return;
    
    const stages: MorphStage[] = ['rings', 'untying', 'flowing', 'swirling', 'particles'];
    let currentIndex = 0;
    
    const advanceStage = () => {
      currentIndex++;
      if (currentIndex < stages.length) {
        setMorphStage(stages[currentIndex]);
        setMorphProgress(0);
        
        // Animate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 0.02;
          setMorphProgress(Math.min(1, progress));
          if (progress >= 1) clearInterval(progressInterval);
        }, 30);
      } else {
        // Morph complete, show celebration
        setPhase('celebration');
        setTimeout(() => setPhase('golden_hour'), 3000);
      }
    };
    
    // Start sequence
    const stageTimer = setInterval(advanceStage, 1500);
    
    return () => clearInterval(stageTimer);
  }, [phase]);
  
  const handleContinue = useCallback(() => {
    setPhase('complete');
    setTimeout(() => {
      setAppPhase('rhythm');
      onContinue?.();
    }, 600);
  }, [setAppPhase, onContinue]);

  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        backgroundColor: isNight ? '#000' : '#FDFBF7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      role="main"
      aria-label="Birth Celebration"
    >
      <AnimatePresence mode="wait">
        {/* Morph Transition */}
        {phase === 'morph' && (
          <motion.div
            key="morph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <LineMorph
              stage={morphStage}
              progress={morphProgress}
              size={300}
              strokeWidth={1.5}
              color={lineColor}
            />
          </motion.div>
        )}
        
        {/* Celebration Text */}
        {phase === 'celebration' && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={framerGentleSpring}
            style={{
              textAlign: 'center',
              padding: 32,
            }}
            role="status"
            aria-live="polite"
          >
            <h1
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 'clamp(2.5rem, 10vw, 4rem)',
                fontWeight: 300,
                color: lineColor,
                letterSpacing: '-0.04em',
                marginBottom: 16,
              }}
            >
              {translations.moment.celebration.title}
            </h1>
            
            {/* Decorative line */}
            <svg 
              width="100" 
              height="2" 
              viewBox="0 0 100 2"
              style={{ opacity: 0.3, marginBottom: 16 }}
              aria-hidden="true"
            >
              <line 
                x1="0" y1="1" x2="100" y2="1" 
                stroke={lineColor} 
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
            
            <p
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: lineColor,
                opacity: 0.6,
              }}
            >
              {translations.moment.celebration.subtitle}
            </p>
          </motion.div>
        )}
        
        {/* Golden Hour */}
        {phase === 'golden_hour' && (
          <motion.div
            key="golden_hour"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={framerSpring}
            style={{
              width: '100%',
              maxWidth: 480,
              padding: 24,
            }}
          >
            {/* Welcome message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              <h1
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
                  fontWeight: 300,
                  color: lineColor,
                  letterSpacing: '-0.02em',
                }}
              >
                {translations.moment.trigger.confirmation}
              </h1>
            </motion.div>
            
            {/* Golden Hour Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ...framerSpring }}
            >
              <GoldenHourCard locale={locale} />
            </motion.div>
            
            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                marginTop: 40,
                textAlign: 'center',
              }}
            >
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={framerSpring}
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: 16,
                  fontWeight: 400,
                  color: isNight ? '#000' : '#FDFBF7',
                  backgroundColor: lineColor,
                  border: 'none',
                  padding: '16px 48px',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
                aria-label="Continue to feeding and diaper tracking"
              >
                Continue
              </motion.button>
              <p
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: lineColor,
                  opacity: 0.4,
                  marginTop: 12,
                }}
              >
                When you're ready
              </p>
            </motion.div>
          </motion.div>
        )}
        
        {/* Transition out */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, scale: 1.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default MomentScreen;
