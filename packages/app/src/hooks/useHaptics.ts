import { useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';

// Haptic patterns for breathing guidance
export type HapticPattern = 'inhale' | 'exhale' | 'hold' | 'tap' | 'success' | 'warning';

interface UseHapticsReturn {
  // Single haptic
  trigger: (pattern: HapticPattern) => void;
  
  // Breathing sequence
  startBreathingSequence: () => void;
  stopBreathingSequence: () => void;
  isBreathing: boolean;
  
  // Status
  isSupported: boolean;
}

/**
 * useHaptics Hook
 * 
 * Provides haptic feedback for the app, with special breathing patterns
 * for contraction assistance. Uses Expo Haptics on native, falls back
 * to vibration API on web where supported.
 */
export function useHaptics(): UseHapticsReturn {
  const settings = useAppStore((s) => s.settings);
  const breathingRef = useRef<NodeJS.Timeout | null>(null);
  const isBreathingRef = useRef(false);
  
  // Check if haptics are supported
  const isSupported = typeof navigator !== 'undefined' && 
    ('vibrate' in navigator || typeof window !== 'undefined');
  
  // Trigger a single haptic pattern
  const trigger = useCallback((pattern: HapticPattern) => {
    if (!settings.hapticFeedback || !isSupported) return;
    
    // Try to use Expo Haptics if available (injected at runtime on native)
    const Haptics = (globalThis as any).ExpoHaptics;
    
    if (Haptics) {
      // Native implementation using Expo Haptics
      switch (pattern) {
        case 'inhale':
          // Gradual increase - light to medium
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
          break;
          
        case 'exhale':
          // Gradual decrease - heavy to light
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 400);
          break;
          
        case 'hold':
          // Subtle pulse
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      }
    } else if (navigator.vibrate) {
      // Web fallback using Vibration API
      switch (pattern) {
        case 'inhale':
          navigator.vibrate([50, 100, 100, 100, 150]);
          break;
          
        case 'exhale':
          navigator.vibrate([150, 100, 100, 100, 50]);
          break;
          
        case 'hold':
          navigator.vibrate(30);
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
      }
    }
  }, [settings.hapticFeedback, isSupported]);
  
  // Breathing sequence: 4s inhale, 2s hold, 4s exhale
  const startBreathingSequence = useCallback(() => {
    if (isBreathingRef.current) return;
    
    isBreathingRef.current = true;
    
    const breathCycle = () => {
      if (!isBreathingRef.current) return;
      
      // Inhale (4 seconds)
      trigger('inhale');
      
      // Hold after 4 seconds (2 seconds)
      setTimeout(() => {
        if (!isBreathingRef.current) return;
        trigger('hold');
      }, 4000);
      
      // Exhale after 6 seconds (4 seconds)
      setTimeout(() => {
        if (!isBreathingRef.current) return;
        trigger('exhale');
      }, 6000);
      
      // Schedule next cycle (10 seconds total)
      breathingRef.current = setTimeout(() => {
        breathCycle();
      }, 10000);
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
