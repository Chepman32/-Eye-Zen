import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Sound from 'react-native-sound';
import {storageService} from '../services/storageService';

interface SettingsContextType {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  playSound: (soundType: 'click' | 'success' | 'error') => void;
  triggerHaptic: (type?: 'selection' | 'impactLight' | 'impactMedium' | 'impactHeavy') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

// Configure Sound library
Sound.setCategory('Playback');

export const SettingsProvider: React.FC<SettingsProviderProps> = ({children}) => {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSound = await storageService.getItem<boolean>('sound_enabled');
      const savedHaptics = await storageService.getItem<boolean>('haptics_enabled');

      if (savedSound !== null) {
        setSoundEnabledState(savedSound);
      }
      if (savedHaptics !== null) {
        setHapticsEnabledState(savedHaptics);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setSoundEnabled = async (enabled: boolean) => {
    try {
      setSoundEnabledState(enabled);
      await storageService.setItem('sound_enabled', enabled);
    } catch (error) {
      console.error('Error saving sound setting:', error);
    }
  };

  const setHapticsEnabled = async (enabled: boolean) => {
    try {
      setHapticsEnabledState(enabled);
      await storageService.setItem('haptics_enabled', enabled);
    } catch (error) {
      console.error('Error saving haptics setting:', error);
    }
  };

  const playSound = (soundType: 'click' | 'success' | 'error') => {
    if (!soundEnabled) return;

    // For now, we'll use system sounds
    // In production, you would include custom sound files
    try {
      // Using react-native-sound for custom sounds
      // You would need to add sound files to your project
      // Example: const sound = new Sound('click.mp3', Sound.MAIN_BUNDLE, (error) => {...});

      // For now, just trigger haptic as placeholder
      if (soundType === 'click') {
        triggerHaptic('selection');
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const triggerHaptic = (type: 'selection' | 'impactLight' | 'impactMedium' | 'impactHeavy' = 'selection') => {
    if (!hapticsEnabled) return;

    try {
      const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };

      ReactNativeHapticFeedback.trigger(type, options);
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        hapticsEnabled,
        setSoundEnabled,
        setHapticsEnabled,
        playSound,
        triggerHaptic,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
