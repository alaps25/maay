/**
 * Spring Physics Engine
 * 
 * Provides organic, non-mechanical movement for all line animations.
 * Default: Stiffness 40, Damping 7
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  precision: number;
}

export interface SpringState {
  value: number;
  velocity: number;
}

export const defaultSpringConfig: SpringConfig = {
  stiffness: 40,
  damping: 7,
  mass: 1,
  precision: 0.01,
};

export const gentleSpring: SpringConfig = {
  stiffness: 30,
  damping: 10,
  mass: 1,
  precision: 0.01,
};

export const responsiveSpring: SpringConfig = {
  stiffness: 80,
  damping: 12,
  mass: 0.5,
  precision: 0.01,
};

/**
 * Calculate spring physics step
 */
export function springStep(
  current: number,
  target: number,
  velocity: number,
  config: SpringConfig = defaultSpringConfig,
  deltaTime: number = 1 / 60
): SpringState {
  const { stiffness, damping, mass } = config;
  
  const displacement = current - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * velocity;
  const acceleration = (springForce + dampingForce) / mass;
  
  const newVelocity = velocity + acceleration * deltaTime;
  const newValue = current + newVelocity * deltaTime;
  
  return {
    value: newValue,
    velocity: newVelocity,
  };
}

/**
 * Check if spring is at rest
 */
export function isSpringAtRest(
  current: number,
  target: number,
  velocity: number,
  config: SpringConfig = defaultSpringConfig
): boolean {
  return (
    Math.abs(current - target) < config.precision &&
    Math.abs(velocity) < config.precision
  );
}

/**
 * Multi-dimensional spring for 2D points
 */
export function spring2D(
  current: { x: number; y: number },
  target: { x: number; y: number },
  velocity: { x: number; y: number },
  config: SpringConfig = defaultSpringConfig,
  deltaTime: number = 1 / 60
): { position: { x: number; y: number }; velocity: { x: number; y: number } } {
  const xSpring = springStep(current.x, target.x, velocity.x, config, deltaTime);
  const ySpring = springStep(current.y, target.y, velocity.y, config, deltaTime);
  
  return {
    position: { x: xSpring.value, y: ySpring.value },
    velocity: { x: xSpring.velocity, y: ySpring.velocity },
  };
}

/**
 * Framer Motion spring configuration
 */
export const framerSpring = {
  type: 'spring' as const,
  stiffness: 40,
  damping: 7,
  mass: 1,
};

export const framerGentleSpring = {
  type: 'spring' as const,
  stiffness: 30,
  damping: 10,
  mass: 1,
};

export const framerResponsiveSpring = {
  type: 'spring' as const,
  stiffness: 80,
  damping: 12,
  mass: 0.5,
};

export default {
  springStep,
  isSpringAtRest,
  spring2D,
  defaultSpringConfig,
  gentleSpring,
  responsiveSpring,
  framerSpring,
  framerGentleSpring,
  framerResponsiveSpring,
};
