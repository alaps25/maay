'use client';

import React, { useState, useEffect, useRef, useCallback, type TouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, MoreVertical, Plus, Droplets, Share2, Users } from 'lucide-react';
import { OrganicWaves, type BreathPhase } from '../../components/vector/OrganicWaves';
import { CelebrationAnimation, type CelebrationPhase } from '../../components/vector/CelebrationAnimation';
import { DurationPicker, TimePicker } from '../../components/WheelPicker';
import { useContractionStore } from '../../stores/contractionStore';
import { useAppStore } from '../../stores/appStore';
import { useHaptics } from '../../hooks/useHaptics';
import { framerSpring } from '../../components/vector/spring';
import { t } from '../../i18n';

interface WaitScreenProps {
  locale?: 'en' | 'es';
  onBabyArrived?: () => void;
}

type Tab = 'contractions' | 'birth';

// Medical standard breathing for labor (paced breathing technique)
// Promotes relaxation, oxygen flow, and pelvic floor relaxation during contractions
// Based on doula/Lamaze recommendations - no breath holding during labor
const INHALE_DURATION = 4000;  // 4 seconds - breathe in through nose
const EXHALE_DURATION = 6000;  // 6 seconds - breathe out through mouth (longer exhale promotes relaxation)
const CYCLE_DURATION = INHALE_DURATION + EXHALE_DURATION; // 10 seconds total

// Edit Contraction Sheet component
interface EditSheetProps {
  contraction: {
    id: string;
    startTime: number;
    duration: number | null;
  } | null;
  onClose: () => void;
  onSave: (id: string, updates: { duration?: number; startTime?: number }) => void;
  onDelete: (id: string) => void;
  lineColor: string;
  isNight: boolean;
}

