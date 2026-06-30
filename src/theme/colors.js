/**
 * Canonical colour tokens for TrailTrackerXP.
 * TubePulse/ZeroVPN-style dark-only palette.
 *
 * This is the single source of truth for colours. The theme in
 * utils/theme.js references these tokens.
 *
 * Green is semantic only: GPS active, tracking active, success.
 */

export const COLORS = {
  // Backgrounds
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',

  // Text
  text: '#E0E0E0',
  textDim: '#666666',
  textSecondary: '#888888',  // slightly lighter than TubePulse's textDim for readability

  // Accent (blue/cyan — app family identity)
  accent: '#4FC3F7',
  accentGlow: 'rgba(79, 195, 247, 0.3)',
  accentDim: 'rgba(79, 195, 247, 0.08)',

  // Borders
  border: '#2A2A2A',
  borderLight: '#333333',

  // Semantic
  danger: '#EF5350',
  warning: '#FF9800',
  success: '#4CAF50',       // green = GPS/tracking/success only

  // Gamification
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  xp: '#CE93D8',

  // Legacy aliases (kept for compatibility with existing screens)
  primary: '#4FC3F7',       // maps to accent
  primaryLight: 'rgba(79, 195, 247, 0.08)',  // maps to accentDim
  icon: '#888888',           // maps to textSecondary-ish
  iconActive: '#4FC3F7',    // maps to accent
  cardBg: '#1A1A1A',        // maps to surface
  overlay: 'rgba(13, 13, 13, 0.95)',
  pauseButton: '#FF9800',   // maps to warning
};

// Splash/icon background (slightly navy for icon contrast)
export const SPLASH_BG = '#0D1117';