/**
 * Shared typography constants.
 * Extracted from repeated inline StyleSheet values across all screens.
 * These mirror the existing font families and sizes — no visual change.
 *
 * Note: The font family names refer to @expo-google-fonts/inter weights
 * loaded in App.js. They must match the names used there.
 */

export const FONT = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// Common font sizes used across screens
export const FONT_SIZE = {
  xs: 10,
  small: 11,
  smallMeta: 12,
  body: 13,
  bodyLarge: 14,
  title: 15,
  header: 16,
  large: 17,
  xlarge: 18,
  xxlarge: 20,
  huge: 22,
  display: 32,
  displayLarge: 36,
};

// Reusable text style fragments (not full TextStyle objects,
// just the common combinations to spread into StyleSheet definitions)
export const TEXT_STYLES = {
  // Section titles: uppercase, bold, letter-spacing — used in StatsScreen, SettingsScreen
  sectionTitle: {
    fontSize: 11,
    fontFamily: FONT.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Small stat label: uppercase, small, letter-spacing
  statLabel: {
    fontSize: 10,
    fontFamily: FONT.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Medium stat label
  statLabelMedium: {
    fontSize: 11,
    fontFamily: FONT.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Modal title
  modalTitle: {
    fontSize: 22,
    fontFamily: FONT.bold,
    textAlign: 'center',
  },
  // Modal body text
  modalMessage: {
    fontSize: 15,
    fontFamily: FONT.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modal button text
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONT.bold,
  },
  // Card title
  cardTitle: {
    fontSize: 16,
    fontFamily: FONT.bold,
  },
  // Large stat value
  statValueLarge: {
    fontSize: 18,
    fontFamily: FONT.bold,
  },
  // Main display stat
  statValueDisplay: {
    fontSize: 36,
    fontFamily: FONT.bold,
  },
};