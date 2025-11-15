import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `ScreenSecurity native module is not linked. Make sure the native module files ` +
  `are added to both iOS and Android projects.`;

type NativeScreenSecurity = {
  enable: () => void;
  disable: () => void;
};

const ScreenSecurity: NativeScreenSecurity | undefined =
  (NativeModules as { ScreenSecurity?: NativeScreenSecurity }).ScreenSecurity;

const ensureModule = (): NativeScreenSecurity | undefined => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return ScreenSecurity;
  }
  return undefined;
};

export const enableScreenSecurity = () => {
  const mod = ensureModule();
  if (!mod) {
    if (__DEV__) {
      console.warn(LINKING_ERROR);
    }
    return;
  }
  mod.enable();
};

export const disableScreenSecurity = () => {
  const mod = ensureModule();
  if (!mod) {
    return;
  }
  mod.disable();
};
