import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
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

const source = require('../../assets/video/video.mp4');

const VideoScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Video'>> = ({ navigation }) => {
  const player = useRef<React.ElementRef<typeof Video>>(null);
  const [paused, setPaused] = useState(false);

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

  useEffect(() => {
    // When entering, slide in controls
    controlsOffset.value = withDelay(100, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));
    closeOffset.value = withDelay(100, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));
  }, [closeOffset, controlsOffset]);

  const onLoad = (_data: OnLoadData) => {
    videoOpacity.value = withTiming(1, { duration: 350 });
  };

  const onClose = () => {
    // fade out and slide down
    videoOpacity.value = withTiming(0, { duration: 250 });
    controlsOffset.value = withTiming(40, { duration: 200 });
    closeOffset.value = withTiming(-40, { duration: 200 });
    // proactively return to portrait
    Orientation.lockToPortrait();
    setTimeout(() => {
      navigation.goBack();
      // ensure rotation after navigation completes
      setTimeout(() => Orientation.lockToPortrait(), 120);
    }, 220);
  };

  const videoStyle = useAnimatedStyle(() => ({ opacity: videoOpacity.value }));
  const playStyle = useAnimatedStyle(() => ({ transform: [{ translateY: controlsOffset.value }] }));
  const closeStyle = useAnimatedStyle(() => ({ transform: [{ translateY: closeOffset.value }] }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, videoStyle]}>        
        <Video
          ref={player}
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          onLoad={onLoad}
          paused={paused}
          playInBackground={false}
          ignoreSilentSwitch="obey"
          repeat
        />
      </Animated.View>

      {/* Close button */}
      <Animated.View style={[styles.closeWrap, closeStyle]}>
        <Pressable onPress={onClose} style={styles.roundBtn} android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}>
          <Icon name="ios-close" size={22} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      {/* Play/Pause button */}
      <Animated.View style={[styles.playWrap, playStyle]}>
        <Pressable
          onPress={() => setPaused(p => !p)}
          style={styles.roundBtn}
          android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}
        >
          <Animated.View style={{ transform: [{ rotate: paused ? '0deg' : '180deg' }] }}>
            <Icon name={paused ? 'ios-play' : 'ios-pause'} size={22} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const BTN_BG = 'rgba(0,0,0,0.4)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  closeWrap: { position: 'absolute', top: 20 + (Platform.OS === 'ios' ? 20 : 0), right: 16 },
  playWrap: { position: 'absolute', bottom: 28, left: 16 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VideoScreen;
