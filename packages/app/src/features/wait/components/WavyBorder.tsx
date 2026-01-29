import React, { useState, useEffect, useCallback } from 'react';
import type { WavyBorderParams } from '../constants';

interface WavyBorderProps {
  width: number;
  height: number;
  color: string;
  radius?: number;
  params: WavyBorderParams;
}

/**
 * Animated wavy border for water broke entry
 * Generates a smooth wavy path around a rounded rectangle
 */
export function WavyBorder({ 
  width, 
  height, 
  color, 
  radius = 12,
  params,
}: WavyBorderProps) {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setPhase(p => p + params.speed);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [params.speed]);
  
  // Generate smooth wavy path around rounded rectangle
  const generateWavyPath = useCallback(() => {
    const { amplitude, wavelength } = params;
    const freq = (2 * Math.PI) / wavelength;
    const points: [number, number][] = [];
    const inset = amplitude + 1; // Ensure waves don't clip
    const r = Math.min(radius, (Math.min(width, height) - 2 * inset) / 2);
    
    // Calculate perimeter for consistent wave distribution
    const straightTop = width - 2 * inset - 2 * r;
    const straightSide = height - 2 * inset - 2 * r;
    const cornerArc = (Math.PI * r) / 2;
    
    // Sample points along the entire perimeter
    const totalLength = 2 * straightTop + 2 * straightSide + 4 * cornerArc;
    const numPoints = Math.max(100, Math.ceil(totalLength / 2));
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const dist = t * totalLength;
      const wave = Math.sin(phase + dist * freq) * amplitude;
      
      let x: number, y: number, nx: number, ny: number;
      
      // Top edge
      if (dist < straightTop) {
        const localT = dist / straightTop;
        x = inset + r + localT * straightTop;
        y = inset;
        nx = 0; ny = -1;
      }
      // Top-right corner
      else if (dist < straightTop + cornerArc) {
        const localDist = dist - straightTop;
        const angle = -Math.PI / 2 + (localDist / cornerArc) * (Math.PI / 2);
        const cx = width - inset - r;
        const cy = inset + r;
        x = cx + Math.cos(angle) * r;
        y = cy + Math.sin(angle) * r;
        nx = Math.cos(angle); ny = Math.sin(angle);
      }
      // Right edge
      else if (dist < straightTop + cornerArc + straightSide) {
        const localDist = dist - straightTop - cornerArc;
        const localT = localDist / straightSide;
        x = width - inset;
        y = inset + r + localT * straightSide;
        nx = 1; ny = 0;
      }
      // Bottom-right corner
      else if (dist < straightTop + 2 * cornerArc + straightSide) {
        const localDist = dist - straightTop - cornerArc - straightSide;
        const angle = 0 + (localDist / cornerArc) * (Math.PI / 2);
        const cx = width - inset - r;
        const cy = height - inset - r;
        x = cx + Math.cos(angle) * r;
        y = cy + Math.sin(angle) * r;
        nx = Math.cos(angle); ny = Math.sin(angle);
      }
      // Bottom edge
      else if (dist < 2 * straightTop + 2 * cornerArc + straightSide) {
        const localDist = dist - straightTop - 2 * cornerArc - straightSide;
        const localT = localDist / straightTop;
        x = width - inset - r - localT * straightTop;
        y = height - inset;
        nx = 0; ny = 1;
      }
      // Bottom-left corner
      else if (dist < 2 * straightTop + 3 * cornerArc + straightSide) {
        const localDist = dist - 2 * straightTop - 2 * cornerArc - straightSide;
        const angle = Math.PI / 2 + (localDist / cornerArc) * (Math.PI / 2);
        const cx = inset + r;
        const cy = height - inset - r;
        x = cx + Math.cos(angle) * r;
        y = cy + Math.sin(angle) * r;
        nx = Math.cos(angle); ny = Math.sin(angle);
      }
      // Left edge
      else if (dist < 2 * straightTop + 3 * cornerArc + 2 * straightSide) {
        const localDist = dist - 2 * straightTop - 3 * cornerArc - straightSide;
        const localT = localDist / straightSide;
        x = inset;
        y = height - inset - r - localT * straightSide;
        nx = -1; ny = 0;
      }
      // Top-left corner
      else {
        const localDist = dist - 2 * straightTop - 3 * cornerArc - 2 * straightSide;
        const angle = Math.PI + (localDist / cornerArc) * (Math.PI / 2);
        const cx = inset + r;
        const cy = inset + r;
        x = cx + Math.cos(angle) * r;
        y = cy + Math.sin(angle) * r;
        nx = Math.cos(angle); ny = Math.sin(angle);
      }
      
      // Apply wave displacement along normal
      points.push([x + nx * wave, y + ny * wave]);
    }
    
    // Build SVG path
    if (points.length < 2) return '';
    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i][0]} ${points[i][1]}`;
    }
    path += ' Z';
    
    return path;
  }, [width, height, radius, phase, params]);
  
  return (
    <svg
      style={{
        position: 'absolute',
        inset: -4,
        width: 'calc(100% + 8px)',
        height: 'calc(100% + 8px)',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <path
        d={generateWavyPath()}
        fill="none"
        stroke={color}
        strokeWidth={params.strokeWidth}
        strokeOpacity={params.strokeOpacity}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default WavyBorder;
