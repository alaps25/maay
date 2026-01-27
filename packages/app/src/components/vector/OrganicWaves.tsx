'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { perlin2D } from './noise';

export type WaveState = 'idle' | 'recording';
export type BreathPhase = 'inhale' | 'exhale';

interface OrganicWavesProps {
  state: WaveState;
  breathPhase?: BreathPhase;
  breathProgress?: number;
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

/**
 * OrganicWaves Component
 * 
 * Press 'S' key - Ring controls
 * 
 * Idle: Heartbeat pulse animation
 * Recording: Same rings, breathing animation
 */
export function OrganicWaves({
  state,
  breathPhase = 'inhale',
  breathProgress = 0,
  width = 400,
  height = 600,
  strokeWidth = 1.2,
  color = '#1a1a1a',
  className = '',
}: OrganicWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const stateRef = useRef(state);
  const breathPhaseRef = useRef(breathPhase);
  const breathProgressRef = useRef(breathProgress);
  
  // Control panels
  const [showWaveControls, setShowWaveControls] = useState(false);
  const [showBreathControls, setShowBreathControls] = useState(false);
  
  // === RING PARAMETERS (same for both modes) ===
  const [heartbeatBPM, setHeartbeatBPM] = useState(34);
  const [pulseStrength, setPulseStrength] = useState(0.19);
  const [lineCount, setLineCount] = useState(15);
  const [spacingExponent, setSpacingExponent] = useState(1.75);
  const [minRadiusPercent, setMinRadiusPercent] = useState(26);
  const [maxRadiusPercent, setMaxRadiusPercent] = useState(79);
  const [innerTightness, setInnerTightness] = useState(0.035);
  const [outerLooseness, setOuterLooseness] = useState(0.2);
  const [waviness, setWaviness] = useState(1.1);
  const [flowSpeed, setFlowSpeed] = useState(0.03);
  const [outerBlur, setOuterBlur] = useState(3.5);
  
  // === BREATHING ANIMATION PARAMETERS ===
  const [breathStrength, setBreathStrength] = useState(1.17);
  const [breathFlowSpeed, setBreathFlowSpeed] = useState(0.015);
  const [innerBreathResponse, setInnerBreathResponse] = useState(0);
  const [outerBreathResponse, setOuterBreathResponse] = useState(1.5);
  const [breathEasing, setBreathEasing] = useState(0.4);
  
  const heartbeatInterval = 60 / heartbeatBPM;
  
  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.metaKey || e.ctrlKey) return;
      
