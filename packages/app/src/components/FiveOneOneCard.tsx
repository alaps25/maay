'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useContractionPattern } from '../stores/contractionStore';
import { useAppStore } from '../stores/appStore';
import { framerSpring } from './vector/spring';
import { t } from '../i18n';

interface FiveOneOneCardProps {
  locale?: 'en' | 'es';
  onContactProvider?: () => void;
}

/**
 * FiveOneOneCard - Living Vector Design
 * 
 * Minimal alert card with thin borders.
 * Subtle animation, no jarring colors.
 */
export function FiveOneOneCard({ 
  locale = 'en',
  onContactProvider 
}: FiveOneOneCardProps) {
  const pattern = useContractionPattern();
  const isNight = useAppStore((s) => s.isNightTime);
  const translations = t(locale);
  const lineColor = isNight ? '#E8E0D5' : '#2C2420';
  
  if (!pattern?.meetsFiveOneOne) return null;
  
  return (
    <AnimatePresence>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={framerSpring}
        style={{
          marginTop: 32,
          padding: 24,
          border: `1px solid ${lineColor}15`,
        }}
        role="alert"
        aria-labelledby="care-guidance-title"
      >
        {/* Header */}
        <header style={{ marginBottom: 16 }}>
          <h3
            id="care-guidance-title"
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 16,
              fontWeight: 400,
              color: lineColor,
              letterSpacing: '-0.01em',
            }}
          >
            {translations.wait.fiveOneOne.title}
          </h3>
        </header>
        
        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: 13,
            color: lineColor,
            opacity: 0.6,
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          {translations.wait.fiveOneOne.description}
        </p>
        
        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '16px 0',
            borderTop: `1px solid ${lineColor}08`,
            borderBottom: `1px solid ${lineColor}08`,
            marginBottom: 20,
          }}
          role="group"
          aria-label="Contraction pattern statistics"
        >
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 24,
                fontWeight: 300,
                color: lineColor,
              }}
            >
              {pattern.averageInterval.toFixed(1)}
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
              min apart
            </span>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 24,
                fontWeight: 300,
                color: lineColor,
              }}
            >
              {pattern.averageDuration}
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
              sec long
            </span>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 24,
                fontWeight: 300,
                color: lineColor,
              }}
            >
              {pattern.consistentForMinutes}
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
              min pattern
            </span>
          </div>
        </div>
        
        {/* Guidance */}
        <p
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: 12,
            color: lineColor,
            opacity: 0.5,
            lineHeight: 1.7,
            marginBottom: onContactProvider ? 20 : 0,
          }}
        >
          {translations.wait.fiveOneOne.guidance}
        </p>
        
        {/* CTA Button */}
        {onContactProvider && (
          <motion.button
            onClick={onContactProvider}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={framerSpring}
            style={{
              width: '100%',
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 14,
              fontWeight: 400,
              color: isNight ? '#000' : '#FDFBF7',
              backgroundColor: lineColor,
              border: 'none',
              padding: '12px 24px',
              cursor: 'pointer',
            }}
          >
            {translations.wait.fiveOneOne.callToAction}
          </motion.button>
        )}
      </motion.article>
    </AnimatePresence>
  );
}

export default FiveOneOneCard;
