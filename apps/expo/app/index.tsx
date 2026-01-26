import { BabyApp } from '@baby/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@baby/app';

export default function Home() {
  const isNightTime = useAppStore((s) => s.isNightTime);
  const settings = useAppStore((s) => s.settings);
  
  const isDark = settings.theme === 'dark' || 
                 settings.theme === 'night' ||
                 (settings.theme === 'auto' && isNightTime);

  return (
    <SafeAreaView 
      style={{ 
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#FDFBF7',
      }}
      edges={['top', 'left', 'right']}
    >
      <BabyApp locale="en" />
    </SafeAreaView>
  );
}
