import { useEffect, useState } from 'react';
import { TamaguiProvider } from '@baby/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '@baby/app';
import config from '@baby/ui/tamagui.config';
import * as Haptics from 'expo-haptics';

// Inject Expo Haptics globally for the useHaptics hook
(globalThis as any).ExpoHaptics = Haptics;

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));
  
  // Get theme from store
  const isNightTime = useAppStore((s) => s.isNightTime);
  const settings = useAppStore((s) => s.settings);
  const checkNightTime = useAppStore((s) => s.checkNightTime);
  
  // Check night time on mount
  useEffect(() => {
    checkNightTime();
  }, [checkNightTime]);
  
  const getTheme = (): 'light' | 'dark' | 'night' => {
    if (settings.theme === 'auto') {
      return isNightTime ? 'night' : 'light';
    }
    return settings.theme === 'night' ? 'night' : 
           settings.theme === 'dark' ? 'dark' : 'light';
  };
  
  const theme = getTheme();
  const isDark = theme === 'dark' || theme === 'night';

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: isDark ? '#000000' : '#FDFBF7',
            },
            animation: 'fade',
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Baby',
            }}
          />
        </Stack>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
