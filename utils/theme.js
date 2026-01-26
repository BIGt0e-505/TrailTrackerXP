import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#757575',
    primary: '#2E7D32',
    primaryLight: '#E8F5E9',
    accent: '#1976D2',
    danger: '#D32F2F',
    border: '#E0E0E0',
    cardBg: '#FFFFFF',
    overlay: 'rgba(255,255,255,0.95)',
    icon: '#424242',
    iconActive: '#2E7D32',
    pauseButton: '#FF9800',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    xp: '#9C27B0',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceElevated: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    primary: '#4CAF50',
    primaryLight: '#1B3D1E',
    accent: '#64B5F6',
    danger: '#EF5350',
    border: '#3D3D3D',
    cardBg: '#1E1E1E',
    overlay: 'rgba(30,30,30,0.95)',
    icon: '#B0B0B0',
    iconActive: '#4CAF50',
    pauseButton: '#CC7A00',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    xp: '#CE93D8',
  },
};

const SETTINGS_KEY = '@trail_tracker_settings';

const defaultSettings = {
  appDarkMode: true,
  mapDarkMode: false,
  distanceUnit: 'miles',
  username: '',
};

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved !== null) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.log('Error loading settings:', e);
    }
    setIsLoaded(true);
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.log('Error saving settings:', e);
    }
  };

  const toggleAppDarkMode = async () => {
    const newSettings = { ...settings, appDarkMode: !settings.appDarkMode };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const toggleMapDarkMode = async () => {
    const newSettings = { ...settings, mapDarkMode: !settings.mapDarkMode };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const toggleDistanceUnit = async () => {
    const newUnit = settings.distanceUnit === 'miles' ? 'km' : 'miles';
    const newSettings = { ...settings, distanceUnit: newUnit };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const setDistanceUnit = async (unit) => {
    const newSettings = { ...settings, distanceUnit: unit };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const setUsername = async (name) => {
    const newSettings = { ...settings, username: name };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const theme = settings.appDarkMode ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ 
      isDark: settings.appDarkMode, 
      isMapDark: settings.mapDarkMode,
      distanceUnit: settings.distanceUnit,
      username: settings.username,
      toggleAppDarkMode,
      toggleMapDarkMode,
      toggleDistanceUnit,
      setDistanceUnit,
      setUsername,
      theme, 
      isLoaded 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
