/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
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
import { ThemeProvider } from './src/contexts/ThemeContext';
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

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <PurchaseProvider>
          <SafeAreaProvider>
            <NavigationContainer
              theme={{
                ...DefaultTheme,
                colors: { ...DefaultTheme.colors, background: '#FFFFFF' },
              }}
            >
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false, animation: 'fade', orientation: 'portrait' }}
              >
                <Stack.Screen name="Splash" component={SplashScreen} options={{ orientation: 'portrait' }} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ orientation: 'portrait' }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ orientation: 'portrait' }} />
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
                    orientation: 'portrait',
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </PurchaseProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
