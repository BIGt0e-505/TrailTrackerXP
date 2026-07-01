import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../src/theme/colors';

const ThemeContext = createContext();

/**
 * TrailTrackerXP theme -- TubePulse/ZeroVPN-style dark-only palette.
 *
 * Green is semantic only: GPS active, tracking active, success states.
 * Blue/cyan (#4FC3F7) is the app accent / family identity.
 *
 * The `light` object is kept for backward compatibility (some screens
 * may still reference `colors.light`) but now points to the same dark
 * palette. The app is dark-only; `userInterfaceStyle: "dark"` in app.json.
 */
export const colors = {
  dark: {
    background: COLORS.bg,
    surface: COLORS.surface,
    surfaceElevated: COLORS.surfaceElevated,
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    accent: COLORS.accent,
    danger: COLORS.danger,
    border: COLORS.border,
    cardBg: COLORS.cardBg,
    overlay: COLORS.overlay,
    icon: COLORS.icon,
    iconActive: COLORS.iconActive,
    pauseButton: COLORS.pauseButton,
    gold: COLORS.gold,
    silver: COLORS.silver,
    bronze: COLORS.bronze,
    xp: COLORS.xp,
  },
  // Dark-only: light theme mirrors dark to avoid breakage
  // if any code still references colors.light.
  light: {
    background: COLORS.bg,
    surface: COLORS.surface,
    surfaceElevated: COLORS.surfaceElevated,
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    accent: COLORS.accent,
    danger: COLORS.danger,
    border: COLORS.border,
    cardBg: COLORS.cardBg,
    overlay: COLORS.overlay,
    icon: COLORS.icon,
    iconActive: COLORS.iconActive,
    pauseButton: COLORS.pauseButton,
    gold: COLORS.gold,
    silver: COLORS.silver,
    bronze: COLORS.bronze,
    xp: COLORS.xp,
  },
};

const SETTINGS_KEY = '@trail_tracker_settings';

const defaultSettings = {
  appDarkMode: true,  // Always true -- dark-only app
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
        const parsed = JSON.parse(saved);
        // Force dark mode on regardless of saved setting
        parsed.appDarkMode = true;
        setSettings({ ...defaultSettings, ...parsed });
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
    // Dark-only: this toggle is a no-op now but kept for SettingsScreen compatibility
    const newSettings = { ...settings, appDarkMode: true };
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

  // Always use dark theme
  const theme = colors.dark;

  return (
    <ThemeContext.Provider value={{
      isDark: true,  // Always true -- dark-only
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