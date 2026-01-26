# iOS Native Modules

This directory contains native iOS code for integrating Swift features like Dynamic Island and Live Activities.

## Setup Instructions

### 1. Create Expo Config Plugin

Create a config plugin to register the native module:

```typescript
// apps/expo/plugins/withActivityKit.ts
import { ConfigPlugin } from '@expo/config-plugins';

export const withActivityKit: ConfigPlugin = (config) => {
  // Plugin implementation
  return config;
};
```

### 2. Swift Native Module Structure

Create the following Swift files:

#### ActivityKitModule.swift
```swift
import Foundation
import ActivityKit
import React

@objc(ActivityKitModule)
class ActivityKitModule: RCTEventEmitter {
  
  @objc
  func startActivity(_ data: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // Implementation for starting Live Activity
    // Use ActivityKit to create and start the activity
  }
  
  @objc
  func updateActivity(_ id: String, data: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // Implementation for updating Live Activity
  }
  
  @objc
  func endActivity(_ id: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // Implementation for ending Live Activity
  }
  
  override func supportedEvents() -> [String]! {
    return []
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
```

#### ActivityKitModule.m (Objective-C Bridge)
```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ActivityKitModule, RCTEventEmitter)

RCT_EXTERN_METHOD(startActivity:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateActivity:(NSString *)id
                  data:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endActivity:(NSString *)id
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
```

### 3. Bridging Header

Create `BabyTrackingApp-Bridging-Header.h`:

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
```

### 4. Activity Widget Extension

For Dynamic Island and Lock Screen widgets:

1. Create a new Widget Extension target in Xcode
2. Implement `ActivityAttributes` protocol
3. Create the widget UI using SwiftUI

### 5. Update app.json

Add the config plugin:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "./plugins/withActivityKit"
    ]
  }
}
```

## Notes

- Ensure `NSSupportsLiveActivities` is set to `true` in Info.plist (already configured in app.json)
- ActivityKit requires iOS 16.1+
- Dynamic Island requires iPhone 14 Pro or later
- Test on physical devices, not simulators
