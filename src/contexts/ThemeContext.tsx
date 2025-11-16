import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {StatusBar} from 'react-native';
import {Theme, themes, ThemeName} from '../theme/themes';
import {storageService} from '../services/storageService';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [theme, setThemeState] = useState<Theme>(themes.light);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await storageService.getItem<ThemeName>('theme_preference');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'solar' || savedTheme === 'mono')) {
        setThemeName(savedTheme);
        setThemeState(themes[savedTheme]);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setTheme = async (newThemeName: ThemeName) => {
    try {
      setThemeName(newThemeName);
      setThemeState(themes[newThemeName]);
      await storageService.setItem('theme_preference', newThemeName);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{theme, themeName, setTheme}}>
      <StatusBar barStyle={theme.colors.statusBarStyle} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
