import { useState, useEffect, useRef, useMemo } from 'react';
import { YStack, styled } from '@baby/ui';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

interface ParticleExplosionProps {
  isActive: boolean;
  onComplete?: () => void;
  particleCount?: number;
  duration?: number;
  colors?: string[];
}

// Gold/White/Champagne tones
const DEFAULT_COLORS = [
  '#D4AF37', // Gold
  '#FFD700', // Bright Gold
  '#F4E4BC', // Light Gold
  '#FEFEFA', // Pearl White
  '#F7E7CE', // Champagne
  '#FFFDD0', // Cream
  '#E8D5C4', // Warm Beige
  '#FFF8DC', // Cornsilk
];

const ParticleContainer = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
});

/**
 * ParticleExplosion Component
 * 
 * Creates a full-screen generative particle explosion for the birth celebration.
 * Particles bloom outward from the center like a slow-motion flower or starfield.
 * 
 * Features:
 * - Gold/White/Champagne color palette
 * - Physics-based particle movement with gravity
 * - Fade out and scale animations
 * - Performance optimized with requestAnimationFrame
 */
export function ParticleExplosion({
  isActive,
  onComplete,
  particleCount = 150,
  duration = 5000,
  colors = DEFAULT_COLORS,
}: ParticleExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Generate initial particles
  const generateParticles = useMemo(() => {
    return (): Particle[] => {
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        // Angle for radial distribution (flower bloom pattern)
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 6;
        
        // Add some spiral variation
        const spiralOffset = (i % 5) * 0.2;
        
        newParticles.push({
          id: i,
          x: 0, // Will be set to center
          y: 0, // Will be set to center
          vx: Math.cos(angle + spiralOffset) * speed,
          vy: Math.sin(angle + spiralOffset) * speed,
          size: 3 + Math.random() * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.8 + Math.random() * 0.2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          life: 0,
          maxLife: duration * (0.6 + Math.random() * 0.4),
        });
      }
      
      return newParticles;
    };
  }, [particleCount, colors, duration]);
  
  // Animation loop
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Initialize particles at center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    let currentParticles = generateParticles().map((p) => ({
      ...p,
      x: centerX,
      y: centerY,
    }));
    
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      
      // Clear canvas with fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      currentParticles = currentParticles.map((particle) => {
        // Update life
        const life = particle.life + 16; // ~60fps
        const lifeProgress = life / particle.maxLife;
        
        // Apply slight gravity and friction
        const gravity = 0.02;
        const friction = 0.995;
        
        const vx = particle.vx * friction;
        const vy = particle.vy * friction + gravity;
        
        // Update position
        const x = particle.x + vx;
        const y = particle.y + vy;
        
        // Update rotation
        const rotation = particle.rotation + particle.rotationSpeed;
        
        // Calculate opacity (fade out towards end of life)
        const fadeStart = 0.6;
        const opacity = lifeProgress > fadeStart
          ? particle.opacity * (1 - (lifeProgress - fadeStart) / (1 - fadeStart))
          : particle.opacity;
        
        // Calculate size (slight pulse then shrink)
        const sizeMultiplier = lifeProgress < 0.2
          ? 1 + Math.sin(lifeProgress * Math.PI * 5) * 0.2
          : 1 - (lifeProgress - 0.2) * 0.5;
        const size = particle.size * Math.max(0.1, sizeMultiplier);
        
        // Draw particle
        if (opacity > 0.01) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.globalAlpha = opacity;
          
          // Draw as a soft circle with glow
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(0.5, particle.color + 'CC');
          gradient.addColorStop(1, particle.color + '00');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add extra glow for larger particles
          if (size > 8) {
            ctx.globalAlpha = opacity * 0.3;
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
            glowGradient.addColorStop(0, particle.color + '80');
            glowGradient.addColorStop(1, particle.color + '00');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        }
        
        return {
          ...particle,
          x,
          y,
          vx,
          vy,
          rotation,
          life,
          opacity,
          size,
        };
      });
      
      // Check if animation should continue
      const allDead = currentParticles.every((p) => p.life >= p.maxLife);
      
      if (elapsed < duration && !allDead) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Clear canvas and trigger complete
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration, generateParticles, onComplete]);
  
  if (!isActive) return null;
  
  return (
    <ParticleContainer>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </ParticleContainer>
  );
}

export default ParticleExplosion;
