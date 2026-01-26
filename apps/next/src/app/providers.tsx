'use client';

import { TamaguiProvider } from '@baby/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAppStore } from '@baby/app';
import config from '@baby/ui/tamagui.config';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));
  
  // Get theme from store
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine theme
  const isNightTime = useAppStore((s) => s.isNightTime);
  const settings = useAppStore((s) => s.settings);
  
  const getTheme = () => {
    if (settings.theme === 'auto') {
      return isNightTime ? 'night' : 'light';
    }
    return settings.theme === 'night' ? 'night' : 
           settings.theme === 'dark' ? 'dark' : 'light';
  };
  
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config} defaultTheme="light">
          {children}
        </TamaguiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme={getTheme()}>
        {children}
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
