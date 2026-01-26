'use client';

import { useRef, useEffect, useCallback } from 'react';
import { fbm } from './noise';

export type MorphStage = 
  | 'rings'        // Contraction rings
  | 'untying'      // Rings begin to separate
  | 'flowing'      // Lines straighten and flow
  | 'swirling'     // Lines swirl into new form
  | 'feeding'      // Feeding arcs form
  | 'particles';   // Celebration particles

interface LineMorphProps {
  stage: MorphStage;
  progress?: number; // 0-1 for transition progress
  size?: number;
  strokeWidth?: number;
  color?: string;
  onMorphComplete?: () => void;
  className?: string;
}

/**
 * LineMorph Component
 * 
 * Handles the "untying" transition when Baby arrives.
 * Lines never jump - they morph, stretch, and coil fluidly.
 * 
 * Stages:
 * 1. rings → untying: Rings separate and begin to uncoil
 * 2. untying → flowing: Lines straighten into flowing streams
 * 3. flowing → swirling: Lines swirl gracefully
 * 4. swirling → feeding: Lines settle into feeding arc formation
 */
export function LineMorph({
  stage,
  progress = 0,
  size = 300,
  strokeWidth = 1.5,
  color = '#2C2420',
  onMorphComplete,
  className = '',
}: LineMorphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const stageRef = useRef(stage);
  const progressRef = useRef(progress);
  
  useEffect(() => {
    stageRef.current = stage;
    progressRef.current = progress;
  }, [stage, progress]);
  
  // Interpolate between two points
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  
  // Ease function for smooth transitions
  const easeInOutCubic = (t: number) => 
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  
  // Generate ring points
  const getRingPoints = useCallback((
    cx: number, cy: number, radius: number, segments: number, time: number
  ) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2;
      const noise = fbm(t * 3, time * 0.3, 2) * 2;
      points.push({
        x: cx + Math.cos(angle) * (radius + noise),
        y: cy + Math.sin(angle) * (radius + noise),
      });
    }
    return points;
  }, []);
  
  // Generate flowing line points
  const getFlowPoints = useCallback((
    startX: number, startY: number, 
    endX: number, endY: number,
    segments: number, time: number, amplitude: number
  ) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = lerp(startX, endX, t);
      const baseY = lerp(startY, endY, t);
      const wave = Math.sin(t * Math.PI * 4 + time) * amplitude;
      const noise = fbm(t * 2, time * 0.5, 2) * amplitude * 0.5;
      points.push({
        x: x + noise,
        y: baseY + wave + noise,
      });
    }
    return points;
  }, []);
  
  // Generate arc points for feeding
  const getArcPoints = useCallback((
    cx: number, cy: number, radius: number,
    startAngle: number, endAngle: number,
    segments: number, time: number
  ) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = lerp(startAngle, endAngle, t);
      const noise = fbm(t * 3, time * 0.3, 2) * 1;
      points.push({
        x: cx + Math.cos(angle) * (radius + noise),
        y: cy + Math.sin(angle) * (radius + noise),
      });
    }
    return points;
  }, []);
  
  // Generate particle points
  const getParticlePoints = useCallback((
    cx: number, cy: number, radius: number,
    count: number, time: number
  ) => {
    const points: { x: number; y: number; size: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + time * 0.2;
      const r = radius * (0.3 + fbm(i * 0.5, time * 0.3, 2) * 0.7);
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        size: 1 + fbm(i, time * 0.5, 2) * 2,
      });
    }
    return points;
  }, []);
  
  // Draw smooth curve through points
  const drawCurve = useCallback((
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    closed: boolean = false,
    opacity: number = 1
  ) => {
    if (points.length < 2) return;
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    if (closed) {
      ctx.closePath();
    } else {
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);
  
  // Draw particles
  const drawParticles = useCallback((
    ctx: CanvasRenderingContext2D,
    particles: { x: number; y: number; size: number }[]
  ) => {
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  
  // Main animation
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
    const baseRadius = size * 0.35;
    
    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const currentStage = stageRef.current;
      const p = progressRef.current;
      const eased = easeInOutCubic(p);
      
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      switch (currentStage) {
        case 'rings': {
          // Draw 3 concentric rings
          for (let r = 0; r < 3; r++) {
            const radius = baseRadius * (0.6 + r * 0.2);
            const points = getRingPoints(cx, cy, radius, 64, time);
            drawCurve(ctx, points, true, 0.3 + r * 0.2);
          }
          break;
        }
        
        case 'untying': {
          // Rings separate and begin to open
          for (let r = 0; r < 3; r++) {
            const radius = baseRadius * (0.6 + r * 0.2);
            const gapStart = eased * Math.PI * 0.5;
            const gapEnd = Math.PI * 2 - gapStart;
            
            // Draw partial ring with gap
            const startAngle = gapStart + r * 0.1;
            const endAngle = gapEnd - r * 0.1;
            const points = getArcPoints(cx, cy, radius, startAngle, endAngle, 48, time);
            drawCurve(ctx, points, false, 0.3 + r * 0.2);
          }
          break;
        }
        
        case 'flowing': {
          // Lines straighten into flowing streams
          const spreadY = eased * size * 0.3;
          for (let l = 0; l < 3; l++) {
            const yOffset = (l - 1) * spreadY * 0.5;
            const points = getFlowPoints(
              size * 0.1, cy + yOffset,
              size * 0.9, cy + yOffset,
              32, time, 10 * (1 - eased * 0.5)
            );
            drawCurve(ctx, points, false, 0.4 + l * 0.15);
          }
          break;
        }
        
        case 'swirling': {
          // Lines swirl gracefully
          const turns = 1 + eased * 2;
          for (let l = 0; l < 3; l++) {
            const spiralRadius = baseRadius * (0.3 + l * 0.25);
            const points: { x: number; y: number }[] = [];
            const segments = 60;
            
            for (let i = 0; i <= segments; i++) {
              const t = i / segments;
              const angle = t * Math.PI * 2 * turns + time * 0.5 + l;
              const r = spiralRadius * (0.2 + t * 0.8);
              const noise = fbm(t * 3 + l, time * 0.3, 2) * 2;
              points.push({
                x: cx + Math.cos(angle) * (r + noise),
                y: cy + Math.sin(angle) * (r + noise),
              });
            }
            drawCurve(ctx, points, false, 0.3 + l * 0.2);
          }
          break;
        }
        
        case 'feeding': {
          // Lines settle into left/right feeding arcs
          const leftArc = getArcPoints(
            cx - size * 0.15, cy, baseRadius * 0.5,
            Math.PI * 0.3, Math.PI * 0.7, 32, time
          );
          const rightArc = getArcPoints(
            cx + size * 0.15, cy, baseRadius * 0.5,
            Math.PI * 1.3, Math.PI * 1.7, 32, time
          );
          
          drawCurve(ctx, leftArc, false, 0.5);
          drawCurve(ctx, rightArc, false, 0.5);
          
          // Center circle for bottle
          const bottlePoints = getRingPoints(cx, cy, baseRadius * 0.25, 32, time);
          drawCurve(ctx, bottlePoints, true, 0.4);
          break;
        }
        
        case 'particles': {
          // Celebration particles
          const particles = getParticlePoints(cx, cy, baseRadius, 30, time);
          ctx.globalAlpha = 0.6;
          drawParticles(ctx, particles);
          ctx.globalAlpha = 1;
          break;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [
    size, strokeWidth, color,
    getRingPoints, getFlowPoints, getArcPoints, getParticlePoints,
    drawCurve, drawParticles
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

export default LineMorph;