      const key = e.key.toLowerCase();
      if (key === 's') {
        setShowWaveControls(prev => !prev);
        setShowBreathControls(false);
      } else if (key === 'c') {
        setShowBreathControls(prev => !prev);
        setShowWaveControls(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Store params in refs
  const paramsRef = useRef({
    pulseStrength,
    innerTightness,
    outerLooseness,
    flowSpeed,
    heartbeatInterval,
    lineCount,
    spacingExponent,
    minRadiusPercent,
    maxRadiusPercent,
    waviness,
    outerBlur,
    breathStrength,
    breathFlowSpeed,
    innerBreathResponse,
    outerBreathResponse,
    breathEasing,
  });
  
  useEffect(() => {
    paramsRef.current = {
      pulseStrength,
      innerTightness,
      outerLooseness,
      flowSpeed,
      heartbeatInterval,
      lineCount,
      spacingExponent,
      minRadiusPercent,
      maxRadiusPercent,
      waviness,
      outerBlur,
      breathStrength,
      breathFlowSpeed,
      innerBreathResponse,
      outerBreathResponse,
      breathEasing,
    };
  }, [pulseStrength, innerTightness, outerLooseness, flowSpeed, heartbeatInterval, lineCount, spacingExponent, minRadiusPercent, maxRadiusPercent, waviness, outerBlur, breathStrength, breathFlowSpeed, innerBreathResponse, outerBreathResponse, breathEasing]);
  
  useEffect(() => {
    stateRef.current = state;
    breathPhaseRef.current = breathPhase;
    breathProgressRef.current = breathProgress;
  }, [state, breathPhase, breathProgress]);
  
  // Generate ring with noise
  const generateRing = useCallback((
    cx: number,
    cy: number,
    baseRadius: number,
    time: number,
    ringIndex: number,
    totalRings: number,
    params: typeof paramsRef.current,
    isRecording: boolean
  ): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    const segments = 180;
    
    const ringRatio = totalRings > 1 ? ringIndex / (totalRings - 1) : 0;
    const ringPhase = ringIndex * 17.3;
    
    const looseness = params.innerTightness + (params.outerLooseness - params.innerTightness) * ringRatio;
    const baseFlowSpeed = isRecording ? params.breathFlowSpeed : params.flowSpeed;
    const ringSpeed = baseFlowSpeed * (1 - ringRatio * 0.3);
    
    const windAngle = time * 0.03 + Math.sin(time * 0.015) * 0.8;
    const windStrength = (0.2 + Math.sin(time * 0.1 + ringIndex * 0.5) * 0.15) * (0.5 + ringRatio * 0.5);
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2;
      
      const waveFreq = params.waviness;
      
      const flow1 = perlin2D(
        Math.cos(angle) * (1 + ringRatio) * waveFreq + time * ringSpeed + ringPhase,
        Math.sin(angle) * (1 + ringRatio) * waveFreq + time * ringSpeed * 0.7
      );
      
      const flow2 = perlin2D(
        Math.cos(angle + windAngle) * (2 + ringRatio * 2) * waveFreq + time * ringSpeed * 0.3 + ringPhase + 100,
        Math.sin(angle + windAngle) * (2 + ringRatio * 2) * waveFreq + time * ringSpeed * 0.4 + 50
      );
      
      const flutter = perlin2D(
        t * (6 + ringRatio * 4) * waveFreq + time * 0.4 + ringPhase,
        ringIndex * 10 + time * 0.25
      ) * (0.5 + ringRatio * 0.5);
      
      const windInfluence = Math.cos(angle - windAngle) * windStrength;
      
      const distortionAmount = baseRadius * looseness;
      
      const organicOffset = (
        flow1 * 0.45 + 
        flow2 * 0.35 + 
        flutter * 0.2 +
        windInfluence * 0.4
      ) * distortionAmount;
      
      const radius = baseRadius + organicOffset;
      
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    
    return points;
  }, []);
  
  const drawCurve = useCallback((
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    opacity: number,
    blur: number = 0
  ) => {
    if (points.length < 3) return;
    
    ctx.save();
    if (blur > 0) ctx.filter = `blur(${blur}px)`;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    
    for (let i = 0; i < points.length; i++) {
      const p0 = points[(i - 1 + points.length) % points.length];
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const p3 = points[(i + 2) % points.length];
      
      if (i === 0) ctx.moveTo(p1.x, p1.y);
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }, []);
  
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
      const params = paramsRef.current;
      const currentState = stateRef.current;
      const currentBreathPhase = breathPhaseRef.current;
      const currentBreathProgress = breathProgressRef.current;
      const isRecording = currentState === 'recording';
      
      const cx = width / 2;
      const cy = height / 2;
      
      const minRadius = Math.min(width, height) * (params.minRadiusPercent / 100);
      const maxRadius = Math.min(width, height) * (params.maxRadiusPercent / 100);
      const radiusRange = maxRadius - minRadius;
      
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // === HEARTBEAT PULSE (idle mode) ===
      let pulseWavePosition = 0;
      let pulseIntensityMultiplier = 0;
      
      if (!isRecording) {
        const beatPhase = (time % params.heartbeatInterval) / params.heartbeatInterval;
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        pulseWavePosition = easeOutCubic(beatPhase);
        pulseIntensityMultiplier = 1 - easeOutCubic(beatPhase) * 0.7;
      }
      
      // === BREATHING (recording mode) ===
      // Calculate base breath amount (0 to 1)
      let breathAmount = 0;
      
      if (isRecording) {
        // Configurable easing
        const easeInOut = (t: number) => {
          const strength = params.breathEasing;
          if (t < 0.5) {
            return Math.pow(2 * t, 1 + strength) / 2;
          } else {
            return 1 - Math.pow(2 * (1 - t), 1 + strength) / 2;
          }
        };
        
        if (currentBreathPhase === 'inhale') {
          breathAmount = easeInOut(currentBreathProgress);
        } else if (currentBreathPhase === 'exhale') {
          breathAmount = 1 - easeInOut(currentBreathProgress);
        }
      }
      
      const ringCount = params.lineCount;
      
      // Draw rings from outside in
      for (let i = ringCount - 1; i >= 0; i--) {
        const ringRatio = ringCount > 1 ? i / (ringCount - 1) : 0;
        const exponentialRatio = Math.pow(ringRatio, params.spacingExponent);
        
        // Base radius
        let radius = minRadius + radiusRange * exponentialRatio;
        
        // Apply breathing scale (recording mode)
        // Inner rings respond more, outer rings respond less (or vice versa based on settings)
        if (isRecording) {
          const ringResponse = params.innerBreathResponse + (params.outerBreathResponse - params.innerBreathResponse) * ringRatio;
          const breathScale = 1 + breathAmount * params.breathStrength * ringResponse;
          radius *= breathScale;
        }
        
        // Pulse calculation (idle mode only)
        let pulseAmount = 0;
        if (!isRecording) {
          const distanceFromPulseWave = pulseWavePosition - ringRatio;
          const pulseWidth = 0.4;
          
          if (distanceFromPulseWave > -pulseWidth && distanceFromPulseWave < pulseWidth) {
            const normalizedDist = distanceFromPulseWave / pulseWidth;
            pulseAmount = Math.exp(-normalizedDist * normalizedDist * 2);
            pulseAmount *= pulseIntensityMultiplier;
          }
          
          // Apply pulse to radius
          radius += pulseAmount * radius * params.pulseStrength;
        }
        
        const baseOpacity = 0.55 - ringRatio * 0.35;
        const opacity = isRecording 
          ? baseOpacity
          : baseOpacity + pulseAmount * 0.12;
        const blur = ringRatio * ringRatio * params.outerBlur;
        
        ctx.lineWidth = strokeWidth * (1.2 - ringRatio * 0.5);
        
        const points = generateRing(cx, cy, radius, time, i, ringCount, params, isRecording);
        
        drawCurve(ctx, points, Math.min(1, opacity), blur);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height, strokeWidth, color, generateRing, drawCurve]);
  
  // Control slider component
  const Slider = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step = 0.01,
    unit = ''
  }: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void; 
    min: number; 
    max: number; 
    step?: number;
    unit?: string;
  }) => (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ opacity: 0.7 }}>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{value.toFixed(step < 1 ? (step < 0.01 ? 3 : 2) : 0)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#666' }}
      />
    </label>
  );

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
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
      
      {/* Wave Controls - Press 'S' */}
      {showWaveControls && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            bottom: 20,
            width: 280,
            background: 'rgba(0,0,0,0.92)',
            color: '#fff',
            borderRadius: 12,
            fontSize: 12,
            fontFamily: 'system-ui, sans-serif',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(74,158,255,0.3)',
          }}
        >
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
            background: 'rgba(74,158,255,0.1)',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: 14 }}>Wave Controls</div>
            <div style={{ opacity: 0.4, fontSize: 10, marginTop: 4 }}>Press S to hide • Press C for breath controls</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 12 }}>
                Ring Structure
              </div>
              <Slider label="Number of Rings" value={lineCount} onChange={setLineCount} min={3} max={25} step={1} />
              <Slider label="Spacing Exponent" value={spacingExponent} onChange={setSpacingExponent} min={0.2} max={3} step={0.05} />
              <Slider label="Inner Radius" value={minRadiusPercent} onChange={setMinRadiusPercent} min={5} max={40} step={1} unit="%" />
              <Slider label="Outer Radius" value={maxRadiusPercent} onChange={setMaxRadiusPercent} min={40} max={95} step={1} unit="%" />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 12 }}>
                Waviness & Flow
              </div>
              <Slider label="Inner Tightness" value={innerTightness} onChange={setInnerTightness} min={0} max={0.2} step={0.005} />
              <Slider label="Outer Looseness" value={outerLooseness} onChange={setOuterLooseness} min={0.05} max={0.6} step={0.01} />
              <Slider label="Waviness" value={waviness} onChange={setWaviness} min={0.2} max={3} step={0.1} />
              <Slider label="Flow Speed" value={flowSpeed} onChange={setFlowSpeed} min={0.005} max={0.1} step={0.005} />
              <Slider label="Outer Blur" value={outerBlur} onChange={setOuterBlur} min={0} max={10} step={0.5} />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 12 }}>
                Heartbeat
              </div>
              <Slider label="BPM" value={heartbeatBPM} onChange={setHeartbeatBPM} min={20} max={80} step={1} />
              <Slider label="Pulse Strength" value={pulseStrength} onChange={setPulseStrength} min={0} max={0.3} step={0.01} />
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, fontSize: 10, fontFamily: 'monospace' }}>
              <div style={{ opacity: 0.5, marginBottom: 8 }}>Copy these values:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', opacity: 0.7 }}>
{`lineCount: ${lineCount}
spacingExponent: ${spacingExponent}
minRadius: ${minRadiusPercent}%
maxRadius: ${maxRadiusPercent}%
innerTightness: ${innerTightness}
outerLooseness: ${outerLooseness}
waviness: ${waviness}
flowSpeed: ${flowSpeed}
outerBlur: ${outerBlur}
heartbeatBPM: ${heartbeatBPM}
pulseStrength: ${pulseStrength}`}
              </pre>
            </div>
          </div>
        </div>
      )}
      
      {/* Breath Controls - Press 'C' */}
      {showBreathControls && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            bottom: 20,
            width: 280,
            background: 'rgba(0,0,0,0.92)',
            color: '#fff',
            borderRadius: 12,
            fontSize: 12,
            fontFamily: 'system-ui, sans-serif',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(255,107,107,0.3)',
          }}
        >
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
            background: 'rgba(255,107,107,0.1)',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: 14 }}>Breath Controls</div>
            <div style={{ opacity: 0.4, fontSize: 10, marginTop: 4 }}>Press C to hide • Tap screen to record</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 24,
              fontSize: 11,
            }}>
              <div style={{ opacity: 0.5, marginBottom: 8, fontSize: 10 }}>4-7-8 Breathing Pattern</div>
              <div><strong>4s</strong> inhale • <strong>7s</strong> hold • <strong>8s</strong> exhale</div>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 12 }}>
                Breath Scale
              </div>
              <Slider label="Breath Strength" value={breathStrength} onChange={setBreathStrength} min={0.02} max={1.5} step={0.01} />
              <Slider label="Inner Ring Response" value={innerBreathResponse} onChange={setInnerBreathResponse} min={0} max={1.5} step={0.05} />
              <Slider label="Outer Ring Response" value={outerBreathResponse} onChange={setOuterBreathResponse} min={0} max={1.5} step={0.05} />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 12 }}>
                Motion
              </div>
              <Slider label="Flow Speed" value={breathFlowSpeed} onChange={setBreathFlowSpeed} min={0.005} max={0.05} step={0.005} />
              <Slider label="Easing Curve" value={breathEasing} onChange={setBreathEasing} min={0} max={2} step={0.1} />
            </div>
            
            <div style={{ background: 'rgba(255,107,107,0.1)', padding: 12, borderRadius: 8, fontSize: 11, marginBottom: 16 }}>
              <strong>What each control does:</strong><br/><br/>
              <strong>Breath Strength</strong> - How much rings expand/contract<br/>
              <strong>Inner Response</strong> - How much inner rings react<br/>
              <strong>Outer Response</strong> - How much outer rings react<br/>
              <strong>Flow Speed</strong> - Ring movement while breathing<br/>
              <strong>Easing</strong> - Smoothness of breath transition
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, fontSize: 10, fontFamily: 'monospace' }}>
              <div style={{ opacity: 0.5, marginBottom: 8 }}>Copy these values:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', opacity: 0.7 }}>
{`breathStrength: ${breathStrength}
innerBreathResponse: ${innerBreathResponse}
outerBreathResponse: ${outerBreathResponse}
breathFlowSpeed: ${breathFlowSpeed}
breathEasing: ${breathEasing}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OrganicWaves;
