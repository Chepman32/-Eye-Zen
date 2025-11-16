import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import AsyncStorage from '../services/asyncStorageAdapter';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const SplashScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Splash'>> = ({ navigation }) => {
  const logoScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const containerTranslateY = useSharedValue(0);
  const [nextScreen, setNextScreen] = useState<'Onboarding' | 'Home'>('Home');
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if onboarding was completed
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('@eyezen_onboarding_completed');
        setNextScreen(completed ? 'Home' : 'Onboarding');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setNextScreen('Onboarding'); // Default to showing onboarding if error
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) });
      containerTranslateY.value = withTiming(-20, { duration: 350 }, (finished) => {
        if (finished) runOnJS(navigation.replace)(nextScreen);
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [containerOpacity, containerTranslateY, logoScale, navigation, textOpacity, nextScreen]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.flex, containerStyle]}>
      <LinearGradient colors={[theme.colors.gradientEnd, theme.colors.background]} style={styles.flex}>
        <View style={styles.center}>
          <Animated.View style={[styles.logo, logoStyle]}>
            {/* Simple eye shape using two circles */}
            <View style={[styles.eyeOuter, { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}14` }]}>
              <View style={[styles.eyeInner, { backgroundColor: theme.colors.primary }]} />
            </View>
          </Animated.View>
          <Animated.Text style={[styles.title, { color: theme.colors.primaryDark }, textStyle]}>{t('splash.title')}</Animated.Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  eyeOuter: {
    width: 120,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },
  eyeInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
  },
});

export default SplashScreen;
