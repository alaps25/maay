'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface WheelPickerProps {
  values: (string | number)[];
  selectedIndex: number;
  onChange: (index: number, value: string | number) => void;
  width?: number;
  itemHeight?: number;
  color?: string;
  fontSize?: number;
}

/**
 * iOS-style wheel picker with proper scroll behavior
 * - Selection is always centered (middle row)
 * - All items including first and last are selectable
 * - Uses CSS scroll-snap for smooth native feel
 */
export function WheelPicker({
  values,
  selectedIndex,
  onChange,
  width = 50,
  itemHeight = 36,
  color = '#1a1a1a',
  fontSize = 20,
}: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 3 visible items with selection in center
  const containerHeight = itemHeight * 3;
  const paddingHeight = itemHeight; // Space above/below to allow first/last item to center
  
  // Scroll to the selected index when it changes externally
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isScrollingRef.current) return;
    
    // Calculate scroll position: item should be in center
    const targetScroll = selectedIndex * itemHeight;
    el.scrollTop = targetScroll;
    setActiveIndex(selectedIndex);
  }, [selectedIndex, itemHeight]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    isScrollingRef.current = true;
    
    // Calculate which item is currently centered
    const scrollTop = el.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    
    setActiveIndex(clampedIndex);
    
    // Debounce the final selection
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const finalScroll = el.scrollTop;
      const finalIndex = Math.round(finalScroll / itemHeight);
      const finalClamped = Math.max(0, Math.min(finalIndex, values.length - 1));
      
      // Snap to exact position
      el.scrollTop = finalClamped * itemHeight;
      
      // Notify parent of change
      if (finalClamped !== selectedIndex) {
        onChange(finalClamped, values[finalClamped]);
      }
      
      isScrollingRef.current = false;
    }, 100);
  }, [itemHeight, values, selectedIndex, onChange]);

  // Click to select item
  const handleItemClick = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    
    el.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth',
    });
  }, [itemHeight]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height: containerHeight,
        overflow: 'hidden',
      }}
    >
      {/* Selection highlight - centered row */}
      <div
        style={{
          position: 'absolute',
          top: paddingHeight,
          left: 0,
          right: 0,
          height: itemHeight,
          borderTop: `1px solid ${color}15`,
          borderBottom: `1px solid ${color}15`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      
      {/* Scrollable area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          height: containerHeight,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          // KEY FIX: scroll-padding offsets the snap position by the top padding
          // This allows item 0 to snap correctly when scrollTop = 0
          scrollPaddingTop: paddingHeight,
          scrollPaddingBottom: paddingHeight,
          WebkitOverflowScrolling: 'touch',
          // Hide scrollbar
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Top padding - allows first item to be centered */}
        <div style={{ height: paddingHeight }} />
        
        {/* Wheel items */}
        {values.map((value, index) => {
          const distance = Math.abs(index - activeIndex);
          
          // Visual styling based on distance from selection
          const isActive = distance === 0;
          const blur = isActive ? 0 : distance === 1 ? 1.5 : 4;
          const opacity = isActive ? 1 : distance === 1 ? 0.35 : 0.12;
          
          return (
            <div
              key={`${value}-${index}`}
              onClick={() => handleItemClick(index)}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize,
                  fontWeight: isActive ? 400 : 300,
                  color,
                  opacity,
                  filter: blur > 0 ? `blur(${blur}px)` : 'none',
                  transition: 'opacity 0.1s, filter 0.1s',
                  userSelect: 'none',
                }}
              >
                {typeof value === 'number' ? value.toString().padStart(2, '0') : value}
              </span>
            </div>
          );
        })}
        
        {/* Bottom padding - allows last item to be centered */}
        <div style={{ height: paddingHeight }} />
      </div>
    </div>
  );
}

interface DurationPickerProps {
  minutes: number;
  seconds: number;
  onChange: (minutes: number, seconds: number) => void;
  color?: string;
}

/**
 * Duration picker with minutes and seconds wheels
 */
const WHEEL_HEIGHT = 108; // 3 items * 36px
const ITEM_HEIGHT = 36;
const FONT_SIZE = 20;

