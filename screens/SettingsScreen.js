import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../utils/theme';
import { clearCachedTiles, getActivities } from '../utils/storage';
import { MoonIcon, SunIcon, MapIcon, ExportIcon } from '../components/Icons';

// Icons for modals
const TrashIcon = ({ size = 24, color = '#D32F2F' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CheckIcon = ({ size = 24, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M8 12l3 3 5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InfoIcon = ({ size = 24, color = '#2196F3' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default function SettingsScreen() {
  const { 
    theme, 
    isDark, 
    isMapDark, 
    distanceUnit,
    toggleAppDarkMode, 
    toggleMapDarkMode,
    toggleDistanceUnit 
  } = useTheme();

  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activityCount, setActivityCount] = useState(0);

  const handleClearCache = () => {
    setShowClearCacheModal(true);
  };

  const confirmClearCache = async () => {
    await clearCachedTiles();
    setShowClearCacheModal(false);
    setShowSuccessModal(true);
  };

  const handleExportData = async () => {
    const activities = await getActivities();
    setActivityCount(activities.length);
    setShowExportModal(true);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          APPEARANCE
        </Text>
        
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={toggleAppDarkMode}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              {isDark ? (
                <MoonIcon size={22} color={theme.icon} />
              ) : (
                <SunIcon size={22} color={theme.icon} />
              )}
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  App Dark Mode
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleAppDarkMode}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={toggleMapDarkMode}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <MapIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Map Dark Mode
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  {isMapDark ? 'Dark map tiles enabled' : 'Standard map tiles'}
                </Text>
              </View>
            </View>
            <Switch
              value={isMapDark}
              onValueChange={toggleMapDarkMode}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Units Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          UNITS
        </Text>
        
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Distance Unit
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  {distanceUnit === 'miles' ? 'Miles, metres, mph' : 'Kilometers, metres, km/h'}
                </Text>
              </View>
            </View>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  { borderColor: theme.border },
                  distanceUnit === 'miles' && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => distanceUnit !== 'miles' && toggleDistanceUnit()}
              >
                <Text style={[
                  styles.unitButtonText,
                  { color: theme.text },
                  distanceUnit === 'miles' && { color: '#fff' }
                ]}>
                  Miles
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  { borderColor: theme.border },
                  distanceUnit === 'km' && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => distanceUnit !== 'km' && toggleDistanceUnit()}
              >
                <Text style={[
                  styles.unitButtonText,
                  { color: theme.text },
                  distanceUnit === 'km' && { color: '#fff' }
                ]}>
                  Km
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          DATA
        </Text>
        
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <MapIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Clear Map Cache
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Remove cached map tiles
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <ExportIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Export Activities
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Export your activity data (coming soon)
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ABOUT
        </Text>
        
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: theme.text }]}>1.0.0</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>Map Data</Text>
            <Text style={[styles.aboutValue, { color: theme.text }]}>OpenStreetMap</Text>
          </View>
        </View>
      </View>

      {/* Info Card */}
      <View style={[styles.infoCard, { backgroundColor: theme.primaryLight }]}>
        <Text style={[styles.infoText, { color: theme.primary }]}>
          TrailTracker stores all your data locally on your device. No account required, no data shared. Background tracking continues even when your screen is off.
        </Text>
      </View>

      <View style={{ height: 50 }} />

      {/* Clear Cache Confirmation Modal */}
      <Modal
        visible={showClearCacheModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClearCacheModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <TrashIcon size={56} color={theme.danger} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Clear Map Cache?
            </Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              You will need an internet connection to view maps until they are cached again.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.danger }]}
              onPress={confirmClearCache}
            >
              <Text style={styles.modalButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: theme.surface }]}
              onPress={() => setShowClearCacheModal(false)}
            >
              <Text style={[styles.modalCancelButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <CheckIcon size={56} color={theme.primary} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Cache Cleared
            </Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Map cache has been cleared.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Export Info Modal */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <InfoIcon size={56} color="#2196F3" />
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Export Data
            </Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              You have {activityCount} activities.{'\n'}Export functionality coming soon.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 14,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  unitButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  aboutLabel: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  aboutValue: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  modalCancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
