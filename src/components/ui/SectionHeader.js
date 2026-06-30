/**
 * SectionHeader — uppercase section title with letter spacing.
 *
 * Extracted from the repeated section title pattern in:
 *   - StatsScreen (section titles)
 *   - SettingsScreen (section headers)
 *
 * Behaviour-preserving: same fontSize (11), fontFamily (bold),
 * letterSpacing (1), textTransform (uppercase) as existing inline styles.
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { FONT } from '../../theme/typography';
import { SECTION_TITLE_MARGIN } from '../../theme/spacing';

export default function SectionHeader({ theme, children, marginTop = 0 }) {
  return (
    <Text
      style={[
        styles.title,
        {
          color: theme.textSecondary,
          marginBottom: SECTION_TITLE_MARGIN,
          marginTop,
        },
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 11,
    fontFamily: FONT.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});