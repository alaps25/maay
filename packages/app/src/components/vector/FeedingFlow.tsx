'use client';

import { useRef, useEffect, useCallback } from 'react';
import { fbm } from './noise';

export type FlowState = 'idle' | 'active' | 'pulsing';
export type FlowSide = 'left' | 'right' | 'bottle';

interface FeedingFlowProps {
  side: FlowSide;
  state: FlowState;
  size?: number;
  strokeWidth?: number;
  color?: string;
  activeColor?: string;
  className?: string;
}

/**
 * FeedingFlow Component
 * 
 * Delicate arching lines for the feeding tracker.
 * - Left/Right: Curved arcs representing each side
 * - Bottle: Circular form
 * - Active: Traveling wave flows from top to bottom
 * - Uses spring physics for organic movement
 */
export function FeedingFlow({
  side,
  state,
  size = 100,
  strokeWidth = 1.5,
  color = '#2C2420',
  activeColor = '#64B5F6',
  className = '',
}: FeedingFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Draw an arc with noise and traveling wave
  const drawFlowingArc = useCallback((
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    time: number,
    currentState: FlowState,
    isLeft: boolean
  ) => {
    const segments = 80;
    const points: { x: number; y: number; t: number }[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = startAngle + t * (endAngle - startAngle);
      
      // Base position
      let x = cx + Math.cos(angle) * radius;
      let y = cy + Math.sin(angle) * radius;
      
      // Apply subtle noise for organic feel
      const noiseAmount = currentState === 'idle' ? 1 : 2;
      const noise = fbm(t * 3, time * 0.3, 2) * noiseAmount;
      
      // Apply noise perpendicular to arc
      const normalAngle = angle + Math.PI / 2;
      x += Math.cos(normalAngle) * noise;
      y += Math.sin(normalAngle) * noise;
      
      points.push({ x, y, t });
    }
    
    // Draw the arc
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth * 0.8;
    ctx.lineCap = 'round';
    ctx.globalAlpha = currentState === 'idle' ? 0.4 : 0.3;
    ctx.stroke();
    
    // Draw traveling wave when active/pulsing
    if (currentState !== 'idle') {
      const waveSpeed = currentState === 'pulsing' ? 1.5 : 0.8;
      const wavePosition = (time * waveSpeed) % 1;
      const waveWidth = 0.25;
      
      ctx.beginPath();
      let started = false;
      
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const distFromWave = Math.abs(pt.t - wavePosition);
        const waveInfluence = Math.max(0, 1 - distFromWave / waveWidth);
        
        if (waveInfluence > 0) {
          // Calculate perpendicular offset for wave bulge
          const angle = startAngle + pt.t * (endAngle - startAngle);
          const normalAngle = angle + Math.PI / 2;
          const bulge = Math.sin(waveInfluence * Math.PI) * 4;
          
          const wx = pt.x + Math.cos(normalAngle) * bulge * (isLeft ? 1 : -1);
          const wy = pt.y + Math.sin(normalAngle) * bulge;
          
          if (!started) {
            ctx.moveTo(wx, wy);
            started = true;
          } else {
            ctx.lineTo(wx, wy);
          }
        }
      }
      
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth * 1.5;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }, [color, activeColor, strokeWidth]);
  
  // Draw bottle shape
  const drawBottle = useCallback((
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    time: number,
    currentState: FlowState
  ) => {
    const segments = 60;
    const points: { x: number; y: number; t: number }[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 - Math.PI / 2;
      
      let x = cx + Math.cos(angle) * radius;
      let y = cy + Math.sin(angle) * radius;
      
      // Apply noise
      const noiseAmount = currentState === 'idle' ? 0.5 : 1.5;
      const noise = fbm(t * 4, time * 0.3, 2) * noiseAmount;
      x += Math.cos(angle) * noise;
      y += Math.sin(angle) * noise;
      
      points.push({ x, y, t });
    }
    
    // Draw base circle
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth * 0.8;
    ctx.globalAlpha = currentState === 'idle' ? 0.4 : 0.3;
    ctx.stroke();
    
    // Draw traveling ring when active
    if (currentState !== 'idle') {
      const wavePosition = (time * 0.8) % 1;
      
      // Inner ring that expands
      const innerRadius = radius * (0.3 + wavePosition * 0.7);
      const innerOpacity = 1 - wavePosition;
      
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = innerOpacity * 0.8;
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }, [color, activeColor, strokeWidth]);
  
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
    const radius = size * 0.4;
    
    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const currentState = stateRef.current;
      
      ctx.clearRect(0, 0, size, size);
      
      if (side === 'bottle') {
        drawBottle(ctx, cx, cy, radius * 0.7, time, currentState);
      } else {
        // Left or right arc
        const isLeft = side === 'left';
        const startAngle = isLeft ? Math.PI * 0.2 : -Math.PI * 0.2;
        const endAngle = isLeft ? Math.PI * 0.8 : Math.PI * 1.2;
        
        drawFlowingArc(
          ctx, cx, cy, radius,
          startAngle, endAngle,
          time, currentState, isLeft
        );
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [size, side, drawFlowingArc, drawBottle]);
  
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

export default FeedingFlow;
