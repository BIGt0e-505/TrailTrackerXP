/**
 * Card — rounded container with background colour and optional padding.
 *
 * Extracted from the repeated card pattern across all screens:
 *   - StatsScreen (challengesCard, achievementsCard, graphCard, etc.)
 *   - ActivityDetailScreen (statsCard)
 *   - CalendarScreen (activityCard)
 *   - SettingsScreen (storageInfoCard, etc.)
 *
 * Behaviour-preserving: same radius (12), padding (16), background (theme.surface
 * or theme.cardBg). Screens can override via style prop.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CARD_RADIUS, CARD_PADDING } from '../../theme/spacing';

export default function Card({ theme, children, style, padding = CARD_PADDING, radius = CARD_RADIUS, marginHorizontal, marginTop, marginBottom }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg || theme.surface,
          borderRadius: radius,
          padding,
          marginHorizontal,
          marginTop,
          marginBottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
});