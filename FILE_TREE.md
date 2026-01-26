# Project File Tree

```
baby-monorepo/
├── apps/
│   ├── next/                          # Next.js Web App
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── layout.tsx         # Root layout with providers
│   │   │       ├── page.tsx           # Home page (renders TrackingDashboard)
│   │   │       └── providers.tsx      # Client-side providers (Tamagui, React Query)
│   │   ├── next.config.js             # Next.js config with Tamagui transpilation
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── expo/                          # Expo Mobile App
│       ├── app/
│       │   ├── _layout.tsx            # Root layout with providers
│       │   └── index.tsx              # Home screen (renders TrackingDashboard)
│       ├── ios/
│       │   └── README.md              # Swift native module setup guide
│       ├── plugins/
│       │   └── withActivityKit.ts     # Expo config plugin for ActivityKit
│       ├── app.json                   # Expo configuration
│       ├── babel.config.js            # Babel config with Tamagui plugin
│       ├── metro.config.js            # Metro config for platform extensions
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── app/                           # Shared Business Logic & Screens
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── tracking/
│   │   │   │   │   └── TrackingDashboard.tsx  # Shared screen component
│   │   │   │   └── index.ts
│   │   │   ├── native-modules/
│   │   │   │   ├── LiveActivityService.ts          # Main interface
│   │   │   │   ├── LiveActivityService.web.ts      # Web implementation (no-op)
│   │   │   │   ├── LiveActivityService.native.ts   # Native implementation (bridges to Swift)
│   │   │   │   ├── index.ts
│   │   │   │   └── README.md
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui/                            # Shared UI Components (Tamagui)
│       ├── src/
│       │   └── index.tsx              # Re-exports Tamagui components
│       ├── tamagui.config.ts          # Tamagui theme configuration
│       ├── package.json
│       └── tsconfig.json
│
├── .gitignore
├── .prettierrc
├── package.json                       # Root workspace config
├── turbo.json                         # Turborepo pipeline config
├── tsconfig.json                      # Base TypeScript config
└── README.md                          # Project documentation
```

## Key Files Explained

### Shared Screen
- `packages/app/src/features/tracking/TrackingDashboard.tsx`
  - Universal screen component using 100% Tamagui components
  - Renders identically on Web (Next.js) and Mobile (Expo)

### Native Module Pattern
- `packages/app/src/native-modules/LiveActivityService.ts`
  - Main interface exported to consumers
  - Platform-specific implementations:
    - `.web.ts` - Web (no-op, logs to console)
    - `.native.ts` - Native (bridges to Swift ActivityKit)

### Platform Entry Points
- **Next.js**: `apps/next/src/app/page.tsx` → imports `TrackingDashboard`
- **Expo**: `apps/expo/app/index.tsx` → imports `TrackingDashboard`

### Configuration
- **Tamagui**: `packages/ui/tamagui.config.ts` - Single source of truth for UI tokens
- **Metro**: `apps/expo/metro.config.js` - Resolves `.native.ts` extensions
- **Next.js**: `apps/next/next.config.js` - Transpiles Tamagui, resolves `.web.ts`
