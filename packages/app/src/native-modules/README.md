# Native Modules

This directory contains platform-specific implementations for native features.

## Live Activities

The `LiveActivityService` provides a unified interface for Live Activities (iOS Dynamic Island) across platforms:

- **Web**: No-op implementation that logs to console
- **Native**: Bridges to Swift ActivityKit module

### Future Swift Implementation

To implement the Swift native module:

1. Create a Swift file in `apps/expo/ios/`:
   ```swift
   // ActivityKitModule.swift
   import Foundation
   import ActivityKit
   import React

   @objc(ActivityKitModule)
   class ActivityKitModule: RCTEventEmitter {
     // Implementation here
   }
   ```

2. Create a bridging header if needed
3. Register the module in your Expo config plugin

### Usage

```typescript
import { LiveActivityService } from '@baby/app';

if (LiveActivityService.isSupported()) {
  await LiveActivityService.startActivity({
    id: 'tracking-123',
    title: 'Tracking Session',
    status: 'active'
  });
}
```
