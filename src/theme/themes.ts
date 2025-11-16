export type Theme = {
  name: 'light' | 'dark' | 'solar' | 'mono';
  colors: {
    // Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;

    // Surface colors
    surface: string;
    surfaceSecondary: string;

    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;

    // Border colors
    border: string;
    borderLight: string;

    // Status colors
    success: string;
    error: string;
    warning: string;
    info: string;

    // Gradient colors
    gradientStart: string;
    gradientEnd: string;

    // Button colors
    buttonPrimary: string;
    buttonSecondary: string;
    buttonDisabled: string;
    buttonText: string;

    // Overlay colors
    overlay: string;
    overlayDark: string;

    // Card colors
    card: string;
    cardBorder: string;

    // StatusBar style
    statusBarStyle: 'light-content' | 'dark-content';
  };
};

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#E0E0E0',

    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F5',

    // Primary colors
    primary: '#4CAF50',
    primaryLight: '#81C784',
    primaryDark: '#2E7D32',

    // Text colors
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',

    // Border colors
    border: '#E0E0E0',
    borderLight: '#F0F0F0',

    // Status colors
    success: '#4CAF50',
    error: '#FF5252',
    warning: '#FFA726',
    info: '#29B6F6',

    // Gradient colors
    gradientStart: '#4CAF50',
    gradientEnd: '#81C784',

    // Button colors
    buttonPrimary: '#5B4FB4',
    buttonSecondary: '#E0E0E0',
    buttonDisabled: '#CCCCCC',
    buttonText: '#FFFFFF',

    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',

    // Card colors
    card: '#FFFFFF',
    cardBorder: '#E0E0E0',

    // StatusBar style
    statusBarStyle: 'dark-content',
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Background colors
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2C2C2C',

    // Surface colors
    surface: '#1E1E1E',
    surfaceSecondary: '#2C2C2C',

    // Primary colors
    primary: '#66BB6A',
    primaryLight: '#81C784',
    primaryDark: '#4CAF50',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    textInverse: '#121212',

    // Border colors
    border: '#3A3A3A',
    borderLight: '#2C2C2C',

    // Status colors
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#29B6F6',

    // Gradient colors
    gradientStart: '#4CAF50',
    gradientEnd: '#66BB6A',

    // Button colors
    buttonPrimary: '#7E57C2',
    buttonSecondary: '#3A3A3A',
    buttonDisabled: '#404040',
    buttonText: '#FFFFFF',

    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayDark: 'rgba(0, 0, 0, 0.8)',

    // Card colors
    card: '#1E1E1E',
    cardBorder: '#3A3A3A',

    // StatusBar style
    statusBarStyle: 'light-content',
  },
};

export const solarTheme: Theme = {
  name: 'solar',
  colors: {
    // Background colors
    background: '#FFF9E6',
    backgroundSecondary: '#FFF4D1',
    backgroundTertiary: '#FFEEB8',

    // Surface colors
    surface: '#FFFDF7',
    surfaceSecondary: '#FFF9E6',

    // Primary colors
    primary: '#F9A825',
    primaryLight: '#FDD835',
    primaryDark: '#F57F17',

    // Text colors
    text: '#5D4E37',
    textSecondary: '#8B7355',
    textTertiary: '#A68A64',
    textInverse: '#FFFDF7',

    // Border colors
    border: '#FFE4A3',
    borderLight: '#FFEEB8',

    // Status colors
    success: '#FDD835',
    error: '#FF6F00',
    warning: '#FF8F00',
    info: '#FFA726',

    // Gradient colors
    gradientStart: '#FFD54F',
    gradientEnd: '#FFF9E6',

    // Button colors
    buttonPrimary: '#F9A825',
    buttonSecondary: '#FFEEB8',
    buttonDisabled: '#FFE4C4',
    buttonText: '#5D4E37',

    // Overlay colors
    overlay: 'rgba(93, 78, 55, 0.3)',
    overlayDark: 'rgba(93, 78, 55, 0.5)',

    // Card colors
    card: '#FFFDF7',
    cardBorder: '#FFE4A3',

    // StatusBar style
    statusBarStyle: 'dark-content',
  },
};

export const monoTheme: Theme = {
  name: 'mono',
  colors: {
    // Background colors
    background: '#F0F0F0',
    backgroundSecondary: '#E0E0E0',
    backgroundTertiary: '#D0D0D0',

    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F5',

    // Primary colors
    primary: '#757575',
    primaryLight: '#9E9E9E',
    primaryDark: '#424242',

    // Text colors
    text: '#212121',
    textSecondary: '#616161',
    textTertiary: '#9E9E9E',
    textInverse: '#FFFFFF',

    // Border colors
    border: '#BDBDBD',
    borderLight: '#E0E0E0',

    // Status colors
    success: '#757575',
    error: '#616161',
    warning: '#9E9E9E',
    info: '#757575',

    // Gradient colors
    gradientStart: '#757575',
    gradientEnd: '#9E9E9E',

    // Button colors
    buttonPrimary: '#616161',
    buttonSecondary: '#E0E0E0',
    buttonDisabled: '#BDBDBD',
    buttonText: '#FFFFFF',

    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayDark: 'rgba(0, 0, 0, 0.6)',

    // Card colors
    card: '#FFFFFF',
    cardBorder: '#BDBDBD',

    // StatusBar style
    statusBarStyle: 'dark-content',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  solar: solarTheme,
  mono: monoTheme,
};

export type ThemeName = keyof typeof themes;
