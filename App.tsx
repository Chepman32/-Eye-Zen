/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import VideoScreen from './src/screens/VideoScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { enableScreens } from 'react-native-screens';
import { PurchaseProvider } from './src/contexts/PurchaseContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import './src/i18n/i18n';

enableScreens(true);

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  Video: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const defaultOrientation = Platform.OS === 'ios' && Platform.isPad ? 'all' : 'portrait';

function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: theme.colors.background },
      }}
    >
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false, animation: 'fade', orientation: defaultOrientation }}
              >
                <Stack.Screen name="Splash" component={SplashScreen} options={{ orientation: defaultOrientation }} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ orientation: defaultOrientation }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ orientation: defaultOrientation }} />
                <Stack.Screen
                  name="Video"
                  component={VideoScreen}
                  options={{
                    animation: 'slide_from_right',
                    orientation: 'landscape',
                  }}
                />
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    animation: 'slide_from_right',
                    orientation: defaultOrientation,
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <PurchaseProvider>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </PurchaseProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
