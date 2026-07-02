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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../utils/theme';
import appJson from '../app.json';
import {
  clearCachedTiles,
  getActivities,
  exportCacheToFileStorage,
  recoverFromFileStorage,
  getStorageStats,
  verifyDataIntegrity,
  exportGPXFiles,
  getAllGPXFilePaths,
  initFileStorage,
} from '../utils/storage';
import {
  loadGamification,
  recalculateGamification,
  getStatsCutoffDate,
  setStatsCutoffDate,
} from '../utils/gamification';
import {
  pickGPXFiles,
  pickActivitiesCSV,
  parseActivitiesCSV,
  importSelectedFiles,
  scanGPXFolderForDuplicates,
  deleteDuplicateGPXFiles,
} from '../utils/stravaImport';
import { MapIcon, ExportIcon, TrashIcon, CheckIcon, InfoIcon, SyncIcon, DownloadIcon, UploadIcon, WarningIcon } from '../components/Icons';

// DatabaseIcon - SettingsScreen-specific (not duplicated elsewhere)
const DatabaseIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4z" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M2 6c0 2.21 4.48 4 10 4s10-1.79 10-4M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4" stroke={color} strokeWidth="2" />
  </Svg>
);

export default function SettingsScreen() {
  const {
    theme,
    isMapDark,
    distanceUnit,
    toggleMapDarkMode,
    toggleDistanceUnit
  } = useTheme();

  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' });
  const [activityCount, setActivityCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationResult, setOperationResult] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [integrityInfo, setIntegrityInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedGPXFiles, setSelectedGPXFiles] = useState([]);
  const [csvMetadata, setCsvMetadata] = useState(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, file: '' });
  const [showFolderCleanupModal, setShowFolderCleanupModal] = useState(false);
  const [folderScanResult, setFolderScanResult] = useState(null);
  const [folderCleanupProgress, setFolderCleanupProgress] = useState({ current: 0, total: 0, file: '' });
  const [cleanupPhase, setCleanupPhase] = useState('idle');

  // Stats cutoff date
  const [statsCutoffDate, setStatsCutoffDateState] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load storage stats on mount
  useEffect(() => {
    loadStorageInfo();
    loadCutoffDate();
  }, []);

  const loadCutoffDate = async () => {
    const cutoff = await getStatsCutoffDate();
    setStatsCutoffDateState(cutoff);
  };

  const handleCutoffDateChange = async (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Set to start of day
      const dateStart = new Date(selectedDate);
      dateStart.setHours(0, 0, 0, 0);
      setStatsCutoffDateState(dateStart);
      await setStatsCutoffDate(dateStart);

      // Recalculate gamification with new cutoff
      const activities = await getActivities();
      await recalculateGamification(activities, dateStart);

      setInfoModalContent({
        title: 'Cutoff Date Updated',
        message: `Stats and achievements will now only count activities from ${dateStart.toLocaleDateString()} onwards.`
      });
      setShowInfoModal(true);
    }
  };

  const clearCutoffDate = async () => {
    setStatsCutoffDateState(null);
    await setStatsCutoffDate(null);

    // Recalculate gamification without cutoff
    const activities = await getActivities();
    await recalculateGamification(activities, null);

    setInfoModalContent({
      title: 'Cutoff Date Cleared',
      message: 'All activities will now count towards stats and achievements.'
    });
    setShowInfoModal(true);
  };

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
        // Save recovered activities to AsyncStorage  strip route data to prevent size limit corruption
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const stripped = result.activities.map(({ route, routeData, ...metadata }) => metadata);
        await AsyncStorage.setItem('@trail_tracker_activities', JSON.stringify(stripped));

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

  const handleExportGPX = async () => {
    setShowBackupModal(true);
    setIsProcessing(false);
    setOperationResult(null);
  };

  const confirmExportGPX = async () => {
    setIsProcessing(true);
    setOperationResult(null);

    try {
      // First ensure all current data is in file storage as GPX
      const activities = await getActivities();
      const gamification = await loadGamification();
      await exportCacheToFileStorage(activities, gamification);

      // Get all GPX file paths
      const gpxPaths = await getAllGPXFilePaths();

      if (gpxPaths.length === 0) {
        setOperationResult({
          success: false,
          error: 'No GPX files to export. Activities without GPS data cannot be exported.'
        });
        return;
      }

      // Request directory access permission using Storage Access Framework
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        setOperationResult({
          success: false,
          error: 'Permission denied. Please select a folder to save GPX files.'
        });
        return;
      }

      const destinationUri = permissions.directoryUri;

      // Save this directory URI so future activities auto-export here
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('@trail_tracker_auto_export_dir', destinationUri);

      // --- Export idempotency: enumerate existing GPX-like files in target folder ---
      // Android SAF silently creates "activity.gpx (1)" if you createFileAsync with an existing name.
      // We must check for existing files BEFORE creating.
      const { normaliseDuplicateFilename, signatureFromGPXContent, isDuplicate, simpleHash } = require('../utils/gpxIdentity');

      const existingEntries = await FileSystem.StorageAccessFramework.readDirectoryAsync(destinationUri);
      const existingNormalised = new Set();  // normalised filenames already in folder
      const existingExactNames = new Set();   // exact lowercased filenames
      const existingSignatures = [];         // GPX signatures of existing files

      // Same GPX-like pattern as the folder cleanup scanner
      const gpxLikePattern = /\.gpx(\s*\(\d+\)|\s*-\s*copy|\s+copy|\s*-\s*duplicate|\s+duplicate|\s*_copy|\s*_duplicate)\s*$/i;

      for (const fileUri of existingEntries) {
        let decoded = fileUri;
        try { decoded = decodeURIComponent(fileUri); } catch (e) {}
        let fileName = decoded.split('/').pop();
        if (fileName.includes(':')) fileName = fileName.split(':').pop();

        const lowerName = fileName.toLowerCase();
        if (lowerName.endsWith('.gpx') || gpxLikePattern.test(lowerName)) {
          existingNormalised.add(normaliseDuplicateFilename(fileName));
          existingExactNames.add(lowerName);
          // Try to read content for signature-based dedup
          try {
            const content = await FileSystem.StorageAccessFramework.readAsStringAsync(fileUri);
            const sig = signatureFromGPXContent(content);
            if (sig) existingSignatures.push(sig);
          } catch (e) {
            // Can't read — skip signature check for this file
          }
        }
      }

      console.log(`[export] Found ${existingNormalised.size} normalised GPX names, ${existingSignatures.length} signatures in target folder`);

      let exportedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      for (const gpxPath of gpxPaths) {
        try {
          // Extract filename from internal path
          const fileName = gpxPath.split('/').pop();
          const normalisedName = normaliseDuplicateFilename(fileName);

          // Read internal GPX content
          const content = await FileSystem.readAsStringAsync(gpxPath);
          const sig = signatureFromGPXContent(content);

          // Check 1: exact filename already exists
          if (existingExactNames.has(fileName.toLowerCase())) {
            console.log(`[export] Skip (exact name exists): ${fileName}`);
            skippedCount++;
            continue;
          }

          // Check 2: normalised filename already exists (e.g. "activity.gpx (1)" exists)
          if (existingNormalised.has(normalisedName)) {
            console.log(`[export] Skip (normalised name exists): ${fileName} → ${normalisedName}`);
            skippedCount++;
            continue;
          }

          // Check 3: route signature matches an existing file
          if (sig && existingSignatures.some(es => isDuplicate(sig, es))) {
            console.log(`[export] Skip (signature match): ${fileName}`);
            skippedCount++;
            continue;
          }

          // No existing file found — safe to create
          const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            destinationUri,
            fileName,
            'application/gpx+xml'
          );

          await FileSystem.writeAsStringAsync(newFileUri, content);

          exportedCount++;
          // Update index so subsequent files in the same batch don't create dupes
          existingNormalised.add(normalisedName);
          existingExactNames.add(fileName.toLowerCase());
          if (sig) existingSignatures.push(sig);
        } catch (err) {
          console.error(`Error exporting ${gpxPath}:`, err);
          failedCount++;
        }
      }

      setOperationResult({
        success: exportedCount > 0 || skippedCount > 0,
        count: exportedCount,
        skipped: skippedCount,
        failed: failedCount,
        total: gpxPaths.length,
      });
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

  const handleStravaImport = async () => {
    setShowImportModal(true);
    setOperationResult(null);
    setIsProcessing(false);
    setSelectedGPXFiles([]);
    setCsvMetadata(null);
  };

  const handleFolderCleanup = () => {
    setShowFolderCleanupModal(true);
    setFolderScanResult(null);
    setFolderCleanupProgress({ current: 0, total: 0, file: '' });
    setCleanupPhase('idle');
    setOperationResult(null);
  };

  const startFolderScan = async () => {
    setCleanupPhase('scanning');
    setFolderScanResult(null);

    try {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        setOperationResult({ success: false, error: 'Permission denied. Please select a folder to scan.' });
        setCleanupPhase('idle');
        return;
      }

      const result = await scanGPXFolderForDuplicates(permissions.directoryUri);
      setFolderScanResult(result);
      setCleanupPhase('confirm');
    } catch (error) {
      setOperationResult({ success: false, error: error.message });
      setCleanupPhase('idle');
    }
  };

  const confirmDeleteDuplicates = async () => {
    if (!folderScanResult || !folderScanResult.filesToDelete) return;

    setCleanupPhase('deleting');
    setFolderCleanupProgress({ current: 0, total: folderScanResult.filesToDelete.length, file: '' });

    try {
      const result = await deleteDuplicateGPXFiles(
        folderScanResult.filesToDelete,
        (current, total, file) => {
          setFolderCleanupProgress({ current, total, file });
        }
      );

      setOperationResult(result);
      setCleanupPhase('done');
    } catch (error) {
      setOperationResult({ success: false, error: error.message });
      setCleanupPhase('done');
    }
  };

  const handlePickGPXFiles = async () => {
    const result = await pickGPXFiles();
    if (!result.canceled && result.files.length > 0) {
      setSelectedGPXFiles(result.files);
    }
  };

  const handlePickCSV = async () => {
    const result = await pickActivitiesCSV();
    if (!result.canceled && result.file) {
      const metadata = await parseActivitiesCSV(result.file.uri);
      setCsvMetadata({
        file: result.file,
        count: Object.keys(metadata).length,
        data: metadata,
      });
    }
  };

  const confirmStravaImport = async () => {
    setIsProcessing(true);
    setOperationResult(null);
    setImportProgress({ current: 0, total: selectedGPXFiles.length, file: '' });

    try {
      const metadata = csvMetadata?.data || {};
      const result = await importSelectedFiles(
        selectedGPXFiles,
        metadata,
        (current, total, file) => {
          setImportProgress({ current, total, file });
        }
      );

      setOperationResult(result);
      await loadStorageInfo();
    } catch (error) {
      setOperationResult({ success: false, error: error.message });
    } finally {
      setIsProcessing(false);
    }
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

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          STATS & ACHIEVEMENTS
        </Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Stats Cutoff Date
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Only count activities from this date onwards for stats, XP, and achievements
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cutoffDateContainer}>
            <TouchableOpacity
              style={[styles.datePickerButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.datePickerButtonText, { color: theme.text }]}>
                {statsCutoffDate
                  ? statsCutoffDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'No cutoff (all activities)'}
              </Text>
            </TouchableOpacity>

            {statsCutoffDate && (
              <TouchableOpacity
                style={[styles.clearDateButton, { backgroundColor: theme.surface }]}
                onPress={clearCutoffDate}
              >
                <Text style={[styles.clearDateButtonText, { color: theme.danger }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={statsCutoffDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleCutoffDateChange}
              maximumDate={new Date()}
            />
          )}
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
                GPX File Storage
              </Text>
              <Text style={[styles.storageValue, { color: theme.text }]}>
                {storageStats.activityCount} GPX files ({formatBytes(storageStats.totalSizeBytes)})
              </Text>
            </View>
            {integrityInfo && integrityInfo.inCacheOnlyWithRoute > 0 && (
              <View style={[styles.syncWarning, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                <WarningIcon size={16} color={theme.warning} />
                <Text style={[styles.syncWarningText, { color: theme.warning }]}>
                  {integrityInfo.inCacheOnlyWithRoute} activities with GPS data not yet saved as GPX
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleRecoverFromFile}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <SyncIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Recover from GPX Files
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Restore activities from saved GPX files
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleExportGPX}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <UploadIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Export GPX Files
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Save your activity GPX files to a folder you choose
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleStravaImport}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <DownloadIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Import from Strava
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Import GPX files from Strava export
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleFolderCleanup}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <SyncIcon size={22} color={theme.icon} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Clean GPX Folder Duplicates
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Scan a folder for duplicate GPX files and remove them
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
            <Text style={[styles.aboutValue, { color: theme.text }]}>{appJson.expo.version}</Text>
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
          TrailTracker automatically saves activities as GPX files. Use "Export GPX Files" to choose a folder  after that, new activities will be automatically exported there too.
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

      {/* Info Modal (for cutoff date confirmations) */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <InfoIcon size={56} color={theme.primary} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {infoModalContent.title}
            </Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              {infoModalContent.message}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
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
            <InfoIcon size={56} color={theme.accent} />
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
                    <Text style={[styles.modalStatRow, { color: theme.warning }]}>
                      {integrityInfo.inCacheOnly} only in cache
                    </Text>
                  )}
                  {integrityInfo.inFileOnly > 0 && (
                    <Text style={[styles.modalStatRow, { color: theme.success }]}>
                      {integrityInfo.inFileOnly} only in file storage
                    </Text>
                  )}
                </>
              )}
            </View>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.accent }]}
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
                  Saving to GPX Files...
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  Please wait while activities are saved as GPX files.
                </Text>
              </>
            ) : operationResult ? (
              <>
                {operationResult.success ? (
                  <CheckIcon size={56} color={theme.success} />
                ) : (
                  <WarningIcon size={56} color={theme.warning} />
                )}
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {operationResult.success ? 'GPX Files Saved!' : 'Error'}
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  {operationResult.success
                    ? `Saved ${operationResult.exportedCount} activities as GPX.\n${operationResult.skippedCount} already existed.${operationResult.noRouteCount > 0 ? `\n${operationResult.noRouteCount} had no GPS data.` : ''}\nTotal GPX files: ${operationResult.totalInFile}`
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
                  Recover from GPX Files?
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  This will restore {storageStats?.activityCount || 0} activities from GPX files to your cache. Use this if your cache data was lost or corrupted.
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
                  Restoring activities from GPX files.
                </Text>
              </>
            ) : operationResult ? (
              <>
                {operationResult.success ? (
                  <CheckIcon size={56} color={theme.success} />
                ) : (
                  <WarningIcon size={56} color={theme.warning} />
                )}
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {operationResult.success ? 'Recovery Complete!' : 'Error'}
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  {operationResult.success
                    ? `Recovered ${operationResult.count} activities from GPX files.`
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

      {/* Export GPX Modal */}
      <Modal
        visible={showBackupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isProcessing && setShowBackupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            {!isProcessing && !operationResult ? (
              <>
                <DownloadIcon size={56} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Export GPX Files
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  This will save {storageStats?.activityCount || 0} GPX files to a folder you choose.{'\n\n'}You can then copy them to your computer or import them into other apps like Strava.
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={confirmExportGPX}
                >
                  <Text style={styles.modalButtonText}>Choose Folder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { backgroundColor: theme.surface }]}
                  onPress={() => setShowBackupModal(false)}
                >
                  <Text style={[styles.modalCancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : isProcessing ? (
              <>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Exporting GPX Files...
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  Saving your activity files to the selected folder.
                </Text>
              </>
            ) : operationResult ? (
              <>
                {operationResult.success ? (
                  <CheckIcon size={56} color={theme.success} />
                ) : (
                  <WarningIcon size={56} color={theme.warning} />
                )}
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {operationResult.success ? 'Export Complete!' : 'Error'}
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  {operationResult.success
                    ? `Exported ${operationResult.count} GPX file${operationResult.count !== 1 ? 's' : ''} to selected folder.${operationResult.skipped > 0 ? `\n${operationResult.skipped} already existed (skipped).` : ''}${operationResult.failed > 0 ? `\n${operationResult.failed} file${operationResult.failed !== 1 ? 's' : ''} failed.` : ''}`
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

      {/* Import from Strava Modal */}
      <Modal
        visible={showImportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isProcessing && setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentWide, { backgroundColor: theme.cardBg }]}>
            {!isProcessing && !operationResult ? (
              <>
                <UploadIcon size={56} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Import from Strava
                </Text>

                <Text style={[styles.modalMessage, { color: theme.textSecondary, marginBottom: 16 }]}>
                  Select the folder containing your Strava GPX files
                </Text>

                {/* Select GPX Files Button */}
                <TouchableOpacity
                  style={[styles.filePickerButton, { borderColor: theme.primary }]}
                  onPress={handlePickGPXFiles}
                >
                  <Text style={[styles.filePickerButtonText, { color: theme.primary }]}>
                    {selectedGPXFiles.length > 0
                      ? `${selectedGPXFiles.length} GPX files found`
                      : 'Select Activities Folder'}
                  </Text>
                </TouchableOpacity>

                {/* Optional: Select CSV for metadata */}
                <TouchableOpacity
                  style={[styles.filePickerButtonSmall, { borderColor: theme.border }]}
                  onPress={handlePickCSV}
                >
                  <Text style={[styles.filePickerButtonTextSmall, { color: theme.textSecondary }]}>
                    {csvMetadata
                      ? `activities.csv (${csvMetadata.count} entries)`
                      : '+ Add activities.csv (optional)'}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.modalHint, { color: theme.textSecondary }]}>
                  The CSV file adds activity names, types, and stats
                </Text>

                {selectedGPXFiles.length > 0 && (
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary, marginTop: 16 }]}
                    onPress={confirmStravaImport}
                  >
                    <Text style={styles.modalButtonText}>
                      Import {selectedGPXFiles.length} Activities
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.modalCancelButton, { backgroundColor: theme.surface }]}
                  onPress={() => {
                    setShowImportModal(false);
                    setSelectedGPXFiles([]);
                    setCsvMetadata(null);
                  }}
                >
                  <Text style={[styles.modalCancelButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            ) : isProcessing ? (
              <>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Importing Activities...
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  {importProgress.current} of {importProgress.total}
                </Text>
                {importProgress.file && (
                  <Text style={[styles.modalSubMessage, { color: theme.textSecondary }]}>
                    {importProgress.file}
                  </Text>
                )}
              </>
            ) : operationResult ? (
              <>
                {operationResult.success ? (
                  <CheckIcon size={56} color={theme.success} />
                ) : (
                  <WarningIcon size={56} color={theme.warning} />
                )}
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {operationResult.success ? 'Import Complete!' : 'Import Error'}
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                  {operationResult.success
                    ? `Imported: ${operationResult.imported}\nFailed: ${operationResult.failed}`
                    : operationResult.error
                  }
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setShowImportModal(false);
                    setOperationResult(null);
                    setSelectedGPXFiles([]);
                    setCsvMetadata(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Folder Cleanup Modal */}
      <Modal
        visible={showFolderCleanupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => cleanupPhase === 'idle' || cleanupPhase === 'confirm' || cleanupPhase === 'done' ? setShowFolderCleanupModal(false) : null}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentWide, { backgroundColor: theme.cardBg }]}>
            {cleanupPhase === 'idle' ? (
              <>
                <SyncIcon size={56} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]} >
                  Clean GPX Folder Duplicates
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]} >
                  Select a folder to scan for duplicate GPX files. This will identify files with identical names or content and let you remove the duplicates.
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={startFolderScan}
                >
                  <Text style={styles.modalButtonText}>Select Folder to Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { backgroundColor: theme.surface }]}
                  onPress={() => setShowFolderCleanupModal(false)}
                >
                  <Text style={[styles.modalCancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : cleanupPhase === 'scanning' ? (
              <>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]} >
                  Scanning Folder...
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]} >
                  Looking for duplicate GPX files in the selected folder.
                </Text>
              </>
            ) : cleanupPhase === 'confirm' ? (
              <>
                <WarningIcon size={56} color={theme.warning} />
                <Text style={[styles.modalTitle, { color: theme.text }]} >
                  Duplicates Found
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]} >
                  {folderScanResult?.totalEntries != null ? `${folderScanResult.totalEntries} entries in folder\n` : ''}
                  {folderScanResult?.gpxCount != null ? `${folderScanResult.gpxCount} GPX-like files (${folderScanResult.gpxPlainCount || 0} .gpx + ${folderScanResult.gpxDuplicateNameCount || 0} copy-suffixed)\n` : ''}
                  {folderScanResult?.otherNonGpxCount > 0 ? `${folderScanResult.otherNonGpxCount} other files ignored\n` : ''}
                  {folderScanResult?.parseableCount != null ? `${folderScanResult.parseableCount} parseable\n` : ''}
                  {folderScanResult?.unparseableCount > 0 ? `${folderScanResult.unparseableCount} unparseable\n` : ''}
                  {folderScanResult?.uniqueCount != null ? `${folderScanResult.uniqueCount} unique activities\n` : ''}
                  {folderScanResult?.duplicateFilesCount > 0 ? `${folderScanResult.duplicateFilesCount} duplicate files to delete (${folderScanResult.filenameDuplicates || 0} filename, ${folderScanResult.contentHashDuplicates || 0} hash, ${folderScanResult.signatureDuplicates || 0} signature)\n` : '0 duplicates to delete\n'}
                  {folderScanResult?.fuzzyDuplicateFiles > 0 ? `${folderScanResult.fuzzyDuplicateFiles} ambiguous (not auto-deleted)\n` : ''}
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.danger }]}
                  onPress={confirmDeleteDuplicates}
                >
                  <Text style={styles.modalButtonText}>Delete {folderScanResult?.filesToDelete?.length || 0} Duplicates</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { backgroundColor: theme.surface }]}
                  onPress={() => {
                    setShowFolderCleanupModal(false);
                    setCleanupPhase('idle');
                  }}
                >
                  <Text style={[styles.modalCancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : cleanupPhase === 'deleting' ? (
              <>
                <ActivityIndicator size="large" color={theme.danger} />
                <Text style={[styles.modalTitle, { color: theme.text }]} >
                  Deleting Duplicates...
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]} >
                  {folderCleanupProgress.current} of {folderCleanupProgress.total}
                </Text>
                {folderCleanupProgress.file ? (
                  <Text style={[styles.modalSubMessage, { color: theme.textSecondary }]} >
                    {folderCleanupProgress.file}
                  </Text>
                ) : null}
              </>
            ) : cleanupPhase === 'done' ? (
              <>
                {operationResult?.success ? (
                  <CheckIcon size={56} color={theme.success} />
                ) : (
                  <WarningIcon size={56} color={theme.warning} />
                )}
                <Text style={[styles.modalTitle, { color: theme.text }]} >
                  {operationResult?.success ? 'Cleanup Complete!' : 'Error'}
                </Text>
                <Text style={[styles.modalMessage, { color: theme.textSecondary }]} >
                  {operationResult?.success
                    ? `Deleted ${operationResult.deleted} duplicate file${operationResult.deleted !== 1 ? 's' : ''}.${operationResult.failed > 0 ? `\n${operationResult.failed} file${operationResult.failed !== 1 ? 's' : ''} could not be deleted.` : ''}`
                    : operationResult?.error
                  }
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setShowFolderCleanupModal(false);
                    setCleanupPhase('idle');
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
    letterSpacing: 0.5,
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
  cutoffDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  datePickerButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  clearDateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearDateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
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
  modalSubMessage: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  modalContentWide: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  filePickerButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 12,
  },
  filePickerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  filePickerButtonSmall: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  filePickerButtonTextSmall: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  modalHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    fontStyle: 'italic',
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
