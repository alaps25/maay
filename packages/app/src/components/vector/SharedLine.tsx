'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { perlin2D, fbm } from './noise';
import { framerSpring, framerGentleSpring } from './spring';

export type LineShape = 'circle' | 'wave' | 'particle' | 'arc' | 'spiral';
export type LineState = 'idle' | 'active' | 'breathing' | 'morphing' | 'celebrating';

interface SharedLineProps {
  shape: LineShape;
  state: LineState;
  size?: number;
  strokeWidth?: number;
  color?: string;
  intensity?: number;
  frequency?: number;
  className?: string;
  onMorphComplete?: () => void;
}

/**
 * SharedLine Component
 * 
 * The foundation of the Living Vector design system.
 * A single line that can morph between:
 * - Circle (Contraction tracking)
 * - Wave (Feeding flow)
 * - Particle (Celebration)
 * - Arc (Left/Right feeding)
 * - Spiral (Transition states)
 * 
 * All movements use spring physics for organic feel.
 */
export function SharedLine({
  shape,
  state,
  size = 200,
  strokeWidth = 1.5,
  color = '#2C2420',
  intensity = 1,
  frequency = 1,
  className = '',
  onMorphComplete,
}: SharedLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  
  // Spring values for smooth transitions
  const springIntensity = useSpring(intensity, framerGentleSpring);
  const springFrequency = useSpring(frequency, framerGentleSpring);
  
  // Generate points for different shapes
  const generateCirclePoints = useCallback((
    cx: number, 
    cy: number, 
    radius: number, 
    segments: number = 64
  ) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    return pts;
  }, []);
  
  const generateWavePoints = useCallback((
    width: number,
    height: number,
    amplitude: number,
    segments: number = 64
  ) => {
    const pts: { x: number; y: number }[] = [];
    const centerY = height / 2;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      pts.push({
        x: t * width,
        y: centerY + Math.sin(t * Math.PI * 4) * amplitude,
      });
    }
    return pts;
  }, []);
  
  const generateArcPoints = useCallback((
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    segments: number = 32
  ) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = startAngle + t * (endAngle - startAngle);
      pts.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    return pts;
  }, []);
  
  const generateSpiralPoints = useCallback((
    cx: number,
    cy: number,
    maxRadius: number,
    turns: number = 3,
    segments: number = 100
  ) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const radius = t * maxRadius;
      pts.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    return pts;
  }, []);
  
  // Apply noise to points
  const applyNoise = useCallback((
    pts: { x: number; y: number }[],
    time: number,
    noiseIntensity: number,
    noiseFrequency: number
  ) => {
    return pts.map((pt, i) => {
      const t = i / pts.length;
      const noiseX = fbm(t * noiseFrequency + 0, time * 0.3, 3) * noiseIntensity;
      const noiseY = fbm(t * noiseFrequency + 100, time * 0.3, 3) * noiseIntensity;
      return {
        x: pt.x + noiseX,
        y: pt.y + noiseY,
      };
    });
  }, []);
  
  // Apply breathing animation
  const applyBreathing = useCallback((
    pts: { x: number; y: number }[],
    time: number,
    cx: number,
    cy: number,
    breathPhase: number // 0 = inhale, 0.5 = hold, 1 = exhale
  ) => {
    const breathScale = 1 + Math.sin(breathPhase * Math.PI) * 0.15;
    return pts.map(pt => ({
      x: cx + (pt.x - cx) * breathScale,
      y: cy + (pt.y - cy) * breathScale,
    }));
  }, []);
  
  // Draw smooth curve through points
  const drawCurve = useCallback((
    ctx: CanvasRenderingContext2D,
    pts: { x: number; y: number }[],
    lineWidth: number,
    lineColor: string,
    closed: boolean = false
  ) => {
    if (pts.length < 2) return;
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    
    // Use quadratic curves for smoothness
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    
    // Last point
    const last = pts[pts.length - 1];
    if (closed && pts.length > 2) {
      const xc = (last.x + pts[0].x) / 2;
      const yc = (last.y + pts[0].y) / 2;
      ctx.quadraticCurveTo(last.x, last.y, xc, yc);
      ctx.closePath();
    } else {
      ctx.lineTo(last.x, last.y);
    }
    
    ctx.stroke();
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
    const radius = size * 0.35;
    
    let breathPhase = 0;
    
    const animate = () => {
      timeRef.current += 0.016; // ~60fps
      const time = timeRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Generate base points based on shape
      let basePoints: { x: number; y: number }[] = [];
      let isClosed = false;
      
      switch (shape) {
        case 'circle':
          basePoints = generateCirclePoints(cx, cy, radius);
          isClosed = true;
          break;
        case 'wave':
          basePoints = generateWavePoints(size, size, size * 0.15);
          break;
        case 'arc':
          basePoints = generateArcPoints(cx, cy, radius, -Math.PI * 0.8, Math.PI * 0.8);
          break;
        case 'spiral':
          basePoints = generateSpiralPoints(cx, cy, radius);
          break;
        case 'particle':
          // Scatter points for celebration
          basePoints = Array.from({ length: 20 }, () => ({
            x: cx + (Math.random() - 0.5) * size * 0.8,
            y: cy + (Math.random() - 0.5) * size * 0.8,
          }));
          break;
      }
      
      // Calculate noise intensity based on state
      let noiseAmount = 2;
      let noiseFreq = frequency;
      
      switch (state) {
        case 'idle':
          noiseAmount = 2 + Math.sin(time * 0.5) * 1; // 0.5Hz float
          break;
        case 'active':
          noiseAmount = 4 + intensity * 3;
          noiseFreq = frequency * 1.5;
          break;
        case 'breathing':
          breathPhase = (breathPhase + 0.008) % 1;
          basePoints = applyBreathing(basePoints, time, cx, cy, breathPhase);
          noiseAmount = 3;
          break;
        case 'morphing':
          noiseAmount = 8;
          noiseFreq = frequency * 2;
          break;
        case 'celebrating':
          noiseAmount = 10 + Math.sin(time * 3) * 5;
          noiseFreq = frequency * 3;
          break;
      }
      
      // Apply noise
      const noisyPoints = applyNoise(basePoints, time, noiseAmount, noiseFreq);
      
      // Draw the line
      drawCurve(ctx, noisyPoints, strokeWidth, color, isClosed);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [
    shape, state, size, strokeWidth, color, intensity, frequency,
    generateCirclePoints, generateWavePoints, generateArcPoints,
    generateSpiralPoints, applyNoise, applyBreathing, drawCurve
  ]);
  
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

export default SharedLine;
