import React from 'react';
import { motion } from 'framer-motion';
import { type WaveParams, defaultWaveParams } from '../../../../components/vector/OrganicWaves';

interface BirthWaveControlsProps {
  params: Partial<WaveParams>;
  setParams: (p: Partial<WaveParams>) => void;
  lineColor: string;
  isNight: boolean;
}

/**
 * Debug controls panel for birth page wave parameters (press 'B' on birth tab to toggle)
 */
export function BirthWaveControls({
  params,
  setParams,
  lineColor,
  isNight,
}: BirthWaveControlsProps) {
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
  
  // Use defaults from the defaultWaveParams
  const getVal = (key: keyof WaveParams) => params[key] ?? defaultWaveParams[key];
  
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
        maxHeight: '70vh',
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
        BIRTH WAVES (B to close)
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>waviness</span>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.1"
          value={getVal('waviness')}
          onChange={(e) => setParams({ ...params, waviness: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{(getVal('waviness') as number).toFixed(1)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>flowSpeed</span>
        <input
          type="range"
          min="0.01"
          max="0.8"
          step="0.01"
          value={getVal('flowSpeed')}
          onChange={(e) => setParams({ ...params, flowSpeed: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{(getVal('flowSpeed') as number).toFixed(2)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>outerLooseness</span>
        <input
          type="range"
          min="0.1"
          max="0.8"
          step="0.02"
          value={getVal('outerLooseness')}
          onChange={(e) => setParams({ ...params, outerLooseness: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{(getVal('outerLooseness') as number).toFixed(2)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>innerTightness</span>
        <input
          type="range"
          min="0.01"
          max="0.1"
          step="0.005"
          value={getVal('innerTightness')}
          onChange={(e) => setParams({ ...params, innerTightness: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{(getVal('innerTightness') as number).toFixed(3)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>outerBlur</span>
        <input
          type="range"
          min="1"
          max="8"
          step="0.5"
          value={getVal('outerBlur')}
          onChange={(e) => setParams({ ...params, outerBlur: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{(getVal('outerBlur') as number).toFixed(1)}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>lineCount</span>
        <input
          type="range"
          min="5"
          max="25"
          step="1"
          value={getVal('lineCount')}
          onChange={(e) => setParams({ ...params, lineCount: parseInt(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{getVal('lineCount')}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>minRadius %</span>
        <input
          type="range"
          min="10"
          max="40"
          step="1"
          value={getVal('minRadiusPercent')}
          onChange={(e) => setParams({ ...params, minRadiusPercent: parseInt(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{getVal('minRadiusPercent')}</span>
      </div>
      
      <div style={controlStyle}>
        <span style={labelStyle}>maxRadius %</span>
        <input
          type="range"
          min="60"
          max="95"
          step="1"
          value={getVal('maxRadiusPercent')}
          onChange={(e) => setParams({ ...params, maxRadiusPercent: parseInt(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{getVal('maxRadiusPercent')}</span>
      </div>
      
      <div style={{ ...controlStyle, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${lineColor}20` }}>
        <span style={{ ...labelStyle, fontWeight: 600 }}>timeScale</span>
        <input
          type="range"
          min="0.5"
          max="12"
          step="0.5"
          value={getVal('timeScale')}
          onChange={(e) => setParams({ ...params, timeScale: parseFloat(e.target.value) })}
          style={inputStyle}
        />
        <span style={valueStyle}>{(getVal('timeScale') as number).toFixed(1)}x</span>
      </div>
      
      <button
        onClick={() => setParams({})}
        style={{
          marginTop: 12,
          padding: '8px 16px',
          fontFamily: 'monospace',
          fontSize: 10,
          backgroundColor: `${lineColor}20`,
          color: lineColor,
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        RESET TO DEFAULTS
      </button>
    </motion.div>
  );
}

export default BirthWaveControls;
