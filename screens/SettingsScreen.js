import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../utils/theme';
import { 
  clearCachedTiles, 
  getActivities, 
  exportCacheToFileStorage,
  recoverFromFileStorage,
  getStorageStats,
  verifyDataIntegrity,
  createFullExport,
  initFileStorage,
} from '../utils/storage';
import { loadGamification } from '../utils/gamification';
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

const DatabaseIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4z" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M2 6c0 2.21 4.48 4 10 4s10-1.79 10-4M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4" stroke={color} strokeWidth="2" />
  </Svg>
);

const SyncIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 4v6h-6M1 20v-6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DownloadIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WarningIcon = ({ size = 24, color = '#FF9800' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L1 21h22L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [activityCount, setActivityCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationResult, setOperationResult] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [integrityInfo, setIntegrityInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load storage stats on mount
  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    await initFileStorage();
    const stats = await getStorageStats();
    const cacheActivities = await getActivities();
    const integrity = await verifyDataIntegrity(cacheActivities);
    setStorageStats(stats);
    setIntegrityInfo(integrity);
  };

  const handleClearCache = () => {
    setShowClearCacheModal(true);
  };

  const confirmClearCache = async () => {
    await clearCachedTiles();
    setShowClearCacheModal(false);
    setSuccessMessage('Map cache has been cleared.');
    setShowSuccessModal(true);
  };

  const handleExportData = async () => {
    const activities = await getActivities();
    setActivityCount(activities.length);
    await loadStorageInfo();
    setShowExportModal(true);
  };

  const handleMigrateToFile = async () => {
    setShowMigrateModal(true);
    setIsProcessing(true);
    setOperationResult(null);
    
    try {
      const activities = await getActivities();
      const gamification = await loadGamification();
      const result = await exportCacheToFileStorage(activities, gamification);
      setOperationResult(result);
      await loadStorageInfo();
    } catch (error) {
      setOperationResult({ success: false, error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecoverFromFile = async () => {
    setShowRecoverModal(true);
  };

  const confirmRecover = async () => {
    setIsProcessing(true);
    setOperationResult(null);
    
    try {
      const result = await recoverFromFileStorage();
      
      if (result.success && result.activities.length > 0) {
        // Save recovered activities to AsyncStorage
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('@trail_tracker_activities', JSON.stringify(result.activities));
        
        setOperationResult(result);
        await loadStorageInfo();
      } else {
        setOperationResult({ 
          success: false, 
          error: result.error || 'No activities found in file storage' 
        });
      }
    } catch (error) {
      setOperationResult({ success: false, error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateBackup = async () => {
    setShowBackupModal(true);
    setIsProcessing(true);
    setOperationResult(null);
    
    try {
      // First ensure all current data is in file storage
      const activities = await getActivities();
      const gamification = await loadGamification();
      await exportCacheToFileStorage(activities, gamification);
      
      // Then create the export file
      const result = await createFullExport();
      
      if (result.success) {
        // Try to share the file
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(result.filePath, {
            mimeType: 'application/json',
            dialogTitle: 'Share TrailTrackerXP Backup',
          });
        }
        setOperationResult(result);
      } else {
        setOperationResult(result);
      }
    } catch (error) {
      setOperationResult({ success: false, error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
          DATA STORAGE
        </Text>
        
        {/* Storage Info Card */}
        {storageStats && (
          <View style={[styles.storageInfoCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.storageInfoRow}>
              <Text style={[styles.storageLabel, { color: theme.textSecondary }]}>
                File Storage
              </Text>
              <Text style={[styles.storageValue, { color: theme.text }]}>
                {storageStats.activityCount} activities ({formatBytes(storageStats.totalSizeBytes)})
              </Text>
            </View>
            {integrityInfo && integrityInfo.inCacheOnly > 0 && (
              <View style={[styles.syncWarning, { backgroundColor: theme.warningLight || '#FFF3E0' }]}>
                <WarningIcon size={16} color="#FF9800" />
                <Text style={[styles.syncWarningText, { color: '#E65100' }]}>
                  {integrityInfo.inCacheOnly} activities in cache not yet saved to file storage
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleMigrateToFile}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <DatabaseIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Save to File Storage
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Export cache data to persistent file storage
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleRecoverFromFile}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <SyncIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Recover from File Storage
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Restore activities if cache was corrupted
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleCreateBackup}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <DownloadIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Create Backup File
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Export all data to shareable JSON file
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cache Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          CACHE
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
                  View Storage Status
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Check data integrity between cache and file storage
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
            <Text style={[styles.aboutValue, { color: theme.text }]}>0.3.0</Text>
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
          TrailTracker now saves your data to both cache (fast access) and file storage (persistent backup). Use "Save to File Storage" after updating the app to protect your data. File storage persists across app updates.
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
              Success
            </Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              {successMessage || 'Operation completed successfully.'}
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

      {/* Storage Status Modal */}
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
              Storage Status
            </Text>
            <View style={styles.modalStats}>
              <Text style={[styles.modalStatRow, { color: theme.textSecondary }]}>
                Cache: {activityCount} activities
              </Text>
              <Text style={[styles.modalStatRow, { color: theme.textSecondary }]}>
                File Storage: {storageStats?.activityCount || 0} activities
              </Text>
              {integrityInfo && (
                <>
                  <Text style={[styles.modalStatRow, { color: theme.textSecondary }]}>
                    Synchronized: {integrityInfo.synchronized || 0}
                  </Text>
                  {integrityInfo.inCacheOnly > 0 && (
                    <Text style={[styles.modalStatRow, { color: '#FF9800' }]}>
                      ⚠️ {integrityInfo.inCacheOnly} only in cache
                    </Text>
                  )}
                  {integrityInfo.inFileOnly > 0 && (
                    <Text style={[styles.modalStatRow, { color: '#4CAF50' }]}>
                      ✓ {integrityInfo.inFileOnly} only in file storage
                    </Text>
                  )}
                </>
              )}
            </View>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Migrate to File Modal */}
      <Modal
        visible={showMigrateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isProcessing && setShowMigrateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            {isProcessing ? (
              <>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Saving to File Storage...
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  Please wait while your data is being saved.
                </Text>
              </>
            ) : operationResult ? (
              <>
                {operationResult.success ? (
                  <CheckIcon size={56} color="#4CAF50" />
                ) : (
                  <WarningIcon size={56} color="#FF9800" />
                )}
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {operationResult.success ? 'Data Saved!' : 'Error'}
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  {operationResult.success 
                    ? `Saved ${operationResult.exportedCount} activities.\n${operationResult.skippedCount} already existed.\nTotal in file storage: ${operationResult.totalInFile}`
                    : operationResult.error
                  }
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowMigrateModal(false)}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Recover Modal */}
      <Modal
        visible={showRecoverModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isProcessing && setShowRecoverModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            {!isProcessing && !operationResult ? (
              <>
                <SyncIcon size={56} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Recover Activities?
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  This will restore {storageStats?.activityCount || 0} activities from file storage to your cache. Use this if your cache data was lost or corrupted.
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={confirmRecover}
                >
                  <Text style={styles.modalButtonText}>Recover</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { backgroundColor: theme.surface }]}
                  onPress={() => setShowRecoverModal(false)}
                >
                  <Text style={[styles.modalCancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : isProcessing ? (
              <>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Recovering...
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  Restoring activities from file storage.
                </Text>
              </>
            ) : operationResult ? (
              <>
                {operationResult.success ? (
                  <CheckIcon size={56} color="#4CAF50" />
                ) : (
                  <WarningIcon size={56} color="#FF9800" />
                )}
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {operationResult.success ? 'Recovery Complete!' : 'Error'}
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  {operationResult.success 
                    ? `Recovered ${operationResult.count} activities.`
                    : operationResult.error
                  }
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setShowRecoverModal(false);
                    setOperationResult(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Backup Modal */}
      <Modal
        visible={showBackupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isProcessing && setShowBackupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            {isProcessing ? (
              <>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Creating Backup...
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  Preparing your data for export.
                </Text>
              </>
            ) : operationResult ? (
              <>
                {operationResult.success ? (
                  <CheckIcon size={56} color="#4CAF50" />
                ) : (
                  <WarningIcon size={56} color="#FF9800" />
                )}
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {operationResult.success ? 'Backup Created!' : 'Error'}
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  {operationResult.success 
                    ? `Exported ${operationResult.activityCount} activities.\nFormat: Strava-compatible JSON`
                    : operationResult.error
                  }
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setShowBackupModal(false);
                    setOperationResult(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : null}
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
  // Storage info styles
  storageInfoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  storageInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  storageValue: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  syncWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  syncWarningText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  modalStats: {
    width: '100%',
    marginBottom: 20,
  },
  modalStatRow: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginVertical: 4,
  },
});
