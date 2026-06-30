/**
 * EmptyState — centered "nothing here" placeholder.
 *
 * Extracted from the repeated empty state pattern in:
 *   - StatsScreen (no activities)
 *   - CalendarScreen (no activities on selected day)
 *
 * Behaviour-preserving: same layout, colours, font as existing inline versions.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT } from '../../theme/typography';
import { SCREEN_PADDING } from '../../theme/spacing';

export default function EmptyState({ theme, message, icon, padding = 48 }) {
  return (
    <View style={[styles.container, { padding }]}>
      {icon}
      <Text
        style={{
          fontSize: 15,
          fontFamily: FONT.regular,
          color: theme.textSecondary,
          textAlign: 'center',
          marginTop: icon ? 16 : 0,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});