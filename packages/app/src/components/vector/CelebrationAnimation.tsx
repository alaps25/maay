'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { perlin2D } from './noise';

export type CelebrationPhase = 'idle' | 'dissolving' | 'complete';

interface CelebrationAnimationProps {
  phase: CelebrationPhase;
  onDissolveComplete?: () => void;
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  hoverOffsetX: number;
  hoverOffsetY: number;
  hoverSpeed: number;
}

export function CelebrationAnimation({
  phase,
  onDissolveComplete,
  width = 400,
  height = 600,
  strokeWidth = 1.2,
  color = '#1a1a1a',
}: CelebrationAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const phaseRef = useRef<CelebrationPhase>(phase);
  const dissolveProgressRef = useRef(0);
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  const ringPointsRef = useRef<{ x: number; y: number }[][]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const cx = width / 2;
  const cy = height / 2;
  
  // Ring parameters (matching OrganicWaves)
  const lineCount = 15;
  const minRadiusPercent = 26;
  const maxRadiusPercent = 79;
  const minRadius = Math.min(width, height) * (minRadiusPercent / 100);
  const maxRadius = Math.min(width, height) * (maxRadiusPercent / 100);
  const segments = 120;
  const spacingExponent = 1.75;
  
  // Generate ring points (same as OrganicWaves)
  const generateRingPoints = useCallback((ringIndex: number, time: number) => {
    const points: { x: number; y: number }[] = [];
    const ringRatio = lineCount > 1 ? ringIndex / (lineCount - 1) : 0;
    const exponentialRatio = Math.pow(ringRatio, spacingExponent);
    const baseRadius = minRadius + (maxRadius - minRadius) * exponentialRatio;
    const ringPhase = ringIndex * 17.3;
    const innerTightness = 0.035;
    const outerLooseness = 0.2;
    const looseness = innerTightness + (outerLooseness - innerTightness) * ringRatio;
    const waviness = 1.1;
    const flowSpeed = 0.03;
    
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2;
      
      const flow1 = perlin2D(
        Math.cos(angle) * (1 + ringRatio) * waviness + time * flowSpeed + ringPhase,
        Math.sin(angle) * (1 + ringRatio) * waviness + time * flowSpeed * 0.7
      );
      
      const distortionAmount = baseRadius * looseness;
      const organicOffset = flow1 * 0.45 * distortionAmount;
      const radius = baseRadius + organicOffset;
      
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    return points;
  }, [cx, cy, minRadius, maxRadius, lineCount, segments, spacingExponent]);
  
  // Initialize ring points and particles from ALL rings
  const initializeParticles = useCallback(() => {
    if (isInitialized) return;
    
    const time = timeRef.current;
    const particles: Particle[] = [];
    ringPointsRef.current = [];
    
    for (let ringIndex = 0; ringIndex < lineCount; ringIndex++) {
      const points = generateRingPoints(ringIndex, time);
      ringPointsRef.current.push(points);
      
      const ringRatio = ringIndex / (lineCount - 1);
      const step = 2; // Sample every 2nd point
      
      for (let i = 0; i < points.length; i += step) {
        const point = points[i];
        
        particles.push({
          x: point.x,
          y: point.y,
          baseX: point.x,
          baseY: point.y,
          size: 1.2 + Math.random() * 1.8,
          opacity: 0.55 - ringRatio * 0.35,
          hoverOffsetX: Math.random() * Math.PI * 2,
          hoverOffsetY: Math.random() * Math.PI * 2,
          hoverSpeed: 0.6 + Math.random() * 0.5,
        });
      }
    }
    
    particlesRef.current = particles;
    setIsInitialized(true);
  }, [isInitialized, generateRingPoints, lineCount]);
  
  // Update phase ref
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  
  // Initialize when dissolving starts
  useEffect(() => {
    if (phase === 'dissolving' && !isInitialized) {
      initializeParticles();
    }
  }, [phase, isInitialized, initializeParticles]);
  
  // Handle dissolve animation
  useEffect(() => {
    if (phase === 'dissolving' && isInitialized) {
      dissolveProgressRef.current = 0;
      
      const dissolveInterval = setInterval(() => {
        dissolveProgressRef.current += 0.008; // Slower dissolve
        
        if (dissolveProgressRef.current >= 1) {
          dissolveProgressRef.current = 1;
          clearInterval(dissolveInterval);
          onDissolveComplete?.();
        }
      }, 16);
      
      return () => clearInterval(dissolveInterval);
    }
  }, [phase, isInitialized, onDissolveComplete]);
  
  // Easing
  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const currentPhase = phaseRef.current;
      
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentPhase === 'idle') {
        // Draw rings with heartbeat (same as OrganicWaves)
        const heartbeatInterval = 60 / 34;
        const beatPhase = (time % heartbeatInterval) / heartbeatInterval;
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const pulseWavePosition = easeOutCubic(beatPhase);
        const pulseIntensityMultiplier = 1 - easeOutCubic(beatPhase) * 0.7;
        
        for (let i = lineCount - 1; i >= 0; i--) {
          const ringRatio = i / (lineCount - 1);
          const points = generateRingPoints(i, time);
          
          const distanceFromPulseWave = pulseWavePosition - ringRatio;
          const pulseWidth = 0.4;
          let pulseAmount = 0;
          if (distanceFromPulseWave > -pulseWidth && distanceFromPulseWave < pulseWidth) {
            const normalizedDist = distanceFromPulseWave / pulseWidth;
            pulseAmount = Math.exp(-normalizedDist * normalizedDist * 2) * pulseIntensityMultiplier;
          }
          
          const baseOpacity = 0.55 - ringRatio * 0.35;
          const opacity = baseOpacity + pulseAmount * 0.12;
          const blur = ringRatio * ringRatio * 3.5;
          
          ctx.save();
          if (blur > 0) ctx.filter = `blur(${blur}px)`;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = strokeWidth * (1.2 - ringRatio * 0.5);
          
          ctx.beginPath();
          drawSmoothCurve(ctx, points);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
      } else if (currentPhase === 'dissolving' || currentPhase === 'complete') {
        const easedDissolve = easeInOutCubic(dissolveProgressRef.current);
        
        // Draw fading rings during dissolve
        if (currentPhase === 'dissolving' && ringPointsRef.current.length > 0) {
          const fadeOut = 1 - easedDissolve;
          
          for (let i = lineCount - 1; i >= 0; i--) {
            const ringRatio = i / (lineCount - 1);
            const points = ringPointsRef.current[i];
            if (!points || fadeOut <= 0) continue;
            
            const baseOpacity = (0.55 - ringRatio * 0.35) * fadeOut;
            const blur = ringRatio * ringRatio * 3.5;
            
            ctx.save();
            if (blur > 0) ctx.filter = `blur(${blur}px)`;
            ctx.globalAlpha = baseOpacity;
            ctx.lineWidth = strokeWidth * (1.2 - ringRatio * 0.5);
            
            ctx.beginPath();
            drawSmoothCurve(ctx, points);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
        }
        
        // Draw hovering particles
        const particles = particlesRef.current;
        particles.forEach((particle) => {
          const hoverX = Math.sin(time * particle.hoverSpeed + particle.hoverOffsetX) * 12;
          const hoverY = Math.cos(time * particle.hoverSpeed * 0.7 + particle.hoverOffsetY) * 10;
          
          const x = particle.baseX + hoverX * easedDissolve;
          const y = particle.baseY + hoverY * easedDissolve;
          
          ctx.fillStyle = color;
          ctx.globalAlpha = particle.opacity * Math.min(easedDissolve * 2, 1) * 0.6;
          ctx.beginPath();
          ctx.arc(x, y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height, strokeWidth, color, generateRingPoints, lineCount, cx, cy]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}

// Helper to draw smooth bezier curve
function drawSmoothCurve(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
  for (let j = 0; j < points.length; j++) {
    const p0 = points[(j - 1 + points.length) % points.length];
    const p1 = points[j];
    const p2 = points[(j + 1) % points.length];
    const p3 = points[(j + 2) % points.length];
    
    if (j === 0) ctx.moveTo(p1.x, p1.y);
    
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

export default CelebrationAnimation;
