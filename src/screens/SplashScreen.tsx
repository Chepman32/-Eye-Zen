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

const SplashScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Splash'>> = ({ navigation }) => {
  const logoScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const containerTranslateY = useSharedValue(0);
  const [nextScreen, setNextScreen] = useState<'Onboarding' | 'Home'>('Home');

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
      containerTranslateY.value = withTiming(-20, { duration: 350 }, (finished: boolean) => {
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
      <LinearGradient colors={["#C8FCEA", "#FFFFFF"]} style={styles.flex}>
        <View style={styles.center}>
          <Animated.View style={[styles.logo, logoStyle]}>
            {/* Simple eye shape using two circles */}
            <View style={styles.eyeOuter}>
              <View style={styles.eyeInner} />
            </View>
          </Animated.View>
          <Animated.Text style={[styles.title, textStyle]}>Отдыхалка для глаз</Animated.Text>
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
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  eyeInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4CAF50',
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: '600',
  },
});

export default SplashScreen;
