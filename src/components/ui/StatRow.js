/**
 * StatRow — a row of label/value stat items.
 *
 * Extracted from the repeated stat row pattern in:
 *   - StatsScreen (main stats, recent activities)
 *   - ActivityDetailScreen (stats card)
 *   - TrackingScreen (live stats display)
 *   - CalendarScreen (activity stats)
 *
 * Each item: { label, value }
 * Renders as a flex row with equal-width columns.
 *
 * Behaviour-preserving: same font sizes, colours, layout as existing inline versions.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT } from '../../theme/typography';

export function StatItem({ theme, label, value, size = 'medium' }) {
  const valueSize = size === 'large' ? 18 : size === 'display' ? 36 : 17;
  const labelSize = size === 'large' ? 11 : 10;

  return (
    <View style={styles.item}>
      <Text
        style={{
          fontSize: valueSize,
          fontFamily: FONT.bold,
          color: theme.text,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: labelSize,
          fontFamily: FONT.regular,
          color: theme.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function StatRow({ theme, items, size = 'medium' }) {
  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <StatItem key={i} theme={theme} label={item.label} value={item.value} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
});