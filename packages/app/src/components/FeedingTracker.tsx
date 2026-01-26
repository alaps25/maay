'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedingStore, useActiveFeeding, useRecommendedSide, useDailyFeedingStats } from '../stores/feedingStore';
import { useAppStore } from '../stores/appStore';
import { useHaptics } from '../hooks/useHaptics';
import { t } from '../i18n';
import type { FeedingSide } from '../stores/types';

interface FeedingTrackerProps {
  locale?: 'en' | 'es';
  onFeedingStart?: (side: FeedingSide) => void;
  onFeedingEnd?: (duration: number, side: FeedingSide) => void;
}

/**
 * FeedingTracker Component - Organic Zen Design
 * 
 * Universal tracking interface with accessible controls.
 */
export function FeedingTracker({
  locale = 'en',
  onFeedingStart,
  onFeedingEnd,
}: FeedingTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const activeFeeding = useActiveFeeding();
  const recommendedSide = useRecommendedSide();
  const dailyStats = useDailyFeedingStats();
  const { startFeeding, endFeeding } = useFeedingStore();
  const { trigger } = useHaptics();
  const isNight = useAppStore((s) => s.isNightTime);
  
  const translations = t(locale);
  
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
        const duration = Math.floor((Date.now() - activeFeeding.startTime) / 1000);
        endFeeding();
        onFeedingEnd?.(duration, side);
      } else {
        trigger('tap');
        endFeeding();
        startFeeding(side);
        onFeedingStart?.(side);
      }
    } else {
      trigger('tap');
      startFeeding(side);
      onFeedingStart?.(side);
    }
  }, [activeFeeding, trigger, startFeeding, endFeeding, onFeedingStart, onFeedingEnd]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const SideButton = ({ side, label, symbol }: { side: FeedingSide; label: string; symbol: string }) => {
    const isActive = activeFeeding?.side === side;
    const isRecommended = !activeFeeding && recommendedSide === side && side !== 'bottle';
    
    return (
      <motion.button
        onClick={() => handleSidePress(side)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isActive 
            ? '0 0 30px rgba(100, 181, 246, 0.4)'
            : isRecommended
              ? '0 0 20px rgba(212, 175, 55, 0.3)'
              : 'none',
        }}
        aria-label={`${label}${isActive ? ', currently active' : ''}${isRecommended ? ', recommended' : ''}`}
        aria-pressed={isActive}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: `2px solid ${
            isActive ? '#64B5F6' 
            : isRecommended ? '#D4AF37' 
            : isNight ? 'rgba(232, 224, 213, 0.2)' : 'rgba(44, 36, 32, 0.1)'
          }`,
          backgroundColor: isActive 
            ? 'rgba(100, 181, 246, 0.15)' 
            : isNight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span style={{ fontSize: 24 }} aria-hidden="true">{symbol}</span>
        <span
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: 11,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#64B5F6' : isNight ? '#E8E0D5' : '#2C2420',
          }}
        >
          {label}
        </span>
      </motion.button>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <h2
          id="feeding-section"
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 22,
            fontWeight: 500,
            color: isNight ? '#E8E0D5' : '#2C2420',
            letterSpacing: '-0.01em',
          }}
        >
          {translations.rhythm.feeding.title}
        </h2>
      </div>
      
      {/* Active feeding display */}
      <AnimatePresence>
        {activeFeeding && (
          <motion.div
            key="active-feeding"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            style={{
              background: 'rgba(100, 181, 246, 0.1)',
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              textAlign: 'center',
              border: '1px solid rgba(100, 181, 246, 0.2)',
            }}
            role="status"
            aria-live="polite"
          >
            <p
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 13,
                color: '#64B5F6',
                marginBottom: 8,
              }}
            >
              {activeFeeding.side === 'left' ? '← Left Side' : 
               activeFeeding.side === 'right' ? 'Right Side →' : '○ Bottle'}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 42,
                fontWeight: 300,
                color: isNight ? '#90B0C0' : '#4A90B0',
                letterSpacing: '-0.02em',
              }}
            >
              {formatTime(elapsedTime)}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                color: isNight ? '#6B6560' : '#8B8178',
                marginTop: 8,
              }}
            >
              Tap same side to stop
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Side selection */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginBottom: 32,
        }}
        role="group"
        aria-label="Feeding side selection"
      >
        <div style={{ textAlign: 'center' }}>
          <SideButton side="left" label={translations.rhythm.feeding.leftSide} symbol="◐" />
          {!activeFeeding && recommendedSide === 'left' && (
            <p style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 10,
              color: '#D4AF37',
              marginTop: 8,
            }}>
              Recommended
            </p>
          )}
        </div>
        
        <SideButton side="bottle" label={translations.rhythm.feeding.bottle} symbol="○" />
        
        <div style={{ textAlign: 'center' }}>
          <SideButton side="right" label={translations.rhythm.feeding.rightSide} symbol="◑" />
          {!activeFeeding && recommendedSide === 'right' && (
            <p style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 10,
              color: '#D4AF37',
              marginTop: 8,
            }}>
              Recommended
            </p>
          )}
        </div>
      </div>
      
      {/* Daily stats */}
      <div
        style={{
          background: isNight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${isNight ? 'rgba(232, 224, 213, 0.1)' : 'rgba(212, 175, 55, 0.1)'}`,
        }}
        role="region"
        aria-label="Today's feeding statistics"
      >
        <h3
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 15,
            fontWeight: 500,
            color: isNight ? '#E8E0D5' : '#2C2420',
            marginBottom: 16,
          }}
        >
          Today's Feedings
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
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
                  fontSize: 24,
                  fontWeight: 300,
                  color: isNight ? '#90B0C0' : '#4A90B0',
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: 10,
                  color: isNight ? '#6B6560' : '#8B8178',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeedingTracker;
