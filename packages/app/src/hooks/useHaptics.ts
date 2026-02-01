import { useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';

// Haptic patterns for breathing guidance and contraction feedback
export type HapticPattern = 
  | 'inhale' 
  | 'exhale' 
  | 'hold' 
  | 'tap' 
  | 'success' 
  | 'warning'
  | 'contractionEnd';  // Distinct calm release haptic

// Options for adaptive breathing haptics
export interface BreathingHapticOptions {
  inhaleDuration?: number;  // ms, default 4000
  exhaleDuration?: number;  // ms, default 6000
}

interface UseHapticsReturn {
  // Single haptic with optional duration for adaptive breathing
  trigger: (pattern: HapticPattern, options?: BreathingHapticOptions) => void;
  
  // Breathing sequence (uses default durations)
  startBreathingSequence: () => void;
  stopBreathingSequence: () => void;
  isBreathing: boolean;
  
  // Status
  isSupported: boolean;
}

// Check if running in Capacitor native environment
const isCapacitor = typeof window !== 'undefined' && 
  !!(window as any).Capacitor?.isNativePlatform?.();

// Lazy load Capacitor Haptics to avoid SSR issues
let CapacitorHaptics: any = null;
if (isCapacitor) {
  import('@capacitor/haptics').then(module => {
    CapacitorHaptics = module.Haptics;
  }).catch(() => {
    // Haptics not available
  });
}

/**
 * useHaptics Hook
 * 
 * Provides haptic feedback for the app, with special breathing patterns
 * for contraction assistance. Uses Capacitor Haptics on native iOS,
 * falls back to vibration API on web where supported.
 * 
 * Enhanced patterns:
 * - Stronger, more pronounced breathing haptics (inhale/exhale)
 * - Distinct "contractionEnd" haptic that feels like a calm release
 */
export function useHaptics(): UseHapticsReturn {
  const settings = useAppStore((s) => s.settings);
  const breathingRef = useRef<NodeJS.Timeout | null>(null);
  const isBreathingRef = useRef(false);
  
  // Check if haptics are supported
  const isSupported = typeof navigator !== 'undefined' && 
    ('vibrate' in navigator || isCapacitor);
  
  // Trigger a single haptic pattern with optional adaptive durations
  const trigger = useCallback((pattern: HapticPattern, options?: BreathingHapticOptions) => {
    if (!settings.hapticFeedback || !isSupported) return;
    
    // Try Capacitor Haptics first (iOS native)
    if (isCapacitor && CapacitorHaptics) {
      triggerCapacitorHaptic(pattern, options);
      return;
    }
    
    // Try to use Expo Haptics if available (legacy support)
    const Haptics = (globalThis as any).ExpoHaptics;
    
    if (Haptics) {
      // Native implementation using Expo Haptics
      switch (pattern) {
        case 'inhale':
          // Stronger gradual increase - more pulses
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 150);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 450);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 600);
          break;
          
        case 'exhale':
          // Stronger gradual decrease - more pulses
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 450);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 600);
          break;
          
        case 'hold':
          // Subtle double pulse
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
          break;
          
        case 'tap':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
          
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
          
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
          
        case 'contractionEnd':
          // Calm release pattern: gentle fade out
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 400);
          setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 600);
          break;
      }
    } else if (navigator.vibrate) {
      // Web fallback using Vibration API (stronger patterns)
      switch (pattern) {
        case 'inhale':
          // Stronger building pattern
          navigator.vibrate([30, 80, 50, 80, 80, 80, 120, 80, 150]);
          break;
          
        case 'exhale':
          // Stronger releasing pattern
          navigator.vibrate([150, 80, 120, 80, 80, 80, 50, 80, 30]);
          break;
          
        case 'hold':
          // Double soft pulse
          navigator.vibrate([30, 100, 30]);
          break;
          
        case 'tap':
          navigator.vibrate(20);
          break;
          
        case 'success':
          navigator.vibrate([50, 50, 100]);
          break;
          
        case 'warning':
          navigator.vibrate([100, 50, 100, 50, 100]);
          break;
          
        case 'contractionEnd':
          // Calm release: medium followed by gentle fade
          navigator.vibrate([80, 100, 50, 100, 30, 150, 100]);
          break;
      }
    }
  }, [settings.hapticFeedback, isSupported]);

  // Capacitor Haptics implementation for iOS native
  // Supports adaptive durations - timings scale proportionally
  const triggerCapacitorHaptic = async (pattern: HapticPattern, options?: BreathingHapticOptions) => {
    if (!CapacitorHaptics) return;
    
    // Default durations (can be overridden for adaptive breathing)
    const inhaleDuration = options?.inhaleDuration ?? 4000;
    const exhaleDuration = options?.exhaleDuration ?? 6000;
    
    // Scale factor for adaptive timing (1.0 = default pace)
    const inhaleScale = inhaleDuration / 4000;
    const exhaleScale = exhaleDuration / 6000;
    
    try {
      switch (pattern) {
        case 'inhale':
          // 7 taps: sparse → dense, LIGHT → MEDIUM → HEAVY (builds up)
          // Timings scale with duration for slower/faster breathing
          // Pattern: 1-----1----1---1--1-1-1
          await CapacitorHaptics.impact({ style: 'LIGHT' });                                           // 0ms
          setTimeout(() => CapacitorHaptics.impact({ style: 'LIGHT' }), 1250 * inhaleScale);           // ~31%
          setTimeout(() => CapacitorHaptics.impact({ style: 'MEDIUM' }), 2250 * inhaleScale);          // ~56%
          setTimeout(() => CapacitorHaptics.impact({ style: 'MEDIUM' }), 3000 * inhaleScale);          // ~75%
          setTimeout(() => CapacitorHaptics.impact({ style: 'HEAVY' }), 3500 * inhaleScale);           // ~88%
          setTimeout(() => CapacitorHaptics.impact({ style: 'HEAVY' }), 3750 * inhaleScale);           // ~94%
          setTimeout(() => CapacitorHaptics.impact({ style: 'HEAVY' }), inhaleDuration - 50);          // near end
          break;
          
        case 'exhale':
          // 10 taps: sparse → dense, HEAVY → MEDIUM → LIGHT (releases)
          // Timings scale with duration for slower/faster breathing
          // Pattern: 1------1-----1----1---1--1-1-1-1-1
          await CapacitorHaptics.impact({ style: 'HEAVY' });                                           // 0ms
          setTimeout(() => CapacitorHaptics.impact({ style: 'HEAVY' }), 1500 * exhaleScale);           // ~25%
          setTimeout(() => CapacitorHaptics.impact({ style: 'HEAVY' }), 2750 * exhaleScale);           // ~46%
          setTimeout(() => CapacitorHaptics.impact({ style: 'MEDIUM' }), 3750 * exhaleScale);          // ~63%
          setTimeout(() => CapacitorHaptics.impact({ style: 'MEDIUM' }), 4500 * exhaleScale);          // ~75%
          setTimeout(() => CapacitorHaptics.impact({ style: 'MEDIUM' }), 5000 * exhaleScale);          // ~83%
          setTimeout(() => CapacitorHaptics.impact({ style: 'LIGHT' }), 5350 * exhaleScale);           // ~89%
          setTimeout(() => CapacitorHaptics.impact({ style: 'LIGHT' }), 5600 * exhaleScale);           // ~93%
          setTimeout(() => CapacitorHaptics.impact({ style: 'LIGHT' }), 5800 * exhaleScale);           // ~97%
          setTimeout(() => CapacitorHaptics.impact({ style: 'LIGHT' }), exhaleDuration - 50);          // near end
          break;
          
        case 'hold':
          // Not used - medical guidance says NO breath holding during labor
          break;
          
        case 'tap':
          await CapacitorHaptics.impact({ style: 'LIGHT' });
          break;
          
        case 'success':
          await CapacitorHaptics.notification({ type: 'SUCCESS' });
          break;
          
        case 'warning':
          await CapacitorHaptics.notification({ type: 'WARNING' });
          break;
          
        case 'contractionEnd':
          // Distinct calm release pattern - feels like letting go
          // Medium pulse followed by gentle fade to success
          await CapacitorHaptics.impact({ style: 'MEDIUM' });
          setTimeout(() => CapacitorHaptics.impact({ style: 'LIGHT' }), 200);
          setTimeout(() => CapacitorHaptics.impact({ style: 'LIGHT' }), 400);
          setTimeout(() => CapacitorHaptics.notification({ type: 'SUCCESS' }), 600);
          break;
      }
    } catch (error) {
      // Silently fail if haptics not available
      console.debug('Haptics not available:', error);
    }
  };
  
  // Breathing sequence: 4s inhale, 6s exhale (10s total)
  // Medical standard for labor - NO breath holding per doula/Lamaze recommendations
  // Longer exhale (6s) promotes relaxation and pelvic floor release
  const startBreathingSequence = useCallback(() => {
    if (isBreathingRef.current) return;
    
    isBreathingRef.current = true;
    
    const INHALE_MS = 4000;  // 4 seconds - breathe in through nose
    const EXHALE_MS = 6000;  // 6 seconds - breathe out through mouth
    const CYCLE_MS = INHALE_MS + EXHALE_MS; // 10 seconds total
    
    const breathCycle = () => {
      if (!isBreathingRef.current) return;
      
      // Inhale (4 seconds)
      trigger('inhale');
      
      // Exhale after 4 seconds (6 seconds duration)
      setTimeout(() => {
        if (!isBreathingRef.current) return;
        trigger('exhale');
      }, INHALE_MS);
      
      // Schedule next cycle (10 seconds total)
      breathingRef.current = setTimeout(() => {
        breathCycle();
      }, CYCLE_MS);
    };
    
    breathCycle();
  }, [trigger]);
  
  const stopBreathingSequence = useCallback(() => {
    isBreathingRef.current = false;
    if (breathingRef.current) {
      clearTimeout(breathingRef.current);
      breathingRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBreathingSequence();
    };
  }, [stopBreathingSequence]);
  
  return {
    trigger,
    startBreathingSequence,
    stopBreathingSequence,
    isBreathing: isBreathingRef.current,
    isSupported,
  };
}

export default useHaptics;
