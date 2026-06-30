/**
 * AppScreen — standard screen container with SafeAreaView + ScrollView.
 *
 * Extracted from the repeated screen wrapper pattern in:
 *   - SettingsScreen (ScrollView)
 *   - StatsScreen (ScrollView)
 *   - CalendarScreen (View with flex:1)
 *   - ActivityDetailScreen (ScrollView)
 *
 * Most screens use a simple flex:1 container with theme.background.
 * Some use ScrollView. This component covers both cases.
 *
 * Behaviour-preserving: same background colour, no extra padding
 * (screens manage their own padding).
 */
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

export default function AppScreen({ theme, children, scroll = false, style }) {
  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }, style]}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.background }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});