import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/theme';
import { getActivities, formatDistance, formatDuration } from '../utils/storage';
import { 
  loadGamification, 
  ACHIEVEMENTS, 
  LEVELS, 
  getLevelForXP, 
  getXPProgress, 
  getDistanceComparison,
  generateChallenges,
  updateChallengeProgress,
  calculateStreak,
  saveGamification,
  getStatsCutoffDate,
  filterActivitiesByCutoff,
} from '../utils/gamification';
import { WalkingIcon, BikingIcon, ChevronRightIcon, TrackIcon } from '../components/Icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - 48;
const GRAPH_HEIGHT = (SCREEN_HEIGHT - 200) / 3 - 40;
const PROGRESS_SETTINGS_KEY = '@trail_tracker_progress_settings';

// Icons
const ChevronUpIcon = ({ size = 20, color = '#424242' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronDownIcon = ({ size = 20, color = '#424242' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrophyIcon = ({ size = 24, color = '#FFD700' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 9v3a6 6 0 006 6v0a6 6 0 006-6V9M6 9h12M9 21h6M12 18v3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StarIcon = ({ size = 24, color = '#9C27B0' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const FireIcon = ({ size = 24, color = '#FF5722' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2c0 3-2 5-2 8 0 1.5.5 3 2 4 1.5-1 2-2.5 2-4 0-3-2-5-2-8z" fill={color} />
    <Path d="M8 12c0 2.5 1.5 4 4 5 2.5-1 4-2.5 4-5 0-1.5-.5-3-1.5-4-.5 1.5-1.5 2.5-2.5 2.5s-2-1-2.5-2.5c-1 1-1.5 2.5-1.5 4z" fill={color} />
  </Svg>
);

const TargetIcon = ({ size = 24, color = '#2196F3' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="2" fill={color} />
  </Svg>
);

export default function StatsScreen() {
  const { theme, distanceUnit } = useTheme();
  const navigation = useNavigation();
  const [activities, setActivities] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [timeWindow, setTimeWindow] = useState('week');
  const [progressType, setProgressType] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [cutoffDate, setCutoffDate] = useState(null);
  
  const [progressSettings, setProgressSettings] = useState({
    walking: { daily: 10, weekly: 10, monthly: 10 },
    biking: { daily: 10, weekly: 10, monthly: 10 },
  });

  // Helper to render achievement icons - handles stacked flames for streak achievements
  const renderAchievementIcon = (icon, fontSize, isUnlocked = true) => {
    const opacity = isUnlocked ? 1 : 0.3;
    
    if (icon === '🔥🔥') {
      // Week Warrior - two stacked flames
      const flameSize = fontSize * 0.7;
      return (
        <View style={{ width: fontSize, height: fontSize, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: flameSize, position: 'absolute', top: 0, left: 0, opacity }}>🔥</Text>
          <Text style={{ fontSize: flameSize, position: 'absolute', bottom: 0, right: 0, opacity }}>🔥</Text>
        </View>
      );
    }
    
    if (icon === '🔥🔥🔥') {
      // Unstoppable - three stacked flames
      const flameSize = fontSize * 0.55;
      return (
        <View style={{ width: fontSize, height: fontSize, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: flameSize, position: 'absolute', top: 0, left: '50%', marginLeft: -flameSize/2, opacity }}>🔥</Text>
          <Text style={{ fontSize: flameSize, position: 'absolute', bottom: 2, left: 0, opacity }}>🔥</Text>
          <Text style={{ fontSize: flameSize, position: 'absolute', bottom: 2, right: 0, opacity }}>🔥</Text>
        </View>
      );
    }
    
    // Regular icon
    return <Text style={{ fontSize, opacity }}>{icon}</Text>;
  };

  useEffect(() => {
    loadProgressSettings();
  }, []);

  const loadProgressSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(PROGRESS_SETTINGS_KEY);
      if (saved) {
        setProgressSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading progress settings:', e);
    }
  };

  const saveProgressSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(PROGRESS_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.log('Error saving progress settings:', e);
    }
  };

  const adjustCount = (activityType, graphType, delta) => {
    const newSettings = { ...progressSettings };
    const current = newSettings[activityType][graphType];
    const newValue = Math.max(1, Math.min(20, current + delta));
    newSettings[activityType][graphType] = newValue;
    setProgressSettings(newSettings);
    saveProgressSettings(newSettings);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const activitiesData = await getActivities();
    setActivities(activitiesData);
    
    // Load cutoff date for stats filtering
    const cutoff = await getStatsCutoffDate();
    setCutoffDate(cutoff);
    
    let gamificationData = await loadGamification();
    
    if (activitiesData.length > 0) {
      gamificationData.stats.currentStreak = calculateStreak(activitiesData);
      
      const now = new Date();
      const lastGen = gamificationData.lastChallengeGeneration 
        ? new Date(gamificationData.lastChallengeGeneration)
        : null;
      
      const needsNewChallenges = !lastGen || 
        (now.getDate() !== lastGen.getDate()) ||
        gamificationData.challenges.filter(c => !c.completed && !c.expired).length === 0;
      
      if (needsNewChallenges) {
        const newChallenges = generateChallenges(gamificationData.stats);
        gamificationData.challenges = [
          ...gamificationData.challenges.filter(c => !c.expired && (c.completed || !c.rewarded)),
          ...newChallenges
        ].slice(-10);
        gamificationData.lastChallengeGeneration = now.toISOString();
      }
      
      gamificationData.challenges = updateChallengeProgress(
        gamificationData.challenges,
        activitiesData,
        gamificationData.stats.currentStreak
      );
      
      await saveGamification(gamificationData);
    }
    
    setGamification(gamificationData);
  };

  const getFilteredActivities = () => {
    const now = new Date();
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      switch (timeWindow) {
        case 'week':
          return activityDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return activityDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'year':
          return activityDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });
  };

  const getTotalDistance = () => {
    const filteredActivities = filterActivitiesByCutoff(activities, cutoffDate);
    return filteredActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
  };

  const getDailyTotals = (type, count) => {
    const totals = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayActivities = activities.filter(a => {
        const activityDate = new Date(a.timestamp);
        return a.type === type && activityDate >= date && activityDate < nextDate;
      });
      totals.push({
        label: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        value: dayActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
      });
    }
    return totals;
  };

  const getWeeklyTotals = (type, count) => {
    const totals = [];
    const now = new Date();
    
    // Get the Monday of the current week
    const getCurrentMonday = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      // Adjust: Sunday (0) becomes 7, so we go back (day || 7) - 1 days to get Monday
      const diff = (day === 0 ? 6 : day - 1);
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    
    for (let i = count - 1; i >= 0; i--) {
      const weekStart = getCurrentMonday(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7); // Sunday 23:59:59 is before next Monday 00:00:00
      
      const weekActivities = activities.filter(a => {
        const activityDate = new Date(a.timestamp);
        return a.type === type && activityDate >= weekStart && activityDate < weekEnd;
      });
      
      // Calculate ISO week number (weeks start on Monday)
      const d = new Date(Date.UTC(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      
      totals.push({
        label: `W${weekNum}`,
        value: weekActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
      });
    }
    return totals;
  };

  const getMonthlyTotals = (type, count) => {
    const totals = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthActivities = activities.filter(a => {
        const activityDate = new Date(a.timestamp);
        return a.type === type && activityDate >= monthStart && activityDate < monthEnd;
      });
      totals.push({
        label: monthStart.toLocaleDateString('en-GB', { month: 'short' }),
        value: monthActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
      });
    }
    return totals;
  };

  // Level Card
  const renderLevelCard = () => {
    if (!gamification) return null;
    const level = getLevelForXP(gamification.xp);
    const xpProgress = getXPProgress(gamification.xp);
    
    // Calculate week streak (how many consecutive weeks with at least one activity)
    const calculateWeekStreak = () => {
      if (activities.length === 0) return 0;
      
      const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      };
      
      // Get unique weeks with activities
      const weeksWithActivities = new Set(
        activities.map(a => getWeekStart(a.timestamp))
      );
      
      // Sort weeks in descending order
      const sortedWeeks = Array.from(weeksWithActivities).sort((a, b) => b - a);
      
      if (sortedWeeks.length === 0) return 0;
      
      const currentWeekStart = getWeekStart(new Date());
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      
      // Check if most recent activity week is current or last week
      if (sortedWeeks[0] < currentWeekStart - oneWeekMs) return 0;
      
      let streak = 1;
      let expectedWeek = sortedWeeks[0] - oneWeekMs;
      
      for (let i = 1; i < sortedWeeks.length; i++) {
        if (sortedWeeks[i] === expectedWeek) {
          streak++;
          expectedWeek -= oneWeekMs;
        } else if (sortedWeeks[i] < expectedWeek) {
          break;
        }
      }
      
      return streak;
    };
    
    const weekStreak = calculateWeekStreak();
    
    return (
      <View style={[styles.levelCard, { backgroundColor: theme.cardBg }]}>
        <View style={styles.levelHeader}>
          <View style={styles.levelIconContainer}>
            <Text style={styles.levelEmoji}>{level.icon}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelName, { color: theme.text }]}>{level.name}</Text>
            <Text style={[styles.levelNumber, { color: theme.textSecondary }]}>Level {level.level}</Text>
          </View>
        </View>
        
        <View style={styles.xpDisplayLarge}>
          <StarIcon size={32} color={theme.xp} />
          <Text style={[styles.xpValueLarge, { color: theme.xp }]}>{gamification.xp}</Text>
          <Text style={[styles.xpLabelLarge, { color: theme.xp }]}>XP</Text>
        </View>
        
        {xpProgress.nextLevel && (
          <View style={styles.xpProgressContainer}>
            <View style={[styles.xpProgressBar, { backgroundColor: theme.surface }]}>
              <View style={[styles.xpProgressFill, { backgroundColor: theme.xp, width: `${xpProgress.progress * 100}%` }]} />
            </View>
            <Text style={[styles.xpProgressText, { color: theme.textSecondary }]}>
              {xpProgress.current} / {xpProgress.required} XP to {xpProgress.nextLevel.name}
            </Text>
          </View>
        )}
        
        {weekStreak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: theme.surface }]}>
            <FireIcon size={18} color="#FF5722" />
            <Text style={[styles.streakText, { color: theme.text }]}>{weekStreak} week streak!</Text>
          </View>
        )}
      </View>
    );
  };

  // Distance Card
  const renderDistanceCard = () => {
    const totalKm = getTotalDistance();
    const comparison = getDistanceComparison(totalKm);
    
    return (
      <View style={[styles.distanceCard, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.distanceTitle, { color: theme.text }]}>🌍 Journey Progress</Text>
        <View style={styles.distanceMain}>
          <Text style={[styles.distanceValue, { color: theme.primary }]}>{formatDistance(totalKm, distanceUnit)}</Text>
          <Text style={[styles.distanceSubtext, { color: theme.textSecondary }]}>total distance</Text>
        </View>
        
        {comparison.passedLandmark && (
          <View style={[styles.landmark, { borderColor: theme.primary }]}>
            <Text style={styles.landmarkEmoji}>{comparison.passedLandmark.icon}</Text>
            <View style={styles.landmarkInfo}>
              <Text style={[styles.landmarkLabel, { color: theme.textSecondary }]}>You've travelled</Text>
              <Text style={[styles.landmarkName, { color: theme.text }]}>{comparison.passedLandmark.name}</Text>
            </View>
            <Text style={[styles.landmarkCheck, { color: theme.primary }]}>✓</Text>
          </View>
        )}
        
        {comparison.nextLandmark && (
          <View style={styles.nextLandmark}>
            <Text style={[styles.nextLandmarkLabel, { color: theme.textSecondary }]}>Next milestone:</Text>
            <Text style={[styles.nextLandmarkName, { color: theme.text }]}>
              {comparison.nextLandmark.icon} {comparison.nextLandmark.name}
            </Text>
            <View style={[styles.landmarkProgress, { backgroundColor: theme.surface }]}>
              <View style={[styles.landmarkProgressFill, { backgroundColor: theme.primary, width: `${Math.min(comparison.progress, 1) * 100}%` }]} />
            </View>
            <Text style={[styles.landmarkProgressText, { color: theme.textSecondary }]}>
              {formatDistance(totalKm, distanceUnit)} / {formatDistance(comparison.nextLandmark.distance, distanceUnit)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Challenges Card
  const renderChallengesCard = () => {
    if (!gamification?.challenges) return null;
    const activeChallenges = gamification.challenges.filter(c => !c.expired && !c.completed);
    const completedChallenges = gamification.challenges.filter(c => c.completed);
    
    return (
      <View style={[styles.challengesCard, { backgroundColor: theme.cardBg }]}>
        <View style={styles.challengesHeader}>
          <TargetIcon size={20} color={theme.accent} />
          <Text style={[styles.challengesTitle, { color: theme.text }]}>Challenges</Text>
          <Text style={[styles.challengesCount, { color: theme.textSecondary }]}>
            {completedChallenges.length}/{gamification.challenges.length}
          </Text>
        </View>
        
        {activeChallenges.slice(0, 3).map(challenge => (
          <View key={challenge.id} style={[styles.challenge, { backgroundColor: theme.surface }]}>
            <Text style={[styles.challengeDesc, { color: theme.text }]}>{challenge.description}</Text>
            <Text style={[styles.challengeProgress, { color: theme.textSecondary }]}>
              {typeof challenge.progress === 'number' ? challenge.progress.toFixed(1) : '0'} / {challenge.target} {challenge.unit}
            </Text>
            <View style={[styles.challengeBar, { backgroundColor: theme.border }]}>
              <View style={[styles.challengeBarFill, { backgroundColor: theme.accent, width: `${Math.min((challenge.progress || 0) / challenge.target, 1) * 100}%` }]} />
            </View>
          </View>
        ))}
        
        {completedChallenges.slice(0, 2).map(challenge => (
          <View key={challenge.id} style={[styles.challenge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.challengeDesc, { color: theme.primary }]}>✓ {challenge.description}</Text>
          </View>
        ))}
        
        <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: theme.surface }]} onPress={() => setActiveTab('challenges')}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>View All Challenges</Text>
          <ChevronRightIcon size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  // Full challenges view
  const renderChallengesView = () => {
    if (!gamification?.challenges) return null;
    const inProgressChallenges = gamification.challenges.filter(c => !c.expired && !c.completed && (c.progress || 0) > 0);
    const availableChallenges = gamification.challenges.filter(c => !c.expired && !c.completed && (c.progress || 0) === 0);
    const completedChallenges = gamification.challenges.filter(c => c.completed);
    const expiredChallenges = gamification.challenges.filter(c => c.expired && !c.completed);
    
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.achievementsViewHeader}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.surface }]} onPress={() => setActiveTab('overview')}>
            <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.achievementsViewTitle, { color: theme.text }]}>Challenges</Text>
          <View style={styles.backButton} />
        </View>
        
        {inProgressChallenges.length > 0 && (
          <View style={styles.achievementCategory}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>🎯 In Progress</Text>
            {inProgressChallenges.map(challenge => (
              <View key={challenge.id} style={[styles.challengeRowLarge, { backgroundColor: theme.cardBg }]}>
                <View style={[styles.challengeIconLarge, { backgroundColor: theme.surface }]}>
                  <TargetIcon size={32} color={theme.accent} />
                </View>
                <View style={styles.challengeRowInfo}>
                  <Text style={[styles.challengeRowDesc, { color: theme.text }]}>{challenge.description}</Text>
                  <Text style={[styles.challengeRowProgress, { color: theme.textSecondary }]}>
                    {typeof challenge.progress === 'number' ? challenge.progress.toFixed(1) : '0'} / {challenge.target} {challenge.unit}
                  </Text>
                  <View style={[styles.challengeBarLarge, { backgroundColor: theme.border }]}>
                    <View style={[styles.challengeBarFill, { backgroundColor: theme.accent, width: `${Math.min((challenge.progress || 0) / challenge.target, 1) * 100}%` }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {completedChallenges.length > 0 && (
          <View style={styles.achievementCategory}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>✅ Completed</Text>
            {completedChallenges.map(challenge => (
              <View key={challenge.id} style={[styles.challengeRowLarge, { backgroundColor: theme.cardBg, borderLeftColor: theme.primary, borderLeftWidth: 4 }]}>
                <View style={[styles.challengeIconLarge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={styles.challengeCheckEmoji}>✓</Text>
                </View>
                <View style={styles.challengeRowInfo}>
                  <Text style={[styles.challengeRowDesc, { color: theme.primary }]}>{challenge.description}</Text>
                  <Text style={[styles.challengeRowProgress, { color: theme.textSecondary }]}>+25 XP earned</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {availableChallenges.length > 0 && (
          <View style={styles.achievementCategory}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>📋 Available</Text>
            {availableChallenges.map(challenge => (
              <View key={challenge.id} style={[styles.challengeRowLarge, { backgroundColor: theme.cardBg }]}>
                <View style={[styles.challengeIconLarge, { backgroundColor: theme.surface }]}>
                  <TargetIcon size={32} color={theme.textSecondary} />
                </View>
                <View style={styles.challengeRowInfo}>
                  <Text style={[styles.challengeRowDesc, { color: theme.text }]}>{challenge.description}</Text>
                  <Text style={[styles.challengeRowProgress, { color: theme.textSecondary }]}>
                    0 / {challenge.target} {challenge.unit}
                  </Text>
                  <View style={[styles.challengeBarLarge, { backgroundColor: theme.border }]}>
                    <View style={[styles.challengeBarFill, { backgroundColor: theme.accent, width: '0%' }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {expiredChallenges.length > 0 && (
          <View style={styles.achievementCategory}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>⏰ Expired</Text>
            {expiredChallenges.map(challenge => (
              <View key={challenge.id} style={[styles.challengeRowLarge, { backgroundColor: theme.cardBg, opacity: 0.6 }]}>
                <View style={[styles.challengeIconLarge, { backgroundColor: theme.surface }]}>
                  <Text style={styles.challengeCheckEmoji}>⏰</Text>
                </View>
                <View style={styles.challengeRowInfo}>
                  <Text style={[styles.challengeRowDesc, { color: theme.textSecondary }]}>{challenge.description}</Text>
                  <Text style={[styles.challengeRowProgress, { color: theme.textSecondary }]}>
                    {typeof challenge.progress === 'number' ? challenge.progress.toFixed(1) : '0'} / {challenge.target} {challenge.unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  // Achievements Card
  const renderAchievementsCard = () => {
    if (!gamification) return null;
    const achievementList = Object.values(ACHIEVEMENTS);
    
    return (
      <View style={[styles.achievementsCard, { backgroundColor: theme.cardBg }]}>
        <View style={styles.achievementsHeader}>
          <TrophyIcon size={20} color={theme.gold} />
          <Text style={[styles.achievementsTitle, { color: theme.text }]}>Achievements</Text>
          <Text style={[styles.achievementsCount, { color: theme.textSecondary }]}>
            {gamification.unlockedAchievements.length}/{achievementList.length}
          </Text>
        </View>
        
        <View style={styles.achievementsGrid}>
          {achievementList.slice(0, 8).map(achievement => {
            const isUnlocked = gamification.unlockedAchievements.includes(achievement.id);
            return (
              <TouchableOpacity
                key={achievement.id}
                style={[styles.achievementItem, { backgroundColor: theme.surface }, !isUnlocked && styles.achievementLocked]}
                onPress={() => { setSelectedAchievement(achievement); setShowAchievementModal(true); }}
              >
                {renderAchievementIcon(achievement.icon, 48, isUnlocked)}
                {!isUnlocked && <View style={styles.achievementLockOverlay}><Text style={styles.lockIcon}>🔒</Text></View>}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: theme.surface }]} onPress={() => setActiveTab('achievements')}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>View All Achievements</Text>
          <ChevronRightIcon size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  // Full achievements view
  const renderAchievementsView = () => {
    if (!gamification) return null;
    const categories = { 
      general: '🌟 General', 
      streak: '🔥 Streaks', 
      walking: '🚶 Walking', 
      biking: '🚵 Mountain Biking' 
    };
    
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.achievementsViewHeader}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.surface }]} onPress={() => setActiveTab('overview')}>
            <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.achievementsViewTitle, { color: theme.text }]}>Achievements</Text>
          <View style={styles.backButton} />
        </View>
        
        {Object.entries(categories).map(([category, name]) => {
          const categoryAchievements = Object.values(ACHIEVEMENTS).filter(a => a.category === category);
          if (categoryAchievements.length === 0) return null;
          
          return (
            <View key={category} style={styles.achievementCategory}>
              <Text style={[styles.categoryTitle, { color: theme.text }]}>{name}</Text>
              {categoryAchievements.map(achievement => {
                const isUnlocked = gamification.unlockedAchievements.includes(achievement.id);
                return (
                  <TouchableOpacity
                    key={achievement.id}
                    style={[styles.achievementRow, { backgroundColor: theme.cardBg }, isUnlocked && { borderLeftColor: theme.primary, borderLeftWidth: 4 }]}
                    onPress={() => { setSelectedAchievement(achievement); setShowAchievementModal(true); }}
                  >
                    <View style={[styles.achievementRowIcon, { backgroundColor: isUnlocked ? theme.primaryLight : theme.surface }]}>
                      {renderAchievementIcon(achievement.icon, 40, isUnlocked)}
                    </View>
                    <View style={styles.achievementRowInfo}>
                      <Text style={[styles.achievementRowName, { color: isUnlocked ? theme.text : theme.textSecondary }]}>{achievement.name}</Text>
                      <Text style={[styles.achievementRowDesc, { color: theme.textSecondary }]}>{achievement.description}</Text>
                    </View>
                    {isUnlocked ? <Text style={[styles.achievementCheck, { color: theme.primary }]}>✓</Text> : <Text style={styles.achievementLockSmall}>🔒</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  // Progress graph
  const renderProgressGraph = (data, title, activityType, graphType, count) => {
    const maxValue = Math.max(...data.map(d => d.value), 0.1);
    const padding = { left: 10, right: 10, top: 30, bottom: 25 };
    const graphW = GRAPH_WIDTH - padding.left - padding.right;
    const graphH = GRAPH_HEIGHT - padding.top - padding.bottom;
    const formatValue = (km) => distanceUnit === 'miles' ? (km * 0.621371).toFixed(1) : km.toFixed(1);
    
    // Calculate total for the visible period
    const periodTotal = data.reduce((sum, d) => sum + d.value, 0);
    
    const points = data.map((d, i) => ({
      x: padding.left + (i / Math.max(data.length - 1, 1)) * graphW,
      y: padding.top + graphH - (d.value / maxValue) * graphH,
      value: d.value, label: d.label,
    }));
    const validPoints = points.filter(p => p.value > 0);
    const linePath = validPoints.length > 1 ? validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') : '';

    return (
      <View style={[styles.graphCard, { backgroundColor: theme.cardBg }]}>
        <View style={styles.graphHeader}>
          <View style={styles.countControl}>
            <TouchableOpacity style={[styles.countButton, { backgroundColor: theme.surface }]} onPress={() => adjustCount(activityType, graphType, 1)} disabled={count >= 20}>
              <ChevronUpIcon size={18} color={count >= 20 ? theme.border : theme.icon} />
            </TouchableOpacity>
            <Text style={[styles.countText, { color: theme.text }]}>{count}</Text>
            <TouchableOpacity style={[styles.countButton, { backgroundColor: theme.surface }]} onPress={() => adjustCount(activityType, graphType, -1)} disabled={count <= 1}>
              <ChevronDownIcon size={18} color={count <= 1 ? theme.border : theme.icon} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.graphTitle, { color: theme.text }]}>{title}</Text>
          <View style={styles.graphTotalContainer}>
            <Text style={[styles.graphTotalLabel, { color: theme.textSecondary }]}>Total:</Text>
            <Text style={[styles.graphTotalValue, { color: theme.primary }]}>{formatDistance(periodTotal, distanceUnit)}</Text>
          </View>
        </View>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
          <Line x1={padding.left} y1={padding.top + graphH} x2={GRAPH_WIDTH - padding.right} y2={padding.top + graphH} stroke={theme.border} strokeWidth={1} />
          {linePath && <Path d={linePath} stroke={theme.primary} strokeWidth={2} fill="none" />}
          {points.map((point, i) => (
            <React.Fragment key={i}>
              {point.value > 0 ? (
                <SvgText x={point.x} y={point.y - 8} fontSize={10} fill={theme.text} textAnchor="middle">{formatValue(point.value)}</SvgText>
              ) : (
                <SvgText x={point.x} y={padding.top + graphH - 8} fontSize={9} fill={theme.textSecondary} textAnchor="middle">0</SvgText>
              )}
              <Circle cx={point.x} cy={point.value > 0 ? point.y : padding.top + graphH} r={point.value > 0 ? 6 : 4} fill={point.value > 0 ? theme.primary : theme.textSecondary} />
              {i % Math.max(1, Math.floor(points.length / 6)) === 0 && <SvgText x={point.x} y={GRAPH_HEIGHT - 5} fontSize={9} fill={theme.textSecondary} textAnchor="middle">{point.label}</SvgText>}
            </React.Fragment>
          ))}
        </Svg>
      </View>
    );
  };

  // Progress view
  const renderProgressView = () => {
    const settings = progressSettings[progressType];
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.progressHeader}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.surface }]} onPress={() => setProgressType(null)}>
            <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.progressTitleContainer}>
            {progressType === 'walking' ? <WalkingIcon size={24} color={theme.primary} /> : <BikingIcon size={24} color={theme.primary} />}
            <Text style={[styles.progressTitle, { color: theme.text }]}>{progressType === 'walking' ? 'Walking' : 'Biking'} Progress</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <ScrollView style={styles.progressScroll}>
          <View style={styles.progressContent}>
            {renderProgressGraph(getDailyTotals(progressType, settings.daily), 'Daily Distance', progressType, 'daily', settings.daily)}
            {renderProgressGraph(getWeeklyTotals(progressType, settings.weekly), 'Weekly Distance', progressType, 'weekly', settings.weekly)}
            {renderProgressGraph(getMonthlyTotals(progressType, settings.monthly), 'Monthly Distance', progressType, 'monthly', settings.monthly)}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Achievement Modal
  const renderAchievementModal = () => (
    <Modal visible={showAchievementModal} transparent animationType="fade" onRequestClose={() => setShowAchievementModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.achievementModalContent, { backgroundColor: theme.cardBg }]}>
          {selectedAchievement && (
            <>
              <View style={[styles.achievementModalIcon, { backgroundColor: theme.primaryLight }]}>
                {renderAchievementIcon(selectedAchievement.icon, 56, true)}
              </View>
              <Text style={[styles.achievementModalName, { color: theme.text }]}>{selectedAchievement.name}</Text>
              <Text style={[styles.achievementModalDesc, { color: theme.textSecondary }]}>{selectedAchievement.description}</Text>
              <View style={[styles.achievementModalBadge, { backgroundColor: gamification?.unlockedAchievements.includes(selectedAchievement.id) ? theme.primaryLight : theme.surface }]}>
                <Text style={[styles.achievementModalBadgeText, { color: gamification?.unlockedAchievements.includes(selectedAchievement.id) ? theme.primary : theme.textSecondary }]}>
                  {gamification?.unlockedAchievements.includes(selectedAchievement.id) ? '✓ Unlocked!' : '🔒 Not yet unlocked'}
                </Text>
              </View>
            </>
          )}
          <TouchableOpacity style={[styles.achievementModalClose, { backgroundColor: theme.surface }]} onPress={() => setShowAchievementModal(false)}>
            <Text style={[styles.achievementModalCloseText, { color: theme.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Main render
  if (activeTab === 'achievements') return renderAchievementsView();
  if (activeTab === 'challenges') return renderChallengesView();
  if (progressType) return renderProgressView();

  const filtered = getFilteredActivities();
  const totalDistance = filtered.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalDuration = filtered.reduce((sum, a) => sum + (a.duration || 0), 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderLevelCard()}
      {renderDistanceCard()}
      {renderChallengesCard()}
      {renderAchievementsCard()}
      
      <View style={styles.progressButtonContainer}>
        <View style={styles.progressButtonRow}>
          <TouchableOpacity style={[styles.progressButton, styles.progressButtonHalf, { backgroundColor: '#1976D2' }]} onPress={() => setProgressType('walking')}>
            <WalkingIcon size={20} color="#fff" />
            <Text style={styles.progressButtonText}>Walking Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.progressButton, styles.progressButtonHalf, { backgroundColor: '#D32F2F' }]} onPress={() => setProgressType('biking')}>
            <BikingIcon size={20} color="#fff" />
            <Text style={styles.progressButtonText}>Biking Progress</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.timeWindowContainer}>
        {['week', 'month', 'year', 'all'].map(window => (
          <TouchableOpacity key={window} style={[styles.timeWindowButton, { backgroundColor: timeWindow === window ? theme.primary : theme.surface, borderColor: timeWindow === window ? theme.primary : theme.border }]} onPress={() => setTimeWindow(window)}>
            <Text style={[styles.timeWindowText, { color: timeWindow === window ? '#fff' : theme.text }]}>{window === 'all' ? 'All Time' : window.charAt(0).toUpperCase() + window.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <TrackIcon size={48} color={theme.border} />
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>No activities yet. Start tracking to see your stats!</Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SUMMARY</Text>
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
              <View style={styles.mainStat}>
                <Text style={[styles.mainStatValue, { color: theme.primary }]}>{formatDistance(totalDistance, distanceUnit)}</Text>
                <Text style={[styles.mainStatLabel, { color: theme.textSecondary }]}>Total Distance</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.text }]}>{filtered.length}</Text><Text style={[styles.statLabel, { color: theme.textSecondary }]}>Activities</Text></View>
                <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.text }]}>{formatDuration(totalDuration)}</Text><Text style={[styles.statLabel, { color: theme.textSecondary }]}>Time</Text></View>
                <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.text }]}>{filtered.filter(a => a.type === 'walking').length}</Text><Text style={[styles.statLabel, { color: theme.textSecondary }]}>Walks</Text></View>
                <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.text }]}>{filtered.filter(a => a.type === 'biking').length}</Text><Text style={[styles.statLabel, { color: theme.textSecondary }]}>Rides</Text></View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RECENT ACTIVITIES</Text>
            {filtered.slice(-5).reverse().map(activity => (
              <TouchableOpacity key={activity.id} style={[styles.recentActivity, { backgroundColor: theme.cardBg }]} onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}>
                <View style={styles.recentActivityLeft}>
                  <View style={[styles.recentIcon, { backgroundColor: theme.primaryLight }]}>
                    {activity.type === 'walking' ? <WalkingIcon size={20} color={theme.primary} /> : <BikingIcon size={20} color={theme.primary} />}
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={[styles.recentType, { color: theme.text }]}>{activity.type === 'walking' ? 'Walking' : 'Biking'}</Text>
                    <Text style={[styles.recentDate, { color: theme.textSecondary }]}>{new Date(activity.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                </View>
                <View style={styles.recentStats}>
                  <Text style={[styles.recentStat, { color: theme.text }]}>{formatDistance(activity.distance, distanceUnit)}</Text>
                  <ChevronRightIcon size={18} color={theme.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      <View style={{ height: 30 }} />
      {renderAchievementModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  levelCard: { margin: 16, marginBottom: 8, borderRadius: 16, padding: 16 },
  levelHeader: { flexDirection: 'row', alignItems: 'center' },
  levelIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(156, 39, 176, 0.1)', justifyContent: 'center', alignItems: 'center' },
  levelEmoji: { fontSize: 32 },
  levelInfo: { flex: 1, marginLeft: 12 },
  levelName: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  levelNumber: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  xpDisplayLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 16, backgroundColor: 'rgba(156, 39, 176, 0.1)', borderRadius: 12 },
  xpValueLarge: { fontSize: 36, fontFamily: 'Inter_700Bold' },
  xpLabelLarge: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  xpText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  xpProgressContainer: { marginTop: 12 },
  xpProgressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  xpProgressFill: { height: '100%', borderRadius: 4 },
  xpProgressText: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4, textAlign: 'center' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  streakText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  distanceCard: { margin: 16, marginTop: 8, marginBottom: 8, borderRadius: 16, padding: 16 },
  distanceTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  distanceMain: { alignItems: 'center', marginBottom: 12 },
  distanceValue: { fontSize: 36, fontFamily: 'Inter_700Bold' },
  distanceSubtext: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  funFact: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 12, gap: 10 },
  funFactEmoji: { fontSize: 24 },
  funFactText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  landmark: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 2, marginBottom: 12, gap: 10 },
  landmarkEmoji: { fontSize: 28 },
  landmarkInfo: { flex: 1 },
  landmarkLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  landmarkName: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  landmarkCheck: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  nextLandmark: { marginTop: 4 },
  nextLandmarkLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  nextLandmarkName: { fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  landmarkProgress: { height: 8, borderRadius: 4, overflow: 'hidden' },
  landmarkProgressFill: { height: '100%', borderRadius: 4 },
  landmarkProgressText: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4, textAlign: 'right' },
  challengesCard: { margin: 16, marginTop: 8, marginBottom: 8, borderRadius: 16, padding: 16 },
  challengesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  challengesTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', flex: 1 },
  challengesCount: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  challenge: { padding: 12, borderRadius: 12, marginBottom: 8 },
  challengeDesc: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  challengeProgress: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, marginBottom: 8 },
  challengeBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  challengeBarFill: { height: '100%', borderRadius: 3 },
  challengeRowLarge: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
  challengeIconLarge: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  challengeCheckEmoji: { fontSize: 32 },
  challengeRowInfo: { flex: 1, marginLeft: 12 },
  challengeRowDesc: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  challengeRowProgress: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  challengeBarLarge: { height: 8, borderRadius: 4, overflow: 'hidden' },
  achievementsCard: { margin: 16, marginTop: 8, marginBottom: 8, borderRadius: 16, padding: 16 },
  achievementsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  achievementsTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', flex: 1 },
  achievementsCount: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  achievementItem: { width: (SCREEN_WIDTH - 32 - 16 - 56) / 4, aspectRatio: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  achievementLocked: { opacity: 0.5 },
  achievementIcon: { fontSize: 48 },
  achievementLockOverlay: { position: 'absolute', right: 4, bottom: 4 },
  lockIcon: { fontSize: 14 },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, gap: 4 },
  viewAllText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  achievementsViewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  achievementsViewTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  achievementCategory: { padding: 16, paddingTop: 8 },
  categoryTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  achievementRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
  achievementRowIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  achievementRowEmoji: { fontSize: 40 },
  achievementRowInfo: { flex: 1, marginLeft: 12 },
  achievementRowName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  achievementRowDesc: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  achievementCheck: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  achievementLockSmall: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  achievementModalContent: { width: '100%', maxWidth: 300, borderRadius: 24, padding: 24, alignItems: 'center' },
  achievementModalIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  achievementModalEmoji: { fontSize: 56 },
  achievementModalName: { fontSize: 20, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 8 },
  achievementModalDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 16 },
  achievementModalBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  achievementModalBadgeText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  achievementModalClose: { width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  achievementModalCloseText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  timeWindowContainer: { flexDirection: 'row', padding: 16, paddingTop: 8, gap: 8 },
  timeWindowButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  timeWindowText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  progressButtonContainer: { paddingHorizontal: 16, marginBottom: 16 },
  progressButtonRow: { flexDirection: 'row', gap: 12 },
  progressButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  progressButtonHalf: { flex: 1 },
  progressButtonText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1, marginBottom: 8 },
  card: { borderRadius: 12, padding: 16 },
  mainStat: { alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)' },
  mainStatValue: { fontSize: 32, fontFamily: 'Inter_700Bold' },
  mainStatLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  recentActivity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10, marginBottom: 8 },
  recentActivityLeft: { flexDirection: 'row', alignItems: 'center' },
  recentIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  recentInfo: { marginLeft: 10 },
  recentType: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  recentDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  recentStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recentStat: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyStateText: { fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  progressTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minWidth: 80 },
  backButtonText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  progressScroll: { flex: 1 },
  progressContent: { padding: 16, paddingTop: 0 },
  graphCard: { borderRadius: 12, padding: 12, marginBottom: 12 },
  graphHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  graphTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', flex: 1, textAlign: 'center' },
  countControl: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countButton: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  countText: { fontSize: 14, fontFamily: 'Inter_700Bold', minWidth: 24, textAlign: 'center' },
  countControlSpacer: { width: 60 },
  graphTotalContainer: { alignItems: 'flex-end', minWidth: 70 },
  graphTotalLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  graphTotalValue: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