function EditContractionSheet({
  contraction,
  onClose,
  onSave,
  onDelete,
  lineColor,
  isNight,
}: EditSheetProps) {
  // Initialize state directly from contraction
  const initialDuration = contraction ? {
    mins: Math.floor((contraction.duration || 0) / 60),
    secs: (contraction.duration || 0) % 60,
  } : { mins: 0, secs: 0 };
  
  const initialTime = contraction ? {
    hours: new Date(contraction.startTime).getHours(),
    minutes: new Date(contraction.startTime).getMinutes(),
  } : { hours: 12, minutes: 0 };
  
  const [editDuration, setEditDuration] = useState(initialDuration);
  const [editTime, setEditTime] = useState(initialTime);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Update when contraction changes (for when sheet stays open but contraction changes)
  useEffect(() => {
    if (contraction) {
      const durationSecs = contraction.duration || 0;
      setEditDuration({
        mins: Math.floor(durationSecs / 60),
        secs: durationSecs % 60,
      });
      
      const date = new Date(contraction.startTime);
      setEditTime({
        hours: date.getHours(),
        minutes: date.getMinutes(),
      });
    }
  }, [contraction?.id]); // Only re-run if contraction ID changes
  
  const handleSave = () => {
    if (!contraction) return;
    
    const newDate = new Date(contraction.startTime);
    newDate.setHours(editTime.hours);
    newDate.setMinutes(editTime.minutes);
    
    onSave(contraction.id, {
      duration: editDuration.mins * 60 + editDuration.secs,
      startTime: newDate.getTime(),
    });
    onClose();
  };
  
  if (!contraction) return null;
  
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />
      
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          backgroundColor: isNight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 16px 12px',
          }}
        >
          {/* X button (cancel) */}
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${lineColor}10`,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: lineColor,
              opacity: 0.6,
            }}
            aria-label="Cancel"
          >
            <X size={16} strokeWidth={2} />
          </button>
          
          <span
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.1em',
              color: lineColor,
            }}
          >
            EDIT CONTRACTION
          </span>
          
          {/* Check button (save) */}
          <button
            onClick={handleSave}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: lineColor,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: isNight ? '#000' : '#fff',
            }}
            aria-label="Save"
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Delete Confirmation Sheet */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 200,
                }}
              />
              {/* Confirmation Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 201,
                  backgroundColor: isNight ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: '12px 24px 40px',
                }}
              >
                <SheetDragHandle lineColor={lineColor} />
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 20,
                  paddingTop: 16,
                }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans, sans-serif)',
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      color: lineColor,
                    }}
                  >
                    DELETE RECORDING
                  </span>
                  
                  <span
                    style={{
                      fontFamily: 'var(--font-serif, Georgia, serif)',
                      fontSize: 16,
                      fontStyle: 'italic',
                      color: lineColor,
                      opacity: 0.6,
                      textAlign: 'center',
                    }}
                  >
                    This action cannot be undone
                  </span>
                  
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        color: lineColor,
                        backgroundColor: `${lineColor}10`,
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 50,
                        cursor: 'pointer',
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        if (contraction) {
                          onDelete(contraction.id);
                          onClose();
                        }
                      }}
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        color: '#fff',
                        backgroundColor: '#e53935',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 50,
                        cursor: 'pointer',
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Content - Side by side pickers */}
        <div style={{ 
          padding: '24px 16px 36px',
          display: 'flex',
          justifyContent: 'center',
          gap: 48,
        }}>
          {/* Start Time Section */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: lineColor,
                opacity: 0.4,
                marginBottom: 16,
              }}
            >
              TIME
            </div>
            <TimePicker
              hours={editTime.hours}
              minutes={editTime.minutes}
              onChange={(hours, minutes) => setEditTime({ hours, minutes })}
              color={lineColor}
            />
          </div>
          
          {/* Duration Section */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: lineColor,
                opacity: 0.4,
                marginBottom: 16,
              }}
            >
              DURATION
            </div>
            <DurationPicker
              minutes={editDuration.mins}
              seconds={editDuration.secs}
              onChange={(mins, secs) => setEditDuration({ mins, secs })}
              color={lineColor}
            />
          </div>
        </div>
        
        {/* Delete Button */}
        <div style={{ 
          padding: '8px 16px 36px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: '#e53935',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '12px 20px',
              cursor: 'pointer',
              opacity: 0.8,
            }}
          >
            <Trash2 size={14} strokeWidth={2} />
            DELETE RECORDING
          </button>
        </div>
      </motion.div>
    </>
  );
}

// Reusable drag handle component
function SheetDragHandle({ lineColor }: { lineColor: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 4,
        backgroundColor: lineColor,
        opacity: 0.2,
        borderRadius: 2,
        margin: '12px auto 8px',
      }}
    />
  );
}

// Wavy border parameters (shared state for controls)
const wavyBorderParams = {
  amplitude: 0.6,
  wavelength: 52, // pixels per wave cycle
  speed: 0.05,
  strokeWidth: 1,
  strokeOpacity: 0.6,
};

// Animated wavy border for water broke entry
function WavyBorder({ 
  width, 
  height, 
  color, 
  radius = 12,
  params,
}: { 
  width: number; 
  height: number; 
  color: string;
  radius?: number;
  params: typeof wavyBorderParams;
}) {
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

// Wavy border controls panel (press 'W' to toggle)
function WavyBorderControls({
  params,
  setParams,
  lineColor,
  isNight,
}: {
  params: typeof wavyBorderParams;
  setParams: (p: typeof wavyBorderParams) => void;
  lineColor: string;
  isNight: boolean;
}) {
  const controlStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  };
  
  const labelStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: 10,
    color: lineColor,
    width: 100,
  };
  
  const inputStyle: React.CSSProperties = {
    width: 100,
    accentColor: lineColor,
  };
  
  const valueStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: 10,
    color: lineColor,
    width: 50,
    textAlign: 'right',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 200,
        backgroundColor: isNight ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        maxHeight: '60vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ 
        fontFamily: 'monospace', 
        fontSize: 11, 
        color: lineColor, 
        marginBottom: 12,
        opacity: 0.5,
      }}>
        WAVY BORDER (W to close)
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>amplitude</span>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={params.amplitude}
          onChange={(e) => setParams({ ...params, amplitude: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{params.amplitude.toFixed(1)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>wavelength</span>
        <input
          type="range"
          min="8"
          max="60"
          step="1"
          value={params.wavelength}
          onChange={(e) => setParams({ ...params, wavelength: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{params.wavelength.toFixed(0)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>speed</span>
        <input
          type="range"
          min="0.01"
          max="0.15"
          step="0.005"
          value={params.speed}
          onChange={(e) => setParams({ ...params, speed: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{params.speed.toFixed(3)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>strokeWidth</span>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={params.strokeWidth}
          onChange={(e) => setParams({ ...params, strokeWidth: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{params.strokeWidth.toFixed(1)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>strokeOpacity</span>
        <input
          type="range"
          min="0.1"
          max="0.6"
          step="0.02"
          value={params.strokeOpacity}
          onChange={(e) => setParams({ ...params, strokeOpacity: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{params.strokeOpacity.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}

// Menu Sheet - shows options for manual entry
interface MenuSheetProps {
  onClose: () => void;
  onWaterBroke: () => void;
  onExport: () => void;
  onPairPartner: () => void;
  onClearAll: () => void;
  lineColor: string;
  isNight: boolean;
}

function MenuSheet({
  onClose,
  onWaterBroke,
  onExport,
  onPairPartner,
  onClearAll,
  lineColor,
  isNight,
}: MenuSheetProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          backgroundColor: isNight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Clear All Confirmation Sheet */}
        <AnimatePresence>
          {showClearConfirm && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowClearConfirm(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 200,
                }}
              />
              {/* Confirmation Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 201,
                  backgroundColor: isNight ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: '12px 24px 40px',
                }}
              >
                <SheetDragHandle lineColor={lineColor} />
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 20,
                  paddingTop: 16,
                }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans, sans-serif)',
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      color: lineColor,
                    }}
                  >
                    START FRESH
                  </span>
                  
                  <span
                    style={{
                      fontFamily: 'var(--font-serif, Georgia, serif)',
                      fontSize: 16,
                      fontStyle: 'italic',
                      color: lineColor,
                      opacity: 0.6,
                      textAlign: 'center',
                      maxWidth: 280,
                    }}
                  >
                    This will remove all contractions and start fresh. This cannot be undone.
                  </span>
                  
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        color: lineColor,
                        backgroundColor: `${lineColor}10`,
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 50,
                        cursor: 'pointer',
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        onClearAll();
                        onClose();
                      }}
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        color: '#fff',
                        backgroundColor: '#e53935',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 50,
                        cursor: 'pointer',
                      }}
                    >
                      CLEAR ALL
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <div style={{ 
          padding: '20px 16px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}>
          {/* Water Broke */}
          <button
            onClick={() => {
              onClose();
              onWaterBroke();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 24px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Droplets size={16} strokeWidth={2} color={lineColor} style={{ opacity: 0.5 }} />
            <span
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: lineColor,
              }}
            >
              WATER BROKE
            </span>
          </button>
          
          {/* Export Data */}
          <button
            onClick={() => {
              onClose();
              onExport();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 24px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Share2 size={16} strokeWidth={2} color={lineColor} style={{ opacity: 0.5 }} />
            <span
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: lineColor,
              }}
            >
              EXPORT DATA
            </span>
          </button>
          
          {/* Pair with Partner */}
          <button
            onClick={() => {
              onClose();
              onPairPartner();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 24px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Users size={16} strokeWidth={2} color={lineColor} style={{ opacity: 0.5 }} />
            <span
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: lineColor,
              }}
            >
              PAIR WITH PARTNER
            </span>
          </button>
          
          {/* Clear All - destructive action in red */}
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 24px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={16} strokeWidth={2} color="#e53935" style={{ opacity: 0.8 }} />
            <span
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: '#e53935',
              }}
            >
              START FRESH
            </span>
          </button>
        </div>
      </motion.div>
    </>
  );
}

// Export Sheet - for exporting/sharing contraction data
interface ExportSheetProps {
  onClose: () => void;
  contractions: Array<{
    id: string;
    startTime: number;
    duration: number | null;
    type?: 'contraction' | 'water_broke';
  }>;
  lineColor: string;
  isNight: boolean;
}

type ExportCount = 10 | 20 | 50 | 'all';

function ExportSheet({
  onClose,
  contractions,
  lineColor,
  isNight,
}: ExportSheetProps) {
  const [selectedCount, setSelectedCount] = useState<ExportCount | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${secs}s`;
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const generateExportText = (count: ExportCount) => {
    const entriesToExport = count === 'all' 
      ? contractions 
      : contractions.slice(0, count);
    
    const lines = ['CONTRACTION TRACKING REPORT', ''];
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Total entries: ${entriesToExport.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    
    entriesToExport.forEach((entry, index) => {
      if (entry.type === 'water_broke') {
        lines.push(`${index + 1}. WATER BROKE`);
        lines.push(`   Time: ${formatTime(entry.startTime)}`);
      } else {
        lines.push(`${index + 1}. Contraction`);
        lines.push(`   Time: ${formatTime(entry.startTime)}`);
        lines.push(`   Duration: ${formatDuration(entry.duration)}`);
      }
      lines.push('');
    });
    
    return lines.join('\n');
  };
  
  const handleExport = async (count: ExportCount) => {
    setSelectedCount(count);
    setIsSharing(true);
    
    const exportText = generateExportText(count);
    
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Contraction Tracking Report',
          text: exportText,
        });
        onClose();
      } catch (err) {
        // User cancelled or share failed, try download
        downloadAsFile(exportText);
      }
    } else {
      // Fallback to download
      downloadAsFile(exportText);
    }
    
    setIsSharing(false);
  };
  
  const downloadAsFile = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contractions-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };
  
  const countOptions: { value: ExportCount; label: string }[] = [
    { value: 10, label: 'LAST 10 ENTRIES' },
    { value: 20, label: 'LAST 20 ENTRIES' },
    { value: 50, label: 'LAST 50 ENTRIES' },
    { value: 'all', label: `ALL ENTRIES (${contractions.length})` },
  ];
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          backgroundColor: isNight ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 16px 12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${lineColor}10`,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: lineColor,
              opacity: 0.6,
            }}
            aria-label="Cancel"
          >
            <X size={16} strokeWidth={2} />
          </button>
          
          <span
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.1em',
              color: lineColor,
            }}
          >
            EXPORT DATA
          </span>
          
          {/* Empty space for balance */}
          <div style={{ width: 32 }} />
        </div>
        
        {/* Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 16,
              fontStyle: 'italic',
              color: lineColor,
              opacity: 0.6,
            }}
          >
            Choose how many entries to export
          </span>
        </div>
        
        {/* Options - only show options that are possible */}
        <div style={{ 
          padding: '8px 16px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          {countOptions
            .filter((option) => option.value === 'all' || contractions.length >= option.value)
            .map((option) => (
            <button
              key={option.value}
              onClick={() => handleExport(option.value)}
              disabled={isSharing}
              style={{
                width: '100%',
                maxWidth: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '14px 24px',
                background: selectedCount === option.value ? `${lineColor}15` : `${lineColor}08`,
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  color: lineColor,
                }}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// Add Contraction Sheet - for manual entry
interface AddSheetProps {
  onClose: () => void;
  onAdd: (startTime: number, duration: number) => void;
  lineColor: string;
  isNight: boolean;
}

function AddContractionSheet({
  onClose,
  onAdd,
  lineColor,
  isNight,
}: AddSheetProps) {
  const now = new Date();
  const [addDuration, setAddDuration] = useState({ mins: 1, secs: 0 });
  const [addTime, setAddTime] = useState({
    hours: now.getHours(),
    minutes: now.getMinutes(),
  });
  
  const handleAdd = () => {
    const date = new Date();
    date.setHours(addTime.hours);
    date.setMinutes(addTime.minutes);
    date.setSeconds(0);
    
    const durationSecs = addDuration.mins * 60 + addDuration.secs;
    onAdd(date.getTime(), durationSecs);
    onClose();
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          backgroundColor: isNight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 16px 12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${lineColor}10`,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: lineColor,
              opacity: 0.6,
            }}
            aria-label="Cancel"
          >
            <X size={16} strokeWidth={2} />
          </button>
          
          <span
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.1em',
              color: lineColor,
            }}
          >
            ADD CONTRACTION
          </span>
          
          <button
            onClick={handleAdd}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: lineColor,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: isNight ? '#000' : '#fff',
            }}
            aria-label="Add"
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Content */}
        <div style={{ 
          padding: '24px 16px 36px',
          display: 'flex',
          justifyContent: 'center',
          gap: 48,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: lineColor,
                opacity: 0.4,
                marginBottom: 16,
              }}
            >
              TIME
            </div>
            <TimePicker
              hours={addTime.hours}
              minutes={addTime.minutes}
              onChange={(hours, minutes) => setAddTime({ hours, minutes })}
              color={lineColor}
            />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: lineColor,
                opacity: 0.4,
                marginBottom: 16,
              }}
            >
              DURATION
            </div>
            <DurationPicker
              minutes={addDuration.mins}
              seconds={addDuration.secs}
              onChange={(mins, secs) => setAddDuration({ mins, secs })}
              color={lineColor}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Water Broke Sheet - for adding or editing
