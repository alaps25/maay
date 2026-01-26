# Setup Instructions

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```
   
   This will start both Next.js and Expo dev servers.

## Running Individual Apps

### Next.js (Web)
```bash
cd apps/next
npm run dev
```
Visit `http://localhost:3000` to see the Tracking Dashboard.

### Expo (Mobile)
```bash
cd apps/expo
npm run dev
```
Scan the QR code with Expo Go app on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Platform-Specific Module Resolution

The project uses platform-specific file extensions for native modules:

- **Web**: Resolves `.web.ts` files (configured in `next.config.js`)
- **Native**: Resolves `.native.ts` files (configured in `metro.config.js`)

Example: `LiveActivityService.ts` exports from `.web.ts` by default, but Metro will automatically resolve `.native.ts` when building for React Native.

## Adding New Features

### Adding a New Screen

1. Create screen in `packages/app/src/features/[feature-name]/[ScreenName].tsx`
2. Use only Tamagui components (`YStack`, `XStack`, `Text`, `Card`, etc.)
3. Export from `packages/app/src/features/index.ts`
4. Import and use in both `apps/next` and `apps/expo`

### Adding Native Functionality

1. Create interface in `packages/app/src/native-modules/[ServiceName].ts`
2. Create web implementation: `[ServiceName].web.ts`
3. Create native implementation: `[ServiceName].native.ts`
4. Export from `packages/app/src/native-modules/index.ts`

## Troubleshooting

### Tamagui not rendering correctly
- Ensure `@tamagui/babel-plugin` is installed and configured in `babel.config.js`
- Check that `tamagui.config.ts` is properly exported

### Platform-specific modules not resolving
- **Web**: Check `next.config.js` has `.web.ts` in `resolve.extensions`
- **Native**: Check `metro.config.js` includes `.native.ts` in `sourceExts`

### TypeScript errors
- Run `npm run type-check` from root
- Ensure all packages have proper `tsconfig.json` extending root config
