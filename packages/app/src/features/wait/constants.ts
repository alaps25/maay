/**
 * Breathing cycle constants
 * Medical standard breathing for labor (paced breathing technique)
 * Promotes relaxation, oxygen flow, and pelvic floor relaxation during contractions
 * Based on doula/Lamaze recommendations - no breath holding during labor
 */

// Default breathing durations (used for early labor / no pattern detected)
export const INHALE_DURATION = 4000;  // 4 seconds - breathe in through nose
export const EXHALE_DURATION = 6000;  // 6 seconds - breathe out through mouth (longer exhale promotes relaxation)
export const CYCLE_DURATION = INHALE_DURATION + EXHALE_DURATION; // 10 seconds total

import type { LaborPhase } from '../../stores/types';

/**
 * Adaptive breathing durations based on labor phase
 * 
 * Medical rationale:
 * - Early labor: Normal pace helps establish rhythm
 * - Active labor: Slower breathing helps manage increasing intensity
 * - Transition: Slowest pace promotes maximum relaxation during peak intensity
 * 
 * Longer exhales in all phases promote:
 * - Parasympathetic nervous system activation
 * - Pelvic floor relaxation
 * - Pain management through focused breathing
 */
export type { LaborPhase };

export interface BreathingDurations {
  inhale: number;
  exhale: number;
  cycle: number;
}

// Breathing configurations per labor phase
const BREATHING_BY_PHASE: Record<LaborPhase, BreathingDurations> = {
  // No pattern detected - use default
  none: {
    inhale: 4000,  // 4s
    exhale: 6000,  // 6s
    cycle: 10000,  // 10s total
  },
  // Early labor (5-20 min apart, 30-45s duration)
  // Normal pace to establish rhythm
  early: {
    inhale: 4000,  // 4s
    exhale: 6000,  // 6s
    cycle: 10000,  // 10s total
  },
  // Active labor (3-5 min apart, 45-60s duration)
  // Slower pace for increasing intensity
  active: {
    inhale: 5000,  // 5s
    exhale: 8000,  // 8s
    cycle: 13000,  // 13s total
  },
  // Transition (2-3 min apart, 60-90s duration)
  // Slowest pace for peak intensity
  transition: {
    inhale: 6000,  // 6s
    exhale: 10000, // 10s
    cycle: 16000,  // 16s total
  },
};

/**
 * Get adaptive breathing durations based on current labor phase
 */
export function getAdaptiveBreathingDurations(laborPhase: LaborPhase): BreathingDurations {
  return BREATHING_BY_PHASE[laborPhase] || BREATHING_BY_PHASE.none;
}

/**
 * Wavy border animation parameters for water broke entry
 */
export const wavyBorderParams = {
  amplitude: 0.6,
  wavelength: 52, // pixels per wave cycle
  speed: 0.05,
  strokeWidth: 1,
  strokeOpacity: 0.6,
};

export type WavyBorderParams = typeof wavyBorderParams;