interface WaterBrokeSheetProps {
  onClose: () => void;
  onConfirm: (time: number) => void;
  onDelete?: () => void;
  existingTime?: number; // If provided, we're editing
  lineColor: string;
  isNight: boolean;
}

function WaterBrokeSheet({
  onClose,
  onConfirm,
  onDelete,
  existingTime,
  lineColor,
  isNight,
}: WaterBrokeSheetProps) {
  const isEditing = existingTime !== undefined;
  const initialDate = isEditing ? new Date(existingTime) : new Date();
  const [time, setTime] = useState({
    hours: initialDate.getHours(),
    minutes: initialDate.getMinutes(),
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleConfirm = () => {
    const date = new Date();
    date.setHours(time.hours);
    date.setMinutes(time.minutes);
    date.setSeconds(0);
    onConfirm(date.getTime());
    onClose();
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          backgroundColor: isNight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 16px 12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${lineColor}10`,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: lineColor,
              opacity: 0.6,
            }}
            aria-label="Cancel"
          >
            <X size={16} strokeWidth={2} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={14} strokeWidth={2} color={lineColor} />
            <span
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: lineColor,
              }}
            >
              {isEditing ? 'EDIT WATER BROKE' : 'WATER BROKE'}
            </span>
          </div>
          
          <button
            onClick={handleConfirm}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: lineColor,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: isNight ? '#000' : '#fff',
            }}
            aria-label="Confirm"
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Delete Confirmation Sheet */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 200,
                }}
              />
              {/* Confirmation Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 201,
                  backgroundColor: isNight ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: '12px 24px 40px',
                }}
              >
                <SheetDragHandle lineColor={lineColor} />
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 20,
                  paddingTop: 16,
                }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans, sans-serif)',
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      color: lineColor,
                    }}
                  >
                    DELETE ENTRY
                  </span>
                  
                  <span
                    style={{
                      fontFamily: 'var(--font-serif, Georgia, serif)',
                      fontSize: 16,
                      fontStyle: 'italic',
                      color: lineColor,
                      opacity: 0.6,
                      textAlign: 'center',
                    }}
                  >
                    This action cannot be undone
                  </span>
                  
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        color: lineColor,
                        backgroundColor: `${lineColor}10`,
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 50,
                        cursor: 'pointer',
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.();
                        onClose();
                      }}
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        color: '#fff',
                        backgroundColor: '#e53935',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 50,
                        cursor: 'pointer',
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Content */}
        <div style={{ 
          padding: '24px 16px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}>
          {/* Prompt text - only when adding */}
          {!isEditing && (
            <span
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 16,
                fontStyle: 'italic',
                color: lineColor,
                opacity: 0.6,
                textAlign: 'center',
              }}
            >
              When did your water break?
            </span>
          )}
          
          <TimePicker
            hours={time.hours}
            minutes={time.minutes}
            onChange={(hours, minutes) => setTime({ hours, minutes })}
            color={lineColor}
          />
          
          {/* Delete Button - only when editing */}
          {isEditing && onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: '#e53935',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '12px 20px',
                cursor: 'pointer',
                opacity: 0.8,
                marginTop: 8,
              }}
            >
              <Trash2 size={14} strokeWidth={2} />
              DELETE ENTRY
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}

/**
 * THE WAIT Screen - Organic UI
 * 
 * - Smooth organic rings with heartbeat pulse (always on)
 * - Inner rings are circular, outer rings are wavy + blurred
 * - Entire area is clickable to record
 * - During recording: breathing guidance helps manage contraction
 */
export function WaitScreen({ 
  locale = 'en',
  onBabyArrived 
}: WaitScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('contractions');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWaterBrokeId, setEditingWaterBrokeId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showWaterBrokeSheet, setShowWaterBrokeSheet] = useState(false);
  
  // Celebration states
  const [celebrationPhase, setCelebrationPhase] = useState<CelebrationPhase>('idle');
  const [showCelebrationContent, setShowCelebrationContent] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showWavyControls, setShowWavyControls] = useState(false);
  const [wavyParams, setWavyParams] = useState(wavyBorderParams);
  
  // Welcome state - check if user has begun using the app
  // Start with true to avoid hydration mismatch, then check localStorage in useEffect
  const [hasBegun, setHasBegun] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Check localStorage after hydration
  useEffect(() => {
    const begun = localStorage.getItem('maay-has-begun') === 'true';
    setHasBegun(begun);
    setIsHydrated(true);
  }, []);
  
  // Handle BEGIN button click
  const handleBegin = useCallback(() => {
    localStorage.setItem('maay-has-begun', 'true');
    setHasBegun(true);
  }, []);
  
  // Key listener for wavy border controls (W key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.metaKey || e.ctrlKey) return;
      
      if (e.key.toLowerCase() === 'w') {
        setShowWavyControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Bottom sheet ref
  const sheetRef = useRef<HTMLDivElement>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathCycleStart = useRef<number>(0);
  
  const contractions = useContractionStore((s) => s.contractions);
  const { startContraction, endContraction, updateContraction, deleteContraction, addContraction, addWaterBroke, clearAll } = useContractionStore();
  const { setPhase } = useAppStore();
  const isNight = useAppStore((s) => s.isNightTime);
  const { trigger } = useHaptics();
  
  const translations = t(locale);
  const lineColor = isNight ? '#E8E0D5' : '#1a1a1a';
  const bgColor = isNight ? '#000' : '#f5f5f0';
  
  // Get window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Timer and breathing cycle
  useEffect(() => {
    if (isRecording && startTimeRef.current) {
      breathCycleStart.current = Date.now();
      
      timerRef.current = setInterval(() => {
        // Update elapsed time
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current!) / 1000));
        
        // Update breathing phase (simple inhale/exhale cycle - no hold)
        const cycleElapsed = (Date.now() - breathCycleStart.current) % CYCLE_DURATION;
        
        if (cycleElapsed < INHALE_DURATION) {
          setBreathPhase('inhale');
          setBreathProgress(cycleElapsed / INHALE_DURATION);
        } else {
          setBreathPhase('exhale');
          setBreathProgress((cycleElapsed - INHALE_DURATION) / EXHALE_DURATION);
        }
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedTime(0);
      setBreathPhase('inhale');
      setBreathProgress(0);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);
  
  // Haptic feedback on breath phase change
  useEffect(() => {
    if (!isRecording) return;
    
    if (breathPhase === 'inhale' && breathProgress < 0.05) {
      trigger('inhale');
    } else if (breathPhase === 'exhale' && breathProgress < 0.05) {
      trigger('exhale');
    }
  }, [breathPhase, breathProgress, isRecording, trigger]);
  
  const handleRecordPress = useCallback(() => {
    if (activeTab !== 'contractions') return;
    if (!hasBegun) return; // Don't allow recording before BEGIN is clicked
    
    if (isRecording) {
      // Stop recording
      const duration = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
        : 0;
      
      setIsRecording(false);
      startTimeRef.current = null;
      trigger('success');
      endContraction();
    } else {
      // Start recording
      setIsRecording(true);
      setSheetExpanded(false); // Reset to collapsed state for when recording ends
      startTimeRef.current = Date.now();
      breathCycleStart.current = Date.now();
      trigger('tap');
      startContraction();
    }
  }, [isRecording, activeTab, trigger, startContraction, endContraction, hasBegun]);
  
  const handleBabyArrived = useCallback(() => {
    trigger('success');
    setCelebrationPhase('dissolving');
  }, [trigger]);
  
  const handleDissolveComplete = useCallback(() => {
    setCelebrationPhase('complete');
    setTimeout(() => setShowCelebrationContent(true), 300);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };
  
  const getInterval = (index: number) => {
    if (index === 0) return null;
    const current = contractions[index];
    const previous = contractions[index - 1];
    const interval = (current.startTime - (previous.endTime || previous.startTime)) / 1000 / 60;
    return Math.round(interval * 10) / 10;
  };
  
  const getBreathText = () => {
    switch (breathPhase) {
      case 'inhale': return 'breathe in';
      case 'exhale': return 'breathe out';
    }
  };
  
  // All contractions, newest first
  const allContractions = [...contractions].reverse();
  
  // Bottom sheet drag end handler - snap to expanded or collapsed state
  const handleSheetDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    const threshold = 50;
    const velocityThreshold = 500;
    
    // Use velocity for quick swipes, position for slow drags
    if (Math.abs(info.velocity.y) > velocityThreshold) {
      // Fast swipe - use velocity direction
      setSheetExpanded(info.velocity.y < 0);
    } else {
      // Slow drag - use position
      if (sheetExpanded) {
        // If expanded, drag down to collapse
        if (info.offset.y > threshold) {
          setSheetExpanded(false);
        }
      } else {
        // If collapsed, drag up to expand
        if (info.offset.y < -threshold) {
          setSheetExpanded(true);
        }
      }
    }
  }, [sheetExpanded]);

  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        backgroundColor: bgColor,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Organic flowing rings with heartbeat - Press 'S' for controls */}
      {celebrationPhase === 'idle' ? (
        <OrganicWaves
          state={isRecording ? 'recording' : 'idle'}
          breathPhase={breathPhase}
          breathProgress={breathProgress}
          width={dimensions.width}
          height={dimensions.height}
          strokeWidth={1.2}
          color={lineColor}
        />
      ) : (
        <CelebrationAnimation
          phase={celebrationPhase}
          onDissolveComplete={handleDissolveComplete}
          width={dimensions.width}
          height={dimensions.height}
          strokeWidth={1.2}
          color={lineColor}
        />
      )}
      
      {/* Top Navigation Pill - hides during recording, before BEGIN, and during celebration */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: (isHydrated && !hasBegun) || isRecording || celebrationPhase !== 'idle' ? 0 : 1, 
          y: (isHydrated && !hasBegun) || isRecording || celebrationPhase !== 'idle' ? -60 : 0 
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          padding: '24px 24px 0',
          pointerEvents: (isHydrated && !hasBegun) || isRecording || celebrationPhase !== 'idle' ? 'none' : 'auto',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          style={{
            display: 'flex',
            backgroundColor: lineColor,
            borderRadius: 50,
            padding: 2,
          }}
        >
          <button
            onClick={() => setActiveTab('contractions')}
            aria-pressed={activeTab === 'contractions'}
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: activeTab === 'contractions' ? lineColor : bgColor,
              backgroundColor: activeTab === 'contractions' ? bgColor : 'transparent',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 50,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            THE WAIT
          </button>
          <button
            onClick={() => setActiveTab('birth')}
            aria-pressed={activeTab === 'birth'}
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: activeTab === 'birth' ? lineColor : bgColor,
              backgroundColor: activeTab === 'birth' ? bgColor : 'transparent',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 50,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.3s ease',
            }}
          >
            BIRTH <span aria-hidden="true">→</span>
          </button>
        </div>
      </motion.nav>
      
      {/* Main Interactive Area - ENTIRE SPACE CLICKABLE */}
      <AnimatePresence mode="wait">
        {activeTab === 'contractions' ? (
          <motion.button
            key="contractions-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRecordPress}
            aria-label={isRecording 
              ? `Recording contraction: ${formatTime(elapsedTime)}. ${getBreathText()}. Tap to end.` 
              : hasBegun 
                ? 'Tap anywhere to start recording contraction'
                : 'Press BEGIN to start using the app'
            }
            aria-pressed={isRecording}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
              background: 'transparent',
              border: 'none',
              cursor: hasBegun ? 'pointer' : 'default',
              padding: 0,
              margin: 0,
            }}
          >
            {/* Center Content - absolutely centered on screen */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div
                    key="recording"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    {/* Timer */}
                    <span
                      style={{
                        fontFamily: 'var(--font-serif, Georgia, serif)',
                        fontSize: 56,
                        fontWeight: 300,
                        color: lineColor,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {formatTime(elapsedTime)}
                    </span>
                    
                    {/* Breathing guidance */}
                    <motion.span
                      key={breathPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        fontFamily: 'var(--font-serif, Georgia, serif)',
                        fontSize: 18,
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: lineColor,
                        opacity: 0.6,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {getBreathText()}
                    </motion.span>
                    
                    {/* Tap to end hint */}
                    <span
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: 10,
                        fontWeight: 400,
                        letterSpacing: '0.15em',
                        color: lineColor,
                        opacity: 0.5,
                        marginTop: 24,
                      }}
                    >
                      TAP TO END
                    </span>
                  </motion.div>
                ) : (
                  <motion.span
                    key={(!isHydrated || hasBegun) ? "idle-add" : "idle-maay"}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      fontFamily: 'var(--font-sans, sans-serif)',
                      fontSize: (isHydrated && !hasBegun) ? 18 : 14,
                      fontWeight: (isHydrated && !hasBegun) ? 300 : 400,
                      letterSpacing: '0.35em',
                      color: lineColor,
                      opacity: (isHydrated && !hasBegun) ? 0.7 : 0.5,
                    }}
                  >
                    {(isHydrated && !hasBegun) ? 'M A A Y' : 'A D D'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        ) : celebrationPhase === 'idle' ? (
          <motion.div
            key="birth-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 5,
              padding: 32,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 18,
                fontStyle: 'italic',
                color: lineColor,
                opacity: 0.5,
                textAlign: 'center',
                maxWidth: 280,
                marginBottom: 32,
                lineHeight: 1.6,
              }}
            >
              This is it?
            </p>
            
            <motion.button
              onClick={handleBabyArrived}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={framerSpring}
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: bgColor,
                backgroundColor: lineColor,
                border: 'none',
                padding: '16px 48px',
                borderRadius: 50,
                cursor: 'pointer',
              }}
            >
              BABY IS HERE
            </motion.button>
          </motion.div>
        ) : (
          /* Center text during celebration - same position as MAAY/ADD */
          <motion.div
            key="celebration-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {celebrationPhase === 'complete' && (
                <motion.span
                  key="life-begins"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 18,
                    fontWeight: 300,
                    letterSpacing: '0.35em',
                    color: lineColor,
                    textAlign: 'center',
                    lineHeight: 1.8,
                  }}
                >
                  L I F E
                  <br />
                  B E G I N S
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Welcome Sheet - shown before user begins (only after hydration) */}
      <AnimatePresence>
        {isHydrated && !hasBegun && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 25,
              padding: '40px 32px 60px',
              background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor}f5 60%, ${bgColor}00 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* Tagline */}
            <div
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '0.1em',
                color: lineColor,
                opacity: 0.5,
                textAlign: 'center',
                lineHeight: 1.8,
                textTransform: 'uppercase',
              }}
            >
              Track each wave
              <br />
              breathe through every moment
            </div>
            
            {/* BEGIN button */}
            <motion.button
              onClick={handleBegin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: 8,
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: bgColor,
                backgroundColor: lineColor,
                border: 'none',
                padding: '16px 48px',
                borderRadius: 50,
                cursor: 'pointer',
              }}
            >
              BEGIN
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* iOS-style Bottom Sheet - Contractions History (hidden during recording) */}
      <AnimatePresence>
        {activeTab === 'contractions' && allContractions.length > 0 && !isRecording && (!isHydrated || hasBegun) && (
          <motion.section
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleSheetDragEnd}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              height: sheetExpanded ? '80vh' : '20vh',
              transition: 'height 0.3s ease-out',
              backgroundColor: isNight ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: `0 -4px 20px ${lineColor}15`,
              display: 'flex',
              flexDirection: 'column',
            }}
            aria-label="Contractions history"
          >
            <SheetDragHandle lineColor={lineColor} />
            
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 16px 12px',
              }}
            >
              {/* 3-dot menu button */}
              <button
                onClick={() => setShowMenu(true)}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: lineColor,
                  opacity: 0.6,
                }}
                aria-label="More options"
              >
                <MoreVertical size={16} strokeWidth={2} />
              </button>
              
              <span
                style={{
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  color: lineColor,
                }}
              >
                CONTRACTIONS
              </span>
              
              {/* Plus button */}
              <button
                onClick={() => setShowAddSheet(true)}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: lineColor,
                }}
                aria-label="Add contraction"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Content wrapper */}
            <div
              style={{
                padding: '0px 0px 24px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Header row - always visible */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  flexShrink: 0,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    color: lineColor,
                    opacity: 0.5,
                  }}>
                    DURATION
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    color: lineColor,
                    opacity: 0.5,
                  }}>
                    INTERVAL
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans, sans-serif)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    color: lineColor,
                    opacity: 0.5,
                  }}>
                    TIME
                  </span>
                </div>
              </div>
              
              {/* Data rows - tap to edit */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {allContractions.map((contraction, idx) => {
                  const actualIndex = contractions.length - 1 - idx;
                  const interval = getInterval(actualIndex);
                  const startDate = new Date(contraction.startTime);
                  const isWaterBroke = contraction.type === 'water_broke';
                  
                  // Special row for water broke with animated wavy border
                  if (isWaterBroke) {
                    return (
                      <div
                        key={contraction.id}
                        onClick={() => setEditingWaterBrokeId(contraction.id)}
                        style={{
                          margin: '8px 12px',
                          padding: '12px 0px',
                          borderRadius: 12,
                          cursor: 'pointer',
                          background: `${lineColor}03`,
                          position: 'relative',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          alignItems: 'center',
                        }}
                      >
                        {/* Animated wavy border */}
                        <WavyBorder 
                          width={dimensions.width - 24} 
                          height={52} 
                          color={lineColor}
                          radius={60}
                          params={wavyParams}
                        />
                        
                        {/* Icon + Label */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: 8,
                        }}>
                          <Droplets size={16} strokeWidth={2} color={lineColor} style={{ opacity: 0.5 }} />
                          <span style={{
                            fontFamily: 'var(--font-serif, Georgia, serif)',
                            fontSize: 14,
                            fontWeight: 400,
                            fontStyle: 'italic',
                            color: lineColor,
                            opacity: 0.6,
                          }}>
                            Water broke
                          </span>
                        </div>
                        
                        {/* Empty middle column for alignment */}
                        <div />
                        
                        {/* Time - matching contraction row typography */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            fontFamily: 'var(--font-serif, Georgia, serif)',
                            fontSize: 18,
                            fontWeight: 300,
                            color: lineColor,
                            opacity: 0.5,
                          }}>
                            {startDate.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  // Regular contraction row
                  return (
                    <div
                      key={contraction.id}
                      onClick={() => setEditingId(contraction.id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-serif, Georgia, serif)',
                          fontSize: 18,
                          fontWeight: 300,
                          color: lineColor,
                        }}>
                          {formatDuration(contraction.duration)}
                        </span>
                      </div>
                      <div style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-serif, Georgia, serif)',
                          fontSize: 18,
                          fontWeight: 300,
                          color: lineColor,
                        }}>
                          {interval ? `${interval}m` : '—'}
                        </span>
                      </div>
                      <div style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-serif, Georgia, serif)',
                          fontSize: 18,
                          fontWeight: 300,
                          color: lineColor,
                          opacity: 0.5,
                        }}>
                          {startDate.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      
      {/* Edit Contraction Sheet */}
      <AnimatePresence>
        {editingId && (
          <EditContractionSheet
            contraction={contractions.find(c => c.id === editingId) || null}
            onClose={() => setEditingId(null)}
            onSave={(id, updates) => updateContraction(id, updates)}
            onDelete={(id) => deleteContraction(id)}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Menu Sheet */}
      <AnimatePresence>
        {showMenu && (
          <MenuSheet
            onClose={() => setShowMenu(false)}
            onWaterBroke={() => setShowWaterBrokeSheet(true)}
            onExport={() => setShowExportSheet(true)}
            onPairPartner={() => {
              // TODO: Implement pairing feature
              console.log('Pair with partner - coming soon');
            }}
            onClearAll={() => clearAll()}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Export Sheet */}
      <AnimatePresence>
        {showExportSheet && (
          <ExportSheet
            onClose={() => setShowExportSheet(false)}
            contractions={allContractions}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Add Contraction Sheet */}
      <AnimatePresence>
        {showAddSheet && (
          <AddContractionSheet
            onClose={() => setShowAddSheet(false)}
            onAdd={(startTime, duration) => addContraction(startTime, duration)}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Water Broke Sheet - for adding new */}
      <AnimatePresence>
        {showWaterBrokeSheet && (
          <WaterBrokeSheet
            onClose={() => setShowWaterBrokeSheet(false)}
            onConfirm={(time) => addWaterBroke(time)}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Water Broke Sheet - for editing existing */}
      <AnimatePresence>
        {editingWaterBrokeId && (
          <WaterBrokeSheet
            onClose={() => setEditingWaterBrokeId(null)}
            onConfirm={(time) => {
              updateContraction(editingWaterBrokeId, { startTime: time });
              setEditingWaterBrokeId(null);
            }}
            onDelete={() => {
              deleteContraction(editingWaterBrokeId);
              setEditingWaterBrokeId(null);
            }}
            existingTime={contractions.find(c => c.id === editingWaterBrokeId)?.startTime}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Wavy Border Controls (press W to toggle) */}
      <AnimatePresence>
        {showWavyControls && (
          <WavyBorderControls
            params={wavyParams}
            setParams={setWavyParams}
            lineColor={lineColor}
            isNight={isNight}
          />
        )}
      </AnimatePresence>
      
      {/* Celebration Content - same design as welcome splash */}
      <AnimatePresence>
        {showCelebrationContent && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 45,
              padding: '40px 32px 60px',
              background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor}f5 60%, ${bgColor}00 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* Subtitle message */}
            <div
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '0.1em',
                color: lineColor,
                opacity: 0.5,
                textAlign: 'center',
                lineHeight: 1.8,
                textTransform: 'uppercase',
              }}
            >
              Congratulations mama
              <br />
              You created life
            </div>
            
            {/* Export Button - secondary style */}
            <motion.button
              onClick={() => setShowExportSheet(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: 8,
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: lineColor,
                backgroundColor: 'transparent',
                border: `1px solid ${lineColor}40`,
                padding: '14px 40px',
                borderRadius: 50,
                cursor: 'pointer',
              }}
            >
              EXPORT DATA
            </motion.button>
            
            {/* Delete message */}
            <p style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 12,
              fontStyle: 'italic',
              color: lineColor,
              opacity: 0.5,
              marginTop: -12,
            }}>
              Now you can delete the app :)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default WaitScreen;
