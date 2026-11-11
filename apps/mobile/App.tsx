import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useMomentsFonts } from '@moments/ui';

import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AuthProvider } from './src/features/auth/AuthProvider';
import { RecordingSessionProvider } from './src/features/recording/RecordingSessionProvider';

export default function App() {
  const [fontsLoaded, fontError] = useMomentsFonts();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RecordingSessionProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </RecordingSessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
