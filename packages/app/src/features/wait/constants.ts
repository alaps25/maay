/**
 * Breathing cycle constants
 * Medical standard breathing for labor (paced breathing technique)
 * Promotes relaxation, oxygen flow, and pelvic floor relaxation during contractions
 * Based on doula/Lamaze recommendations - no breath holding during labor
 */
export const INHALE_DURATION = 4000;  // 4 seconds - breathe in through nose
export const EXHALE_DURATION = 6000;  // 6 seconds - breathe out through mouth (longer exhale promotes relaxation)
export const CYCLE_DURATION = INHALE_DURATION + EXHALE_DURATION; // 10 seconds total

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
