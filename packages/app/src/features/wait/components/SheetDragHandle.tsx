import React from 'react';
import { sizes, radii, spacing, opacity } from '../../../design';

interface SheetDragHandleProps {
  lineColor: string;
}

/**
 * Reusable drag handle component for bottom sheets
 */
export function SheetDragHandle({ lineColor }: SheetDragHandleProps) {
  return (
    <div
      style={{
        width: sizes.dragHandleWidth,
        height: sizes.dragHandleHeight,
        backgroundColor: lineColor,
        opacity: parseFloat(`0.${opacity.medium}`),
        borderRadius: radii.micro,
        margin: `${spacing[6]}px auto ${spacing[4]}px`,
      }}
    />
  );
}

export default SheetDragHandle;
