'use client';

import { useRef, useEffect, useCallback } from 'react';
import { fbm } from './noise';

export type RingState = 'idle' | 'pressed' | 'breathing' | 'releasing' | 'celebrating';

interface VectorRingsProps {
  state: RingState;
  size?: number;
  ringCount?: number;
  strokeWidth?: number;
  color?: string;
  intensity?: number;
  breathPhase?: number; // 0-1 for inhale/hold/exhale
  className?: string;
}

/**
 * VectorRings Component
 * 
 * Concentric, vibrating vector rings for the Aura Button.
 * - Idle: Subtle float animation (0.5Hz)
 * - Pressed: Rings tighten and begin breathing wave
 * - Breathing: Sine-wave expansion/contraction
 * - Intensity: Perlin noise frequency increases with contraction
 */
export function VectorRings({
  state,
  size = 280,
  ringCount = 5,
  strokeWidth = 1.5,
  color = '#2C2420',
  intensity = 0,
  breathPhase = 0,
  className = '',
}: VectorRingsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const stateRef = useRef(state);
  const intensityRef = useRef(intensity);
  const breathPhaseRef = useRef(breathPhase);
  
  // Update refs
  useEffect(() => {
    stateRef.current = state;
    intensityRef.current = intensity;
    breathPhaseRef.current = breathPhase;
  }, [state, intensity, breathPhase]);
  
  // Draw a single noisy ring
  const drawNoisyRing = useCallback((
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    time: number,
    noiseAmount: number,
    noiseFrequency: number,
    lineWidth: number,
    lineColor: string,
    opacity: number = 1
  ) => {
    const segments = 120;
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const t = i / segments;
      
      // Apply Perlin noise for organic wiggle
      const noise = fbm(
        t * noiseFrequency + radius * 0.01,
        time * 0.5 + radius * 0.05,
        3
      ) * noiseAmount;
      
      const r = radius + noise;
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }
    
    // Draw smooth curve
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = opacity;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    
    const cx = size / 2;
    const cy = size / 2;
    const maxRadius = size * 0.42;
    const minRadius = size * 0.15;
    
    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const currentState = stateRef.current;
      const currentIntensity = intensityRef.current;
      const currentBreath = breathPhaseRef.current;
      
      ctx.clearRect(0, 0, size, size);
      
      // Calculate ring parameters based on state
      let baseNoiseAmount = 2;
      let noiseFrequency = 3;
      let breathScale = 1;
      let ringSpacing = 1;
      
      switch (currentState) {
        case 'idle':
          // Subtle 0.5Hz float
          baseNoiseAmount = 2 + Math.sin(time * Math.PI) * 0.5;
          noiseFrequency = 2;
          ringSpacing = 1;
          break;
          
        case 'pressed':
          // Tighten rings
          baseNoiseAmount = 3;
          noiseFrequency = 3;
          ringSpacing = 0.7;
          break;
          
        case 'breathing':
          // Breathing wave - sine pattern
          const breathCycle = Math.sin(currentBreath * Math.PI * 2);
          breathScale = 1 + breathCycle * 0.12;
          baseNoiseAmount = 3 + currentIntensity * 4;
          noiseFrequency = 3 + currentIntensity * 3;
          ringSpacing = 0.7 + breathCycle * 0.1;
          break;
          
        case 'releasing':
          // Rings expand outward
          baseNoiseAmount = 4;
          noiseFrequency = 2;
          ringSpacing = 1.2;
          break;
          
        case 'celebrating':
          // High energy, lots of wiggle
          baseNoiseAmount = 8 + Math.sin(time * 4) * 4;
          noiseFrequency = 5 + Math.sin(time * 2) * 2;
          ringSpacing = 1 + Math.sin(time * 3) * 0.2;
          break;
      }
      
      // Draw rings from outer to inner
      for (let i = 0; i < ringCount; i++) {
        const t = i / (ringCount - 1);
        const baseRadius = minRadius + (maxRadius - minRadius) * (1 - t) * ringSpacing;
        const radius = baseRadius * breathScale;
        
        // Opacity falloff for inner rings
        const opacity = 0.3 + t * 0.7;
        
        // Slightly different noise per ring for depth
        const ringNoise = baseNoiseAmount * (0.5 + t * 0.5);
        const ringFreq = noiseFrequency + i * 0.5;
        
        // Vary stroke width slightly
        const ringStroke = strokeWidth * (0.8 + t * 0.4);
        
        drawNoisyRing(
          ctx,
          cx,
          cy,
          radius,
          time + i * 0.2,
          ringNoise,
          ringFreq,
          ringStroke,
          color,
          opacity
        );
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [size, ringCount, strokeWidth, color, drawNoisyRing]);
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    />
  );
}

export default VectorRings;
