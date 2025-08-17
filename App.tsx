/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import VideoScreen from './src/screens/VideoScreen';
import { enableScreens } from 'react-native-screens';
import Ionicons from 'react-native-vector-icons/Ionicons';

enableScreens(true);

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Video: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Ensure vector icon font is registered
  useEffect(() => {
    Ionicons.loadFont();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
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
          <Stack.Screen name="Home" component={HomeScreen} options={{ orientation: 'portrait' }} />
          <Stack.Screen
            name="Video"
            component={VideoScreen}
            options={{
              animation: 'slide_from_right',
              // Force landscape for this screen (native-stack option)
              // Values: 'portrait' | 'landscape' | 'all' | 'allButUpsideDown'
              orientation: 'landscape',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
