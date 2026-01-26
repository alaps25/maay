import { YStack, XStack, Text, Card, H2, Button } from '@baby/ui';
import { useState } from 'react';

export function TrackingDashboard() {
  const [count, setCount] = useState(0);

  return (
    <YStack
      flex={1}
      padding="$4"
      backgroundColor="$background"
      space="$4"
    >
      <H2 color="$color">Tracking Dashboard</H2>
      
      <Card
        elevate
        size="$4"
        bordered
        padding="$4"
        backgroundColor="$background"
      >
        <YStack space="$3">
          <Text fontSize="$6" fontWeight="600" color="$color">
            Activity Counter
          </Text>
          <Text fontSize="$8" fontWeight="bold" color="$blue10">
            {count}
          </Text>
          <XStack space="$3">
            <Button
              size="$4"
              theme="blue"
              onPress={() => setCount(count + 1)}
            >
              Increment
            </Button>
            <Button
              size="$4"
              theme="red"
              onPress={() => setCount(0)}
            >
              Reset
            </Button>
          </XStack>
        </YStack>
      </Card>

      <Card
        elevate
        size="$4"
        bordered
        padding="$4"
        backgroundColor="$background"
      >
        <YStack space="$3">
          <Text fontSize="$6" fontWeight="600" color="$color">
            Status
          </Text>
          <Text fontSize="$4" color="$color">
            Dashboard is running successfully!
          </Text>
          <Text fontSize="$3" color="$gray10">
            This screen is shared between Next.js and Expo.
          </Text>
        </YStack>
      </Card>
    </YStack>
  );
}
