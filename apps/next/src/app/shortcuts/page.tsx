'use client';

import React from 'react';

/**
 * Testing Shortcuts Reference Page
 * 
 * Quick reference for all keyboard shortcuts used during development/testing
 */
export default function ShortcutsPage() {
  const shortcuts = [
    { category: 'Labor Alerts (Testing)', items: [
      { key: 'L', description: 'Show Active Labor alert' },
      { key: 'H', description: 'Show Hospital Ready (Transition) alert' },
    ]},
    { category: 'Labor Phase Override (Testing)', items: [
      { key: 'E', description: 'Force Early Labor phase' },
      { key: 'A', description: 'Force Active Labor phase' },
      { key: 'T', description: 'Force Transition phase' },
    ]},
    { category: 'Debug Controls', items: [
      { key: 'W', description: 'Toggle Wavy Border controls' },
      { key: 'C', description: 'Toggle Contraction Wave controls' },
      { key: 'B', description: 'Toggle Birth Wave controls' },
    ]},
    { category: 'General', items: [
      { key: 'Space / Enter', description: 'Start/Stop recording (when main area focused)' },
    ]},
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#E8E0D5',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 300,
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}>
          TESTING SHORTCUTS
        </h1>
        <p style={{
          fontSize: 14,
          opacity: 0.5,
          marginBottom: 40,
        }}>
          Keyboard shortcuts for development and testing
        </p>

        {shortcuts.map((section) => (
          <div key={section.category} style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.05em',
              opacity: 0.6,
              marginBottom: 16,
              textTransform: 'uppercase',
            }}>
              {section.category}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.items.map((item) => (
                <div 
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <kbd style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 48,
                    padding: '8px 12px',
                    backgroundColor: 'rgba(232, 224, 213, 0.1)',
                    border: '1px solid rgba(232, 224, 213, 0.2)',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }}>
                    {item.key}
                  </kbd>
                  <span style={{ opacity: 0.8 }}>
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid rgba(232, 224, 213, 0.1)',
        }}>
          <p style={{
            fontSize: 13,
            fontStyle: 'italic',
            opacity: 0.4,
          }}>
            Note: All shortcuts work on the main app screen. Birth controls (B) only work on the Birth tab.
          </p>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 16,
              color: '#E8E0D5',
              opacity: 0.6,
              textDecoration: 'none',
            }}
          >
            ← Back to app
          </a>
        </div>
      </div>
    </div>
  );
}
