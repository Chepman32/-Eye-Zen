import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Haptic from 'react-native-haptic-feedback';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useFocusEffect } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { PremiumStatus } from '../components/PremiumStatus';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = Math.min(width, height) * 0.4;

const HomeScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Home'>> = ({ navigation }) => {
  const idleScale = useSharedValue(1);

  // Ensure portrait when returning from Video
  useFocusEffect(
    React.useCallback(() => {
      Orientation.lockToPortrait();
      return undefined;
    }, [])
  );

  useEffect(() => {
    idleScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [idleScale]);

  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: idleScale.value }] }));

  const onStart = () => {
    Haptic.trigger('impactMedium', { enableVibrateFallback: true });
    idleScale.value = withSequence(
      withSpring(1.1, { damping: 10, stiffness: 150 }),
      withSpring(1)
    );
    setTimeout(() => navigation.navigate('Video'), 120);
  };

  return (
    <View style={styles.container}>
      <PremiumStatus />
      <Animated.View style={[styles.buttonWrap, buttonStyle]}>
        <Pressable onPress={onStart} style={styles.circle} android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}>
          <LinearGradient colors={["rgba(76, 175, 80, 0.8)", "rgba(129, 199, 132, 0.8)"]} style={styles.circle}>
            <Text style={styles.startText}>Start</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  buttonWrap: { width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2, shadowColor: '#4CAF50', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  circle: { width: '100%', height: '100%', borderRadius: BUTTON_SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  startText: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
});

export default HomeScreen;
