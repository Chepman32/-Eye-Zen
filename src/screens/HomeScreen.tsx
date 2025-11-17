import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
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
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Home'>> = ({ navigation }) => {
  const idleScale = useSharedValue(1);
  const { theme } = useTheme();
  const { hapticsEnabled } = useSettings();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const safeTopSpacing = Math.max(insets.top, 12);
  const { width, height } = useWindowDimensions();
  const isTabletLayout = width >= 768;
  const buttonSize = useMemo(() => {
    const base = Math.min(width, height) * (isTabletLayout ? 0.4 : 0.6);
    return Math.max(220, Math.min(base, 420));
  }, [height, width, isTabletLayout]);
  const buttonWrapperStyle = useMemo<ViewStyle>(
    () => ({
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      shadowColor: '#4CAF50',
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    }),
    [buttonSize]
  );
  const circleStyle = useMemo<ViewStyle>(
    () => ({
      width: '100%',
      height: '100%',
      borderRadius: buttonSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [buttonSize]
  );

  // Ensure portrait on phones, allow free rotation on tablets
  useFocusEffect(
    React.useCallback(() => {
      if (isTabletLayout) {
        Orientation.unlockAllOrientations();
      } else {
        Orientation.lockToPortrait();
      }
      return () => {
        if (isTabletLayout) {
          Orientation.unlockAllOrientations();
        } else {
          Orientation.lockToPortrait();
        }
      };
    }, [isTabletLayout])
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
    if (hapticsEnabled) {
      Haptic.trigger('impactLight', { enableVibrateFallback: true });
    }
    idleScale.value = withSequence(
      withSpring(1.1, { damping: 10, stiffness: 150 }),
      withSpring(1)
    );
    setTimeout(() => navigation.navigate('Video'), 120);
  };

  const onSettings = () => {
    if (hapticsEnabled) {
      Haptic.trigger('impactLight', { enableVibrateFallback: true });
    }
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          isTabletLayout && styles.tabletContainer,
        ]}>
        {/* Settings Button */}
        <Pressable
          onPress={onSettings}
          style={[
            styles.settingsButton,
            { backgroundColor: theme.colors.surface, top: safeTopSpacing },
          ]}
          android_ripple={{ color: theme.colors.primary, borderless: true }}>
          <Icon name="settings-outline" size={24} color={theme.colors.text} />
        </Pressable>

        {isTabletLayout ? (
          <View style={styles.tabletContent}>
            <View style={styles.tabletStatusColumn}>
              <PremiumStatus variant="inline" />
            </View>
            <View style={styles.tabletButtonColumn}>
              <Animated.View style={[buttonWrapperStyle, buttonStyle]}>
                <Pressable
                  onPress={onStart}
                  style={circleStyle}
                  android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}>
                  <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={circleStyle}>
                    <Text style={[styles.startText, { color: theme.colors.textInverse }]}>{t('home.start')}</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        ) : (
          <>
            <PremiumStatus topOffset={safeTopSpacing + 12} />
            <Animated.View style={[buttonWrapperStyle, buttonStyle]}>
              <Pressable
                onPress={onStart}
                style={circleStyle}
                android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}>
                <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={circleStyle}>
                  <Text style={[styles.startText, { color: theme.colors.textInverse }]}>{t('home.start')}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 120 },
  tabletContainer: {
    justifyContent: 'center',
    paddingBottom: 0,
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 1000,
  },
  tabletContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  tabletStatusColumn: {
    flex: 1,
    maxWidth: 460,
  },
  tabletButtonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  startText: { fontSize: 28, fontWeight: '700' },
});

export default HomeScreen;
