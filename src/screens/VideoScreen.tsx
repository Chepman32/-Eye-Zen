import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Platform, Text } from 'react-native';
import Video, { OnLoadData } from 'react-native-video';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/Ionicons';
import { usePurchase } from '../contexts/PurchaseContext';
import { PurchaseModal } from '../components/PurchaseModal';

const source = require('../../assets/video/video.mp4');

const VideoScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Video'>> = ({
  navigation,
}) => {
  const player = useRef<React.ElementRef<typeof Video>>(null);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);

  const {
    canWatchVideo,
    remainingVideos,
    maxDailyLimit,
    isPremium,
    incrementWatchCount,
    isLoading,
  } = usePurchase();

  const videoOpacity = useSharedValue(0);
  const controlsOffset = useSharedValue(40);
  const closeOffset = useSharedValue(-40);

  // Lock to landscape while this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      Orientation.lockToLandscape();
      return () => {
        Orientation.lockToPortrait();
      };
    }, [])
  );

  // Animate controls on mount
  useEffect(() => {
    controlsOffset.value = withDelay(
      100,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    closeOffset.value = withDelay(
      100,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
  }, [closeOffset, controlsOffset]);

  // Auto-start video if user can watch
  useEffect(() => {
    if (isLoading || hasIncrementedView) {
      return;
    }

    const autoStart = async () => {
      if (canWatchVideo) {
        // Increment watch count
        await incrementWatchCount();
        setHasIncrementedView(true);
        setPaused(false);
      } else {
        // Show purchase modal if limit reached
        setShowPurchaseModal(true);
      }
    };

    autoStart();
  }, [canWatchVideo, incrementWatchCount, isLoading, hasIncrementedView]);

  const onLoad = (_data: OnLoadData) => {
    videoOpacity.value = withTiming(1, { duration: 350 });
  };

  const onClose = () => {
    // Fade out and slide down
    videoOpacity.value = withTiming(0, { duration: 250 });
    controlsOffset.value = withTiming(40, { duration: 200 });
    closeOffset.value = withTiming(-40, { duration: 200 });
    // Proactively return to portrait
    Orientation.lockToPortrait();
    setTimeout(() => {
      navigation.goBack();
      // Ensure rotation after navigation completes
      setTimeout(() => Orientation.lockToPortrait(), 120);
    }, 220);
  };

  const handleTogglePlayback = useCallback(() => {
    if (paused && !canWatchVideo) {
      // User has reached limit
      setShowPurchaseModal(true);
      return;
    }
    setPaused((p) => !p);
  }, [paused, canWatchVideo]);

  const handleNeedMore = () => {
    setShowPurchaseModal(true);
  };

  const videoStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));
  const playStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: controlsOffset.value }],
  }));
  const closeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: closeOffset.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <Animated.View style={[StyleSheet.absoluteFill, videoStyle]}>
        <Video
          ref={player}
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          onLoad={onLoad}
          paused={paused}
          muted={muted}
          playInBackground={false}
          ignoreSilentSwitch="obey"
          repeat
        />
      </Animated.View>

      {/* Status Badge */}
      <View style={styles.badgeWrap}>
        <Text style={styles.badgeText}>
          {remainingVideos} / {maxDailyLimit} plays left today{' '}
          {isPremium ? '(Premium)' : '(Free)'}
        </Text>
        {!isPremium && (
          <Pressable onPress={handleNeedMore} hitSlop={8}>
            <Text style={styles.badgeLink}>Need more?</Text>
          </Pressable>
        )}
      </View>

      {/* Close Button */}
      <Animated.View style={[styles.closeWrap, closeStyle]}>
        <Pressable
          onPress={onClose}
          style={styles.roundBtn}
          android_ripple={{
            color: 'rgba(255,255,255,0.25)',
            borderless: true,
          }}>
          <Icon name="close" size={36} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      {/* Play/Pause Button */}
      <Animated.View style={[styles.playWrap, playStyle]}>
        <Pressable
          onPress={handleTogglePlayback}
          style={styles.roundBtn}
          android_ripple={{
            color: 'rgba(255,255,255,0.25)',
            borderless: true,
          }}>
          <Icon name={paused ? 'play' : 'pause'} size={32} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      {/* Mute/Unmute Button */}
      <Animated.View style={[styles.muteWrap, playStyle]}>
        <Pressable
          onPress={() => setMuted((m) => !m)}
          style={styles.roundBtn}
          android_ripple={{
            color: 'rgba(255,255,255,0.25)',
            borderless: true,
          }}>
          <Icon
            name={muted ? 'volume-mute' : 'volume-high'}
            size={30}
            color="#FFFFFF"
          />
        </Pressable>
      </Animated.View>

      {/* Purchase Modal */}
      <PurchaseModal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </View>
  );
};

const BTN_BG = 'rgba(0,0,0,0.4)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeWrap: {
    position: 'absolute',
    top: 20 + (Platform.OS === 'ios' ? 20 : 0),
    right: 16,
  },
  playWrap: {
    position: 'absolute',
    bottom: 28,
    left: 16,
  },
  muteWrap: {
    position: 'absolute',
    bottom: 28,
    right: 16,
  },
  badgeWrap: {
    position: 'absolute',
    top: 20 + (Platform.OS === 'ios' ? 20 : 0),
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  badgeLink: {
    color: '#A5D6A7',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  roundBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VideoScreen;
