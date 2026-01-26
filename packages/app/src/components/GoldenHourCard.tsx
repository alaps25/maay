'use client';

import { motion } from 'framer-motion';
import { framerSpring } from './vector/spring';
import { t } from '../i18n';
import { useAppStore } from '../stores/appStore';

interface GoldenHourCardProps {
  locale?: 'en' | 'es';
}

/**
 * GoldenHourCard - Living Vector Design
 * 
 * Minimal card with thin borders, no shadows.
 * High-end serif typography.
 */
export function GoldenHourCard({ locale = 'en' }: GoldenHourCardProps) {
  const translations = t(locale);
  const isNight = useAppStore((s) => s.isNightTime);
  const lineColor = isNight ? '#E8E0D5' : '#2C2420';

  const guidelines = [
    {
      title: 'Skin-to-Skin',
      description: translations.moment.goldenHour.skinToSkin,
    },
    {
      title: 'First Feed',
      description: translations.moment.goldenHour.firstFeed,
    },
    {
      title: 'Rest & Bond',
      description: translations.moment.goldenHour.bonding,
    },
  ];

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        border: `1px solid ${lineColor}15`,
        padding: 32,
      }}
      role="region"
      aria-labelledby="golden-hour-title"
    >
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2
          id="golden-hour-title"
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
            fontWeight: 300,
            color: lineColor,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          {translations.moment.goldenHour.title}
        </h2>
        
        {/* Decorative line */}
        <svg 
          width="60" 
          height="2" 
          viewBox="0 0 60 2"
          style={{ opacity: 0.2, marginBottom: 12 }}
          aria-hidden="true"
        >
          <line 
            x1="0" y1="1" x2="60" y2="1" 
            stroke={lineColor} 
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
        
        <p
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 14,
            fontStyle: 'italic',
            color: lineColor,
            opacity: 0.5,
          }}
        >
          {translations.moment.goldenHour.description}
        </p>
      </header>
      
      {/* Guidelines */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
        role="list"
      >
        {guidelines.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, ...framerSpring }}
            style={{
              marginBottom: i < guidelines.length - 1 ? 24 : 0,
              paddingBottom: i < guidelines.length - 1 ? 24 : 0,
              borderBottom: i < guidelines.length - 1 
                ? `1px solid ${lineColor}08` 
                : 'none',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 15,
                fontWeight: 500,
                color: lineColor,
                marginBottom: 6,
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 13,
                color: lineColor,
                opacity: 0.6,
                lineHeight: 1.6,
              }}
            >
              {item.description}
            </p>
          </motion.li>
        ))}
      </ul>
      
      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: 32 }}>
        <p
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 13,
            fontStyle: 'italic',
            color: lineColor,
            opacity: 0.4,
          }}
        >
          This moment is yours
        </p>
      </footer>
    </motion.article>
  );
}

export default GoldenHourCard;
