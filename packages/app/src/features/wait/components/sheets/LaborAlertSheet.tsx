import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetSubtitle,
} from '../../../../components/Sheet';
import {
  colors,
  spacing,
  sizes,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
  radii,
  opacity,
} from '../../../../design';
import { t } from '../../../../i18n';

export type LaborAlertType = 'activeLabor' | 'hospitalReady';

interface LaborAlertSheetProps {
  type: LaborAlertType;
  onActivate: () => void; // Called when user activates the phase
  onClose: () => void;    // Called when user closes without activating
  lineColor: string;
  isNight: boolean;
  locale?: 'en' | 'es';
}

/**
 * LaborAlertSheet - Prompts user to activate a labor phase
 * 
 * - activeLabor → activates "Active Labor" phase
 * - hospitalReady → activates "Transition" phase
 * 
 * Activating a phase:
 * - Adjusts breathing pace (slower for more intense phases)
 * - Records milestone in contractions history
 */
export function LaborAlertSheet({
  type,
  onActivate,
  onClose,
  lineColor,
  isNight,
  locale = 'en',
}: LaborAlertSheetProps) {
  const translations = t(locale);
  const { title, subtitle } = translations.wait.laborAlerts[type];
  const { learnMore, learnMoreUrl } = translations.wait.laborAlerts;

  // Map alert type to phase name for button text
  const phaseName = type === 'activeLabor' ? 'ACTIVE LABOR' : 'TRANSITION';

  // Primary button style - matches confirmation button pattern
  const primaryButtonStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.narrow,
    color: isNight ? '#000' : colors.white,
    backgroundColor: lineColor,
    border: 'none',
    padding: `${spacing[6]}px ${spacing[10]}px`,
    borderRadius: radii.full,
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[4],
  };

  // Secondary button style - outline variant
  const secondaryButtonStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.narrow,
    color: lineColor,
    backgroundColor: 'transparent',
    border: `1px solid ${lineColor}${opacity.light}`,
    padding: `${spacing[6]}px ${spacing[10]}px`,
    borderRadius: radii.full,
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[4],
    marginTop: spacing[6],
  };

  const noteStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.regular,
    color: lineColor,
    opacity: 0.5,
    marginTop: spacing[4],
    textAlign: 'center' as const,
  };

  const handleLearnMore = () => {
    // Open WHO guidelines in new tab
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    if (win?.open) {
      win.open(learnMoreUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Sheet
      onClose={onClose}
      lineColor={lineColor}
      isNight={isNight}
      variant="dialog"
      background="subtle"
    >
      <SheetHeader
        title={title}
        lineColor={lineColor}
        onClose={onClose}
      />
      <SheetContent centered>
        <div style={{ marginBottom: spacing[8] }}>
          <SheetSubtitle lineColor={lineColor}>{subtitle}</SheetSubtitle>
        </div>

        {/* Enter phase - Primary action */}
        <button onClick={onActivate} style={primaryButtonStyle}>
          ENTER {phaseName}
          <ArrowRight size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
        </button>
        
        {/* Explanation note */}
        <p style={noteStyle}>
          Adjusts breathing pace and records this milestone
        </p>

        {/* WHO Guidelines - Secondary button */}
        <button onClick={handleLearnMore} style={secondaryButtonStyle}>
          <ExternalLink size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
          WHO GUIDELINES
        </button>
      </SheetContent>
    </Sheet>
  );
}

export default LaborAlertSheet;