export function DurationPicker({
  minutes,
  seconds,
  onChange,
  color = '#1a1a1a',
}: DurationPickerProps) {
  // Minutes: 0-5 (contractions rarely exceed 2-3 mins, 5 max for edge cases)
  const minuteValues = [0, 1, 2, 3, 4, 5];
  // Seconds: 0-59 with 1-second granularity
  const secondValues = Array.from({ length: 60 }, (_, i) => i);
  
  const minuteIndex = minuteValues.indexOf(minutes);
  const secondIndex = seconds;
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 4,
      height: WHEEL_HEIGHT,
    }}>
      <WheelPicker
        values={minuteValues}
        selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
        onChange={(_, value) => onChange(Number(value), seconds)}
        width={44}
        itemHeight={ITEM_HEIGHT}
        color={color}
        fontSize={FONT_SIZE}
      />
      <span
        style={{
          fontFamily: 'var(--font-serif, Georgia, serif)',
          fontSize: FONT_SIZE,
          fontWeight: 300,
          color,
          opacity: 0.3,
          lineHeight: `${WHEEL_HEIGHT}px`,
        }}
      >
        :
      </span>
      <WheelPicker
        values={secondValues}
        selectedIndex={secondIndex >= 0 && secondIndex < secondValues.length ? secondIndex : 0}
        onChange={(_, value) => onChange(minutes, Number(value))}
        width={44}
        itemHeight={ITEM_HEIGHT}
        color={color}
        fontSize={FONT_SIZE}
      />
    </div>
  );
}

interface TimePickerProps {
  hours: number;
  minutes: number;
  onChange: (hours: number, minutes: number) => void;
  color?: string;
}

/**
 * Time picker with hours, minutes, and AM/PM wheels (iOS alarm style)
 */
export function TimePicker({
  hours,
  minutes,
  onChange,
  color = '#1a1a1a',
}: TimePickerProps) {
  // Convert 24h to 12h format
  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;
  
  // Hour values (1-12)
  const hourValues = Array.from({ length: 12 }, (_, i) => i + 1);
  // Minute values (0-59)
  const minuteValues = Array.from({ length: 60 }, (_, i) => i);
  // AM/PM values
  const periodValues = ['AM', 'PM'];
  
  const hourIndex = hourValues.indexOf(displayHour);
  const minuteIndex = minutes;
  const periodIndex = isPM ? 1 : 0;
  
  const handleHourChange = (_: number, value: string | number) => {
    let newHours = Number(value);
    if (isPM && newHours !== 12) newHours += 12;
    if (!isPM && newHours === 12) newHours = 0;
    onChange(newHours, minutes);
  };
  
  const handleMinuteChange = (_: number, value: string | number) => {
    onChange(hours, Number(value));
  };
  
  const handlePeriodChange = (_: number, value: string | number) => {
    const newIsPM = value === 'PM';
    let newHours = displayHour;
    if (newIsPM && hours < 12) newHours = hours + 12;
    if (!newIsPM && hours >= 12) newHours = hours - 12;
    onChange(newHours, minutes);
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 4,
      height: WHEEL_HEIGHT,
    }}>
      <WheelPicker
        values={hourValues}
        selectedIndex={hourIndex >= 0 ? hourIndex : 0}
        onChange={handleHourChange}
        width={44}
        itemHeight={ITEM_HEIGHT}
        color={color}
        fontSize={FONT_SIZE}
      />
      <span
        style={{
          fontFamily: 'var(--font-serif, Georgia, serif)',
          fontSize: FONT_SIZE,
          fontWeight: 300,
          color,
          opacity: 0.3,
          lineHeight: `${WHEEL_HEIGHT}px`,
        }}
      >
        :
      </span>
      <WheelPicker
        values={minuteValues}
        selectedIndex={minuteIndex}
        onChange={handleMinuteChange}
        width={44}
        itemHeight={ITEM_HEIGHT}
        color={color}
        fontSize={FONT_SIZE}
      />
      <WheelPicker
        values={periodValues}
        selectedIndex={periodIndex}
        onChange={handlePeriodChange}
        width={44}
        itemHeight={ITEM_HEIGHT}
        color={color}
        fontSize={14}
      />
    </div>
  );
}
