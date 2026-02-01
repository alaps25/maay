import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetSubtitle,
} from '../../../../components/Sheet';
import {
  spacing,
  sizes,
  getPrimaryButtonStyle,
  getSecondaryButtonStyle,
} from '../../../../design';
import { t } from '../../../../i18n';

export type LaborAlertType = 'activeLabor' | 'hospitalReady';

interface LaborAlertSheetProps {
  type: LaborAlertType;
  onDismiss: () => void;
  lineColor: string;
  isNight: boolean;
  locale?: 'en' | 'es';
}

/**
 * LaborAlertSheet - Uses Sheet component for labor milestone alerts
 */
export function LaborAlertSheet({
  type,
  onDismiss,
  lineColor,
  isNight,
  locale = 'en',
}: LaborAlertSheetProps) {
  const translations = t(locale);
  const { title, subtitle } = translations.wait.laborAlerts[type];
  const { learnMore, learnMoreUrl } = translations.wait.laborAlerts;

  const primaryButtonStyle = {
    ...getPrimaryButtonStyle(lineColor, isNight ? '#000' : '#fff'),
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[4],
  };

  const secondaryButtonStyle = {
    ...getSecondaryButtonStyle(lineColor),
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[4],
    marginTop: spacing[6],
    // Match primary button padding for consistent height
    padding: `${spacing[8]}px ${spacing[14]}px`,
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
      onClose={onDismiss}
      lineColor={lineColor}
      isNight={isNight}
      variant="dialog"
      background="subtle"
    >
      <SheetHeader
        title={title}
        lineColor={lineColor}
        onClose={onDismiss}
      />
      <SheetContent centered>
        <div style={{ marginBottom: spacing[10] }}>
          <SheetSubtitle lineColor={lineColor}>{subtitle}</SheetSubtitle>
        </div>

        {/* Understood - Primary action */}
        <button onClick={onDismiss} style={primaryButtonStyle}>
          <Check size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
          Understood
        </button>

        {/* WHO Guidelines - Secondary button */}
        <button onClick={handleLearnMore} style={secondaryButtonStyle}>
          <ExternalLink size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
          {learnMore}
        </button>
      </SheetContent>
    </Sheet>
  );
}

export default LaborAlertSheet;
