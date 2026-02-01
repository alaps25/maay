# Maay

A calm, beautiful companion for your journey into parenthood. Guiding you through three distinct phases: **THE WAIT**, **THE MOMENT**, and **THE RHYTHM**.

## Architecture

```
maay-monorepo/
├── apps/
│   ├── next/                    # Next.js 14+ Web App
│   └── expo/                    # Expo SDK 50 Mobile App
├── packages/
│   ├── app/                     # Shared business logic & screens
│   │   ├── components/          # UI components (AuraButton, ParticleExplosion, etc.)
│   │   ├── features/            # Phase screens (Wait, Moment, Rhythm)
│   │   ├── hooks/               # Custom hooks (useSyncSession, useHaptics)
│   │   ├── stores/              # Zustand stores with persistence
│   │   ├── i18n/                # Internationalization
│   │   └── native-modules/      # Platform-specific code
│   └── ui/                      # Tamagui config & design tokens
```

## Tech Stack

- **Framework**: Next.js 14+ (Web) + Expo SDK 50 (Mobile)
- **Navigation**: Solito + Expo Router
- **UI**: Tamagui (Universal UI kit)
- **Monorepo**: Turborepo
- **State**: TanStack Query + Zustand (with offline persistence)
- **Language**: TypeScript (Strict Mode)

## The Three Phases

### Phase 1: THE WAIT
Contractions & Health Standards

- **Aura Button**: Large, organic, pulsating button that "breathes" with the user
- **Adaptive Breathing**: Breathing guidance pace automatically adjusts based on labor phase—normal rhythm in early labor, slower during active labor, slowest during transition
- **Enhanced Haptic Feedback**: Strong haptic patterns for breathing guidance (building inhale, releasing exhale) with distinct calm release haptic when contractions end (iOS native)
- **Labor Intelligence**: Automatic detection of labor phases (early, active, transition) with confirmation alerts for active labor and transition (5-1-1 pattern)
- **Labor Phase Management**: Manual phase selection via menu, with milestone entries recorded in contractions history
- **5-1-1 Medical Intelligence**: Automatic detection of the 5-1-1 pattern with care guidance card
- **Contraction History**: Visual log with duration, intervals, and labor phase milestones
- **Smart Safeguards**: Accidental tap detection (<5s) and auto-end prompt for long recordings (>2min)

### Phase 2: THE MOMENT  
The Birth Celebration UI

- **3-Second Long-Press**: "Baby is Here" trigger with countdown feedback
- **Particle Explosion**: Full-screen generative particles in Gold/White/Champagne tones
- **Morph Transition**: AnimatePresence-powered liquid transitions between phases
- **Golden Hour Card**: High-end serif guidance for skin-to-skin and first feed

### Phase 3: THE RHYTHM
Post-Birth & Feeding

- **Feeding Tracker**: Left Side / Right Side / Bottle toggles with recommended side
- **Diaper Log**: WHO/UNICEF standards with day-by-day expectations
- **Daily Statistics**: Track progress against health milestones
- **Sync Status**: Partner sync indicator with offline support

## Key Features

### Partner Sync (Real-time Mirroring)
```typescript
import { useSyncSession } from '@baby/app';

const { isConnected, syncNow, joinHousehold } = useSyncSession();
```
- Optimistic UI updates (local-first)
- WebSocket connection for real-time partner updates
- Automatic retry and offline queue

### Offline/Hospital Mode
- All data saved locally first via Zustand persistence
- Works perfectly in hospital basements with no Wi-Fi
- Automatic sync when connection returns

### Night Nursery Mode
- OLED blacks for 3 AM usage
- Low-intensity colors
- Extra-large touch targets
- Automatic detection (9 PM - 6 AM)

### Internationalization (i18n)
```typescript
import { t } from '@baby/app';

const translations = t('es'); // Spanish
```
Pre-configured for: English, Spanish (more languages ready to add)

## Getting Started

### Prerequisites
- Node.js 18+
- npm 10+
- For iOS: Xcode 15+ (macOS)
- For Android: Android Studio

### Installation

```bash
# Install dependencies
npm install

# Start development (both Next.js and Expo)
npm run dev
```

### Run Individual Apps

```bash
# Next.js at http://localhost:3000
cd apps/next && npm run dev

# Expo (scan QR with Expo Go)
cd apps/expo && npm run dev
```

## Component Library

### AuraButton
Organic breathing button with haptic feedback:
```tsx
<AuraButton 
  locale="en"
  onContractionStart={() => console.log('Started')}
  onContractionEnd={(duration) => console.log(`Lasted ${duration}s`)}
/>
```

### ParticleExplosion
Generative celebration effect:
```tsx
<ParticleExplosion 
  isActive={showCelebration}
  onComplete={() => setShowCelebration(false)}
  particleCount={150}
  duration={5000}
/>
```

### FeedingTracker
WHO/UNICEF compliant feeding log:
```tsx
<FeedingTracker 
  locale="en"
  onFeedingStart={(side) => updateLiveActivity(side)}
  onFeedingEnd={(duration, side) => console.log('Fed')}
/>
```

## State Management

### Stores
- `useAppStore` - App phase, settings, theme, sync state
- `useContractionStore` - Contraction tracking with 5-1-1 analysis
- `useFeedingStore` - Feeding sessions with daily stats
- `useDiaperStore` - Diaper log with milestone tracking

### Hooks
- `useSyncSession` - Real-time partner synchronization
- `useHaptics` - Platform-agnostic haptic feedback (Capacitor Haptics for iOS native, Vibration API for web)

## Theme Configuration

```typescript
// Custom tokens available:
$auraGold, $auraChampagne, $auraWhite
$nightBlack, $nightSurface, $nightCard, $nightText
$careGreen, $careAmber, $careRed
```

## Native iOS Features

Ready for Dynamic Island / Live Activities:
- `LiveActivityService` with platform-specific implementations
- Expo config plugin for ActivityKit
- Swift bridging documentation in `apps/expo/ios/README.md`

## Medical Standards

All guidance based on:
- **WHO/UNICEF** - Feeding and diaper expectations
- **5-1-1 Rule** - Standard contraction pattern recognition
- **Golden Hour** - First hour post-birth best practices

**Disclaimer**: This app provides general guidance only. Always consult your healthcare provider for medical advice.

## License

Private project
