'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedingFlow, type FlowState, type FlowSide } from '../../components/vector/FeedingFlow';
import { DiaperLog } from '../../components/DiaperLog';
import { useAppStore } from '../../stores/appStore';
import { useFeedingStore, useActiveFeeding, useRecommendedSide, useDailyFeedingStats } from '../../stores/feedingStore';
import { useHaptics } from '../../hooks/useHaptics';
import { useSyncSession } from '../../hooks/useSyncSession';
import { framerSpring } from '../../components/vector/spring';
import { t } from '../../i18n';
import type { FeedingSide } from '../../stores/types';

interface RhythmScreenProps {
  locale?: 'en' | 'es';
}

/**
 * THE RHYTHM Screen - Living Vector Design
 * 
 * Delicate arching lines for feeding tracking.
 * Traveling wave animation indicates active feeding flow.
 */
export function RhythmScreen({ locale = 'en' }: RhythmScreenProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const activeFeeding = useActiveFeeding();
  const recommendedSide = useRecommendedSide();
  const dailyStats = useDailyFeedingStats();
  const { startFeeding, endFeeding } = useFeedingStore();
  const timeSinceLastFeed = useFeedingStore((s) => s.getTimeSinceLastFeed());
  const { babyInfo, isNightTime } = useAppStore();
  const { trigger } = useHaptics();
  const { isConnected, isOnline } = useSyncSession();
  
  const translations = t(locale);
  const isNight = isNightTime;
  const lineColor = isNight ? '#E8E0D5' : '#2C2420';
  const activeColor = '#64B5F6';
  
  // Timer for active feeding
  useEffect(() => {
    if (!activeFeeding) {
      setElapsedTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - activeFeeding.startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeFeeding]);
  
  const handleSidePress = useCallback((side: FeedingSide) => {
    if (activeFeeding) {
      if (activeFeeding.side === side) {
        trigger('success');
        endFeeding();
      } else {
        trigger('tap');
        endFeeding();
        startFeeding(side);
      }
    } else {
      trigger('tap');
      startFeeding(side);
    }
  }, [activeFeeding, trigger, startFeeding, endFeeding]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatTimeSince = (ms: number | null) => {
    if (ms === null) return null;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };
  
  const timeSinceText = formatTimeSince(timeSinceLastFeed);
  
  const getFlowState = (side: FlowSide): FlowState => {
    if (!activeFeeding) return 'idle';
    if (activeFeeding.side === side) return 'pulsing';
    return 'idle';
  };
  
  const FeedingButton = ({ 
    side, 
    label 
  }: { 
    side: FeedingSide; 
    label: string;
  }) => {
    const isActive = activeFeeding?.side === side;
    const isRecommended = !activeFeeding && recommendedSide === side && side !== 'bottle';
    
    return (
      <motion.button
        onClick={() => handleSidePress(side)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={framerSpring}
        aria-label={`${label}${isActive ? ', currently active' : ''}${isRecommended ? ', recommended' : ''}`}
        aria-pressed={isActive}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
        }}
      >
        <FeedingFlow
          side={side}
          state={getFlowState(side)}
          size={80}
          strokeWidth={1.5}
          color={lineColor}
          activeColor={activeColor}
        />
        <span
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 13,
            fontWeight: isActive ? 500 : 400,
            color: isActive ? activeColor : lineColor,
            opacity: isActive ? 1 : 0.6,
            marginTop: 4,
          }}
        >
          {label}
        </span>
        {isRecommended && (
          <span
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 9,
              color: lineColor,
              opacity: 0.4,
              marginTop: 2,
            }}
          >
            recommended
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        backgroundColor: isNight ? '#000' : '#FDFBF7',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '64px 24px 120px',
        }}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: 8,
          }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 'clamp(2rem, 6vw, 2.5rem)',
                fontWeight: 300,
                color: lineColor,
                letterSpacing: '-0.03em',
              }}
            >
              {translations.rhythm.title}
            </h1>
            
            {/* Status indicators */}
            <div style={{ display: 'flex', gap: 8 }}>
              {!isOnline && (
                <span
                  style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 10,
                    color: lineColor,
                    opacity: 0.5,
                  }}
                  role="status"
                >
                  offline
                </span>
              )}
            </div>
          </div>
          
          {timeSinceText && (
            <p
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 14,
                fontStyle: 'italic',
                color: lineColor,
                opacity: 0.5,
              }}
            >
              Last feed: {timeSinceText} ago
            </p>
          )}
          
          {/* Decorative line */}
          <svg 
            width="60" 
            height="2" 
            viewBox="0 0 60 2"
            style={{ opacity: 0.2, marginTop: 16 }}
            aria-hidden="true"
          >
            <line 
              x1="0" y1="1" x2="60" y2="1" 
              stroke={lineColor} 
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </motion.header>
        
        {/* Night mode indicator */}
        {isNight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 32,
              paddingBottom: 16,
              borderBottom: `1px solid ${lineColor}10`,
            }}
            role="status"
          >
            <span style={{ fontSize: 14, opacity: 0.6 }} aria-hidden="true">☽</span>
            <span
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 13,
                fontStyle: 'italic',
                color: lineColor,
                opacity: 0.5,
              }}
            >
              Night mode
            </span>
          </motion.div>
        )}
        
        {/* Feeding Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...framerSpring }}
          aria-labelledby="feeding-section"
        >
          <h2
            id="feeding-section"
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 18,
              fontWeight: 400,
              color: lineColor,
              marginBottom: 24,
            }}
          >
            {translations.rhythm.feeding.title}
          </h2>
          
          {/* Active feeding display */}
          <AnimatePresence>
            {activeFeeding && (
              <motion.div
                key="active-feeding"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  textAlign: 'center',
                  marginBottom: 24,
                  padding: 20,
                  border: `1px solid ${activeColor}30`,
                }}
                role="status"
                aria-live="polite"
              >
                <p
                  style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 11,
                    color: activeColor,
                    opacity: 0.8,
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {activeFeeding.side === 'left' ? 'Left' : 
                   activeFeeding.side === 'right' ? 'Right' : 'Bottle'}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                    fontSize: 36,
                    fontWeight: 300,
                    color: activeColor,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formatTime(elapsedTime)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Feeding buttons with vector lines */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginBottom: 32,
            }}
            role="group"
            aria-label="Feeding side selection"
          >
            <FeedingButton side="left" label={translations.rhythm.feeding.leftSide} />
            <FeedingButton side="bottle" label={translations.rhythm.feeding.bottle} />
            <FeedingButton side="right" label={translations.rhythm.feeding.rightSide} />
          </div>
          
          {/* Daily stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '16px 0',
              borderTop: `1px solid ${lineColor}08`,
              borderBottom: `1px solid ${lineColor}08`,
            }}
            role="region"
            aria-label="Today's feeding statistics"
          >
            {[
              { label: 'Total', value: dailyStats.totalFeedings },
              { label: 'Left', value: dailyStats.leftCount },
              { label: 'Right', value: dailyStats.rightCount },
              { label: 'Bottle', value: dailyStats.bottleCount },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                    fontSize: 20,
                    fontWeight: 300,
                    color: lineColor,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 9,
                    color: lineColor,
                    opacity: 0.4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
        
        {/* Divider */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            margin: '48px 0',
          }}
        >
          <svg 
            width="20" 
            height="2" 
            viewBox="0 0 20 2"
            style={{ opacity: 0.15 }}
            aria-hidden="true"
          >
            <line 
              x1="0" y1="1" x2="20" y2="1" 
              stroke={lineColor} 
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* Diaper Log */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...framerSpring }}
          aria-labelledby="diaper-section"
        >
          <DiaperLog locale={locale} />
        </motion.section>
        
        {/* On-demand guidance */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 48,
            padding: 20,
            border: `1px solid ${lineColor}08`,
          }}
          aria-labelledby="guidance-title"
        >
          <h3
            id="guidance-title"
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 14,
              fontWeight: 400,
              color: lineColor,
              marginBottom: 8,
            }}
          >
            {translations.rhythm.feeding.onDemand}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              color: lineColor,
              opacity: 0.5,
              lineHeight: 1.7,
            }}
          >
            {translations.rhythm.feeding.guidance}
          </p>
        </motion.section>
        
        {/* Baby info */}
        {babyInfo?.birthTime && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              marginTop: 40,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 12,
                fontStyle: 'italic',
                color: lineColor,
                opacity: 0.3,
              }}
            >
              Born {new Date(babyInfo.birthTime).toLocaleDateString()} at{' '}
              {new Date(babyInfo.birthTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </motion.section>
        )}
        
        {/* Medical disclaimer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: 48,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 10,
              color: lineColor,
              opacity: 0.25,
              lineHeight: 1.6,
            }}
          >
            {translations.medical.disclaimer}
          </p>
        </motion.footer>
      </div>
    </main>
  );
}

export default RhythmScreen;
