import React from 'react';
import { motion } from 'framer-motion';
import type { WavyBorderParams } from '../../constants';

interface WavyBorderControlsProps {
  params: WavyBorderParams;
  setParams: (p: WavyBorderParams) => void;
  lineColor: string;
  isNight: boolean;
}

/**
 * Debug controls panel for wavy border parameters (press 'W' to toggle)
 */
export function WavyBorderControls({
  params,
  setParams,
  lineColor,
  isNight,
}: WavyBorderControlsProps) {
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

export default WavyBorderControls;
