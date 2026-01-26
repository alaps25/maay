'use client';

import { motion } from 'framer-motion';
import { useDiaperStore, useCurrentDay, useDiaperStats } from '../stores/diaperStore';
import { useAppStore } from '../stores/appStore';
import { useHaptics } from '../hooks/useHaptics';
import { framerSpring } from './vector/spring';
import { t, diaperExpectations } from '../i18n';
import type { DiaperType } from '../stores/types';

interface DiaperLogProps {
  locale?: 'en' | 'es';
  onEntryAdded?: (type: DiaperType) => void;
}

/**
 * DiaperLog - Living Vector Design
 * 
 * Minimal tracking interface with thin lines.
 * Progress shown as simple dots, not filled bars.
 */
export function DiaperLog({
  locale = 'en',
  onEntryAdded,
}: DiaperLogProps) {
  const currentDay = useCurrentDay();
  const stats = useDiaperStats();
  const { addEntry, getTodayEntries } = useDiaperStore();
  const { trigger } = useHaptics();
  const isNight = useAppStore((s) => s.isNightTime);
  
  const translations = t(locale);
  const lineColor = isNight ? '#E8E0D5' : '#2C2420';
  
  const handleAddEntry = (type: DiaperType) => {
    trigger('tap');
    addEntry(type);
    onEntryAdded?.(type);
    
    const newStats = useDiaperStore.getState().getDayStats();
    if (newStats.meetsExpectation && !stats.meetsExpectation) {
      trigger('success');
    }
  };
  
  const expectation = diaperExpectations[Math.min(currentDay - 1, 6)];
  const todayEntries = getTodayEntries();

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
          id="diaper-section"
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 18,
            fontWeight: 400,
            color: lineColor,
          }}
        >
          {translations.rhythm.diaper.title}
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: 11,
            color: lineColor,
            opacity: 0.4,
          }}
        >
          Day {currentDay}
        </span>
      </div>
      
      {/* Progress display */}
      <div
        style={{
          padding: '20px 0',
          borderTop: `1px solid ${lineColor}08`,
          borderBottom: `1px solid ${lineColor}08`,
          marginBottom: 24,
        }}
        role="region"
        aria-label="Daily progress"
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
          {/* Wet progress */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
              {Array.from({ length: expectation.wet }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, ...framerSpring }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: `1px solid ${lineColor}`,
                    backgroundColor: i < stats.wet ? lineColor : 'transparent',
                    opacity: i < stats.wet ? 0.8 : 0.2,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 10,
                color: lineColor,
                opacity: 0.4,
              }}
            >
              {stats.wet}/{expectation.wet} wet
            </span>
          </div>
          
          {/* Dirty progress */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
              {Array.from({ length: expectation.dirty }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 + 0.2, ...framerSpring }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: `1px solid ${lineColor}`,
                    backgroundColor: i < stats.dirty ? lineColor : 'transparent',
                    opacity: i < stats.dirty ? 0.8 : 0.2,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 10,
                color: lineColor,
                opacity: 0.4,
              }}
            >
              {stats.dirty}/{expectation.dirty} dirty
            </span>
          </div>
        </div>
        
        {/* Milestone status */}
        {stats.meetsExpectation && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 11,
              color: lineColor,
              opacity: 0.5,
              textAlign: 'center',
            }}
            role="status"
          >
            Day {currentDay} expectations met
          </motion.p>
        )}
      </div>
      
      {/* Quick add buttons */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
        }}
        role="group"
        aria-label="Log diaper change"
      >
        {[
          { type: 'wet' as DiaperType, label: translations.rhythm.diaper.wet },
          { type: 'dirty' as DiaperType, label: translations.rhythm.diaper.dirty },
          { type: 'both' as DiaperType, label: translations.rhythm.diaper.both },
        ].map(({ type, label }) => (
          <motion.button
            key={type}
            onClick={() => handleAddEntry(type)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={framerSpring}
            style={{
              flex: 1,
              padding: '14px 8px',
              border: `1px solid ${lineColor}15`,
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 13,
              color: lineColor,
            }}
            aria-label={`Log ${label} diaper`}
          >
            {label}
          </motion.button>
        ))}
      </div>
      
      {/* Today's log */}
      {todayEntries.length > 0 && (
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 13,
              fontWeight: 400,
              color: lineColor,
              opacity: 0.6,
              marginBottom: 12,
            }}
          >
            Today
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {todayEntries.slice(-8).reverse().map((entry) => (
              <span
                key={entry.id}
                style={{
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: 10,
                  color: lineColor,
                  opacity: 0.4,
                  padding: '4px 8px',
                  border: `1px solid ${lineColor}08`,
                }}
              >
                {entry.type} · {new Date(entry.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DiaperLog;
