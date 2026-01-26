// Re-export all Tamagui components and utilities
export * from 'tamagui';

// Export config as both named and default
export { default as config } from '../tamagui.config';

// Re-export specific components for convenience
export {
  TamaguiProvider,
  Theme,
  AnimatePresence,
  styled,
  // Layout
  YStack,
  XStack,
  ZStack,
  Stack,
  // Typography
  Text,
  Paragraph,
  H1, H2, H3, H4, H5, H6,
  // Inputs
  Button,
  Input,
  TextArea,
  // Display
  Card,
  Image,
  Avatar,
  // Feedback
  Spinner,
  // Layout helpers
  Separator,
  ScrollView,
  // Shapes
  Circle,
  Square,
} from 'tamagui';
