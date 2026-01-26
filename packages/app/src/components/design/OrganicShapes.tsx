'use client';

import { motion } from 'framer-motion';

/**
 * Abstract organic SVG shapes for the Organic Zen design language.
 * No baby illustrations - only abstract, flowing forms.
 */

interface ShapeProps {
  size?: number;
  color?: string;
  className?: string;
  animate?: boolean;
}

// Flowing wave shape
export function WaveShape({ 
  size = 100, 
  color = '#D4AF37', 
  className = '',
  animate = true 
}: ShapeProps) {
  return (
    <motion.svg
      width={size}
      height={size * 0.3}
      viewBox="0 0 200 60"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={animate ? { 
        pathLength: 1, 
        opacity: 1,
        y: [0, -5, 0],
      } : undefined}
      transition={{
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 1 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
      aria-hidden="true"
    >
      <motion.path
        d="M0 30 Q25 10 50 30 T100 30 T150 30 T200 30"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

// Organic blob/circle
export function BlobShape({ 
  size = 100, 
  color = '#D4AF37', 
  className = '',
  animate = true 
}: ShapeProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      animate={animate ? {
        scale: [1, 1.05, 1],
        rotate: [0, 5, 0, -5, 0],
      } : undefined}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      aria-hidden="true"
    >
      <motion.path
        d="M100 20 
           C140 20 170 50 175 90 
           C180 130 160 170 120 180 
           C80 190 40 170 25 130 
           C10 90 30 40 70 25 
           C85 20 95 20 100 20Z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
    </motion.svg>
  );
}

// Crescent/moon shape
export function CrescentShape({ 
  size = 100, 
  color = '#D4AF37', 
  className = '',
  animate = true 
}: ShapeProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      animate={animate ? {
        rotate: [0, 10, 0],
        opacity: [0.6, 0.8, 0.6],
      } : undefined}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      aria-hidden="true"
    >
      <path
        d="M50 10 
           C75 10 95 35 95 60 
           C95 85 75 100 50 100 
           C60 85 65 70 65 50 
           C65 30 55 15 50 10Z"
        fill={color}
        fillOpacity="0.2"
      />
    </motion.svg>
  );
}

// Infinity/flow shape
export function FlowShape({ 
  size = 120, 
  color = '#D4AF37', 
  className = '',
  animate = true 
}: ShapeProps) {
  return (
    <motion.svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 200 100"
      className={className}
      aria-hidden="true"
    >
      <motion.path
        d="M50 50 
           C50 30 30 20 20 35 
           C10 50 30 70 50 50 
           C70 30 150 30 170 50 
           C190 70 170 80 150 50 
           C130 20 70 70 50 50Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={animate ? { 
          pathLength: [0, 1, 1],
          opacity: [0, 1, 0.6],
        } : undefined}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  );
}

// Concentric circles (zen ripples)
export function RippleShape({ 
  size = 100, 
  color = '#D4AF37', 
  className = '',
  animate = true 
}: ShapeProps) {
  const circles = [0.3, 0.5, 0.7, 0.9];
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      {circles.map((scale, i) => (
        <motion.circle
          key={i}
          cx="50"
          cy="50"
          r={40 * scale}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity={0.3 - i * 0.05}
          initial={{ scale: 0, opacity: 0 }}
          animate={animate ? {
            scale: [scale, scale * 1.1, scale],
            opacity: [0.3 - i * 0.05, 0.5 - i * 0.05, 0.3 - i * 0.05],
          } : undefined}
          transition={{
            duration: 4,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.svg>
  );
}

// Decorative divider
export function DividerShape({ 
  width = 200, 
  color = '#D4AF37', 
  className = '' 
}: { width?: number; color?: string; className?: string }) {
  return (
    <svg
      width={width}
      height="20"
      viewBox="0 0 200 20"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 10 L70 10 Q85 10 100 5 Q115 10 130 10 L200 10"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <circle cx="100" cy="5" r="3" fill={color} fillOpacity="0.6" />
    </svg>
  );
}

export default {
  WaveShape,
  BlobShape,
  CrescentShape,
  FlowShape,
  RippleShape,
  DividerShape,
};
