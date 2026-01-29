import type { usePairSession } from '../../hooks/usePairSession';

/**
 * Tab types for main navigation
 */
export type Tab = 'contractions' | 'birth';

/**
 * Props for the main WaitScreen component
 */
export interface WaitScreenProps {
  locale?: 'en' | 'es';
  onBabyArrived?: () => void;
}

/**
 * Contraction data type
 */
export interface ContractionData {
  id: string;
  startTime: number;
  duration: number | null;
  endTime?: number | null;
  type?: 'contraction' | 'water_broke';
}

/**
 * Base props for all sheet components
 */
export interface BaseSheetProps {
  onClose: () => void;
  lineColor: string;
  isNight: boolean;
}

/**
 * Props for EditContractionSheet
 */
export interface EditSheetProps extends BaseSheetProps {
  contraction: {
    id: string;
    startTime: number;
    duration: number | null;
  } | null;
  onSave: (id: string, updates: { duration?: number; startTime?: number }) => void;
  onDelete: (id: string) => void;
}

/**
 * Props for AddContractionSheet
 */
export interface AddSheetProps extends BaseSheetProps {
  onAdd: (startTime: number, duration: number) => void;
}

/**
 * Props for WaterBrokeSheet
 */
export interface WaterBrokeSheetProps extends BaseSheetProps {
  onConfirm: (time: number) => void;
  onDelete?: () => void;
  existingTime?: number;
}

/**
 * Props for MenuSheet
 */
export interface MenuSheetProps extends BaseSheetProps {
  onWaterBroke: () => void;
  onExport: () => void;
  onPairPartner: () => void;
  onClearAll: () => void;
}

/**
 * Props for PairSheet
 */
export interface PairSheetProps extends BaseSheetProps {
  bgColor: string;
  pairSession: ReturnType<typeof usePairSession>;
}

/**
 * Props for ExportSheet
 */
export interface ExportSheetProps extends BaseSheetProps {
  contractions: ContractionData[];
}

/**
 * Props for AboutSheet
 */
export interface AboutSheetProps extends BaseSheetProps {}

/**
 * Export count options
 */
export type ExportCount = 10 | 20 | 50 | 'all';

/**
 * About page sub-pages
 */
export type AboutSubPage = 'main' | 'howItWorks' | 'impressum' | 'privacy' | 'terms' | 'medical' | 'gdpr';
