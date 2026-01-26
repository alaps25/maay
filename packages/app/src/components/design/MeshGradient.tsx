'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MeshGradientProps {
  variant?: 'warm' | 'night' | 'celebration' | 'calm';
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

/**
 * MeshGradient Component
 * 
 * Animated mesh gradient background that "breathes" slowly.
 * Creates an organic, zen-like atmosphere.
 */
export function MeshGradient({ 
  variant = 'warm', 
  intensity = 'subtle',
  className = '' 
}: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  const gradients = {
    warm: {
      colors: ['#F7E7CE', '#E8D5C4', '#FDFBF7', '#F4E4BC', '#FFF8DC'],
      opacity: intensity === 'subtle' ? 0.4 : intensity === 'medium' ? 0.6 : 0.8,
    },
    night: {
      colors: ['#0A0A0A', '#121212', '#1A1508', '#0F0F0F', '#080808'],
      opacity: intensity === 'subtle' ? 0.6 : intensity === 'medium' ? 0.8 : 1,
    },
    celebration: {
      colors: ['#D4AF37', '#FFD700', '#F7E7CE', '#FFF8DC', '#E8D5C4'],
      opacity: intensity === 'subtle' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7,
    },
    calm: {
      colors: ['#E8F4F8', '#D4E5ED', '#F0F7FA', '#C9DDE8', '#FAFCFD'],
      opacity: intensity === 'subtle' ? 0.4 : intensity === 'medium' ? 0.6 : 0.8,
    },
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const config = gradients[variant];
    let time = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Blob class for organic shapes
    class Blob {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      
      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }
      
      update(width: number, height: number, time: number) {
        // Slow, breathing movement
        this.x += this.vx + Math.sin(time * 0.0005 + this.radius) * 0.2;
        this.y += this.vy + Math.cos(time * 0.0004 + this.radius) * 0.2;
        
        // Bounce off edges
        if (this.x < -this.radius) this.x = width + this.radius;
        if (this.x > width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = height + this.radius;
        if (this.y > height + this.radius) this.y = -this.radius;
      }
      
      draw(ctx: CanvasRenderingContext2D, time: number) {
        const breathScale = 1 + Math.sin(time * 0.001) * 0.1;
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius * breathScale
        );
        gradient.addColorStop(0, this.color + 'CC');
        gradient.addColorStop(0.5, this.color + '66');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * breathScale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create blobs
    const blobs: Blob[] = [];
    for (let i = 0; i < 5; i++) {
      blobs.push(new Blob(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        150 + Math.random() * 200,
        config.colors[i % config.colors.length]
      ));
    }
    
    const animate = () => {
      time++;
      ctx.globalAlpha = config.opacity;
      ctx.fillStyle = variant === 'night' ? '#000000' : '#FDFBF7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalCompositeOperation = 'screen';
      if (variant === 'night') {
        ctx.globalCompositeOperation = 'lighter';
      }
      
      blobs.forEach(blob => {
        blob.update(canvas.width, canvas.height, time);
        blob.draw(ctx, time);
      });
      
      ctx.globalCompositeOperation = 'source-over';
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [variant, intensity]);
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}

export default MeshGradient;
