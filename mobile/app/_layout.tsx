import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.bg} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.bg },
            headerTintColor: Colors.textPrimary,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: Colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="result/toxicology"
            options={{ title: 'Safety Report', presentation: 'card' }}
          />
          <Stack.Screen
            name="result/interactions"
            options={{ title: 'Interaction Check', presentation: 'card' }}
          />
          <Stack.Screen
            name="result/pill"
            options={{ title: 'Pill Identification', presentation: 'card' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
