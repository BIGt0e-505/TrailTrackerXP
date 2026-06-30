import AsyncStorage from '@react-native-async-storage/async-storage';

const GAMIFICATION_KEY = '@trail_tracker_gamification';
const SELECTED_CHALLENGE_KEY = '@trail_tracker_selected_challenge';
const CHALLENGE_REWARDS_KEY = '@trail_tracker_challenge_rewards';
export const STATS_CUTOFF_DATE_KEY = '@trail_tracker_stats_cutoff_date';

// Helper to get cutoff date
export const getStatsCutoffDate = async () => {
  try {
    const cutoff = await AsyncStorage.getItem(STATS_CUTOFF_DATE_KEY);
    return cutoff ? new Date(cutoff) : null;
  } catch (e) {
    return null;
  }
};

// Helper to set cutoff date
export const setStatsCutoffDate = async (date) => {
  try {
    if (date) {
      await AsyncStorage.setItem(STATS_CUTOFF_DATE_KEY, date.toISOString());
    } else {
      await AsyncStorage.removeItem(STATS_CUTOFF_DATE_KEY);
    }
    return true;
  } catch (e) {
    console.error('Error saving cutoff date:', e);
    return false;
  }
};

// Helper to filter activities by cutoff date
export const filterActivitiesByCutoff = (activities, cutoffDate) => {
  if (!cutoffDate) return activities;
  return activities.filter(a => new Date(a.timestamp) >= cutoffDate);
};

// Helper to calculate walking distance in last 365 days
const getWalkingDistanceLast365Days = (activities) => {
  const now = new Date();
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  return activities
    .filter(a => a.type === 'walking' && new Date(a.timestamp) >= yearAgo)
    .reduce((sum, a) => sum + (a.distance || 0), 0);
};

// Achievement definitions - separated into walking, biking (mountain biking focused), and general
export const ACHIEVEMENTS = {
  // ========== GENERAL ACHIEVEMENTS ==========
  first_activity: {
    id: 'first_activity',
    name: 'Getting Started',
    description: 'Complete your first activity',
    icon: '🌟',
    category: 'general',
    check: (stats) => stats.totalActivities >= 1,
  },
  ten_activities: {
    id: 'ten_activities',
    name: 'Regular',
    description: 'Complete 10 activities',
    icon: '🔟',
    category: 'general',
    check: (stats) => stats.totalActivities >= 10,
  },
  twentyfive_activities: {
    id: 'twentyfive_activities',
    name: 'Committed',
    description: 'Complete 25 activities',
    icon: '✨',
    category: 'general',
    check: (stats) => stats.totalActivities >= 25,
  },
  fifty_activities: {
    id: 'fifty_activities',
    name: 'Dedicated',
    description: 'Complete 50 activities',
    icon: '⭐',
    category: 'general',
    check: (stats) => stats.totalActivities >= 50,
  },
  hundred_activities: {
    id: 'hundred_activities',
    name: 'Centurion',
    description: 'Complete 100 activities',
    icon: '💫',
    category: 'general',
    check: (stats) => stats.totalActivities >= 100,
  },
  both_types: {
    id: 'both_types',
    name: 'All-Rounder',
    description: 'Complete both a walk and a bike ride',
    icon: '🎭',
    category: 'general',
    check: (stats) => stats.walkingActivities >= 1 && stats.bikingActivities >= 1,
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Start an activity before 7am',
    icon: '🌅',
    category: 'general',
    check: (stats, activity) => {
      if (!activity) return false;
      const hour = new Date(activity.timestamp).getHours();
      return hour < 7;
    },
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Start an activity after 9pm',
    icon: '🦉',
    category: 'general',
    check: (stats, activity) => {
      if (!activity) return false;
      const hour = new Date(activity.timestamp).getHours();
      return hour >= 21;
    },
  },
  hour_long: {
    id: 'hour_long',
    name: 'Hour Power',
    description: 'Complete an activity lasting over 1 hour',
    icon: '⏱️',
    category: 'general',
    check: (stats, activity) => activity && activity.duration >= 3600,
  },
  two_hour: {
    id: 'two_hour',
    name: 'Endurance',
    description: 'Complete an activity lasting over 2 hours',
    icon: '⏳',
    category: 'general',
    check: (stats, activity) => activity && activity.duration >= 7200,
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete activities on both Saturday and Sunday',
    icon: '🎉',
    category: 'general',
    check: (stats) => stats.hasWeekendPair,
  },
  
  // ========== STREAK ACHIEVEMENTS ==========
  three_day_streak: {
    id: 'three_day_streak',
    name: 'Hat Trick',
    description: 'Activity 3 days in a row',
    icon: '🔥',
    category: 'streak',
    check: (stats) => stats.currentStreak >= 3,
  },
  seven_day_streak: {
    id: 'seven_day_streak',
    name: 'Week Warrior',
    description: 'Activity 7 days in a row',
    icon: '🔥🔥',
    category: 'streak',
    check: (stats) => stats.currentStreak >= 7,
  },
  fourteen_day_streak: {
    id: 'fourteen_day_streak',
    name: 'Fortnight Force',
    description: 'Activity 14 days in a row',
    icon: '💪',
    category: 'streak',
    check: (stats) => stats.currentStreak >= 14,
  },
  thirty_day_streak: {
    id: 'thirty_day_streak',
    name: 'Unstoppable',
    description: 'Activity 30 days in a row',
    icon: '🔥🔥🔥',
    category: 'streak',
    check: (stats) => stats.currentStreak >= 30,
  },
  
  // ========== WALKING ACHIEVEMENTS ==========
  // Distance - single activity
  walk_first_km: {
    id: 'walk_first_km',
    name: 'First Steps',
    description: 'Walk your first kilometre',
    icon: '👟',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && activity.distance >= 1,
  },
  walk_3km: {
    id: 'walk_3km',
    name: 'Morning Stroll',
    description: 'Walk 3km in one activity',
    icon: '🚶',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && activity.distance >= 3,
  },
  walk_5km: {
    id: 'walk_5km',
    name: 'Park Runner',
    description: 'Walk 5km in one activity',
    icon: '🏃',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && activity.distance >= 5,
  },
  walk_10km: {
    id: 'walk_10km',
    name: 'Rambler',
    description: 'Walk 10km in one activity',
    icon: '🥾',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && activity.distance >= 10,
  },
  walk_half_marathon: {
    id: 'walk_half_marathon',
    name: 'Half Marathon Walker',
    description: 'Walk 21km in one activity',
    icon: '🏅',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && activity.distance >= 21,
  },
  walk_marathon: {
    id: 'walk_marathon',
    name: 'Marathon Walker',
    description: 'Walk 42km in one activity',
    icon: '🏆',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && activity.distance >= 42,
  },
  
  // Distance - cumulative walking
  walk_total_10km: {
    id: 'walk_total_10km',
    name: 'Walking Novice',
    description: 'Walk 10km total',
    icon: '👣',
    category: 'walking',
    check: (stats) => stats.walkingDistance >= 10,
  },
  walk_total_50km: {
    id: 'walk_total_50km',
    name: 'Trail Finder',
    description: 'Walk 50km total',
    icon: '🗺️',
    category: 'walking',
    check: (stats) => stats.walkingDistance >= 50,
  },
  walk_total_100km: {
    id: 'walk_total_100km',
    name: 'Walking Century',
    description: 'Walk 100km total',
    icon: '💯',
    category: 'walking',
    check: (stats) => stats.walkingDistance >= 100,
  },
  walk_total_250km: {
    id: 'walk_total_250km',
    name: 'Path Pioneer',
    description: 'Walk 250km total',
    icon: '🧭',
    category: 'walking',
    check: (stats) => stats.walkingDistance >= 250,
  },
  walk_total_500km: {
    id: 'walk_total_500km',
    name: 'Walking Legend',
    description: 'Walk 500km total',
    icon: '🌟',
    category: 'walking',
    check: (stats) => stats.walkingDistance >= 500,
  },
  walk_total_1000km: {
    id: 'walk_total_1000km',
    name: 'Thousand Mile Walker',
    description: 'Walk 1000km total',
    icon: '👑',
    category: 'walking',
    check: (stats) => stats.walkingDistance >= 1000,
  },
  
  // MAJOR ACHIEVEMENT - Rolling 365-day distance
  walk_1000_miles_365_days: {
    id: 'walk_1000_miles_365_days',
    name: '🏆 1000 Mile Year',
    description: 'Walk 1000 miles (1609km) within a 365-day period',
    icon: '🏆',
    category: 'walking',
    isMajor: true,
    // 1000 miles = 1609.34 km
    check: (stats) => (stats.walkingDistanceLast365Days || 0) >= 1609.34,
  },
  
  // Walking elevation
  walk_climb_50m: {
    id: 'walk_climb_50m',
    name: 'Hill Walker',
    description: 'Climb 50m elevation on a walk',
    icon: '⛰️',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && (activity.elevationGain || 0) >= 50,
  },
  walk_climb_100m: {
    id: 'walk_climb_100m',
    name: 'Peak Seeker',
    description: 'Climb 100m elevation on a walk',
    icon: '🏔️',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && (activity.elevationGain || 0) >= 100,
  },
  walk_climb_250m: {
    id: 'walk_climb_250m',
    name: 'Mountain Hiker',
    description: 'Climb 250m elevation on a walk',
    icon: '🗻',
    category: 'walking',
    check: (stats, activity) => activity && activity.type === 'walking' && (activity.elevationGain || 0) >= 250,
  },
  walk_total_elevation_500m: {
    id: 'walk_total_elevation_500m',
    name: 'Upward Bound',
    description: 'Gain 500m total elevation walking',
    icon: '📈',
    category: 'walking',
    check: (stats) => stats.walkingElevation >= 500,
  },
  walk_total_elevation_2000m: {
    id: 'walk_total_elevation_2000m',
    name: 'Summit Collector',
    description: 'Gain 2000m total elevation walking',
    icon: '🏔️',
    category: 'walking',
    check: (stats) => stats.walkingElevation >= 2000,
  },
  
  // Walking activity count
  walk_5_activities: {
    id: 'walk_5_activities',
    name: 'Regular Walker',
    description: 'Complete 5 walks',
    icon: '🚶‍♂️',
    category: 'walking',
    check: (stats) => stats.walkingActivities >= 5,
  },
  walk_20_activities: {
    id: 'walk_20_activities',
    name: 'Walking Habit',
    description: 'Complete 20 walks',
    icon: '🚶‍♀️',
    category: 'walking',
    check: (stats) => stats.walkingActivities >= 20,
  },
  walk_50_activities: {
    id: 'walk_50_activities',
    name: 'Walking Enthusiast',
    description: 'Complete 50 walks',
    icon: '🥇',
    category: 'walking',
    check: (stats) => stats.walkingActivities >= 50,
  },
  
  // ========== MOUNTAIN BIKING ACHIEVEMENTS ==========
  // Distance - single activity (tuned for MTB - shorter distances than road)
  mtb_first_km: {
    id: 'mtb_first_km',
    name: 'First Pedal',
    description: 'Ride your first kilometre',
    icon: '🚲',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && activity.distance >= 1,
  },
  mtb_3km: {
    id: 'mtb_3km',
    name: 'Trail Taster',
    description: 'Ride 3km in one activity',
    icon: '🌲',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && activity.distance >= 3,
  },
  mtb_5km: {
    id: 'mtb_5km',
    name: 'Trail Rider',
    description: 'Ride 5km in one activity',
    icon: '🚵',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && activity.distance >= 5,
  },
  mtb_10km: {
    id: 'mtb_10km',
    name: 'Trail Blazer',
    description: 'Ride 10km in one activity',
    icon: '🔥',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && activity.distance >= 10,
  },
  mtb_20km: {
    id: 'mtb_20km',
    name: 'Enduro Rider',
    description: 'Ride 20km in one activity',
    icon: '💪',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && activity.distance >= 20,
  },
  mtb_30km: {
    id: 'mtb_30km',
    name: 'Epic Ride',
    description: 'Ride 30km in one activity',
    icon: '🏆',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && activity.distance >= 30,
  },
  
  // Distance - cumulative biking
  mtb_total_10km: {
    id: 'mtb_total_10km',
    name: 'Bike Beginner',
    description: 'Ride 10km total',
    icon: '🎯',
    category: 'biking',
    check: (stats) => stats.bikingDistance >= 10,
  },
  mtb_total_50km: {
    id: 'mtb_total_50km',
    name: 'Trail Explorer',
    description: 'Ride 50km total',
    icon: '🗺️',
    category: 'biking',
    check: (stats) => stats.bikingDistance >= 50,
  },
  mtb_total_100km: {
    id: 'mtb_total_100km',
    name: 'MTB Century',
    description: 'Ride 100km total',
    icon: '💯',
    category: 'biking',
    check: (stats) => stats.bikingDistance >= 100,
  },
  mtb_total_250km: {
    id: 'mtb_total_250km',
    name: 'Trail Master',
    description: 'Ride 250km total',
    icon: '🧭',
    category: 'biking',
    check: (stats) => stats.bikingDistance >= 250,
  },
  mtb_total_500km: {
    id: 'mtb_total_500km',
    name: 'MTB Legend',
    description: 'Ride 500km total',
    icon: '🌟',
    category: 'biking',
    check: (stats) => stats.bikingDistance >= 500,
  },
  mtb_total_1000km: {
    id: 'mtb_total_1000km',
    name: 'Thousand Mile Rider',
    description: 'Ride 1000km total',
    icon: '👑',
    category: 'biking',
    check: (stats) => stats.bikingDistance >= 1000,
  },
  
  // MTB Climbing achievements (key for mountain biking)
  mtb_climb_25m: {
    id: 'mtb_climb_25m',
    name: 'Hill Finder',
    description: 'Climb 25m elevation on a ride',
    icon: '📈',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationGain || 0) >= 25,
  },
  mtb_climb_50m: {
    id: 'mtb_climb_50m',
    name: 'Climb Time',
    description: 'Climb 50m elevation on a ride',
    icon: '⬆️',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationGain || 0) >= 50,
  },
  mtb_climb_100m: {
    id: 'mtb_climb_100m',
    name: 'Hill Crusher',
    description: 'Climb 100m elevation on a ride',
    icon: '⛰️',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationGain || 0) >= 100,
  },
  mtb_climb_200m: {
    id: 'mtb_climb_200m',
    name: 'Mountain Biker',
    description: 'Climb 200m elevation on a ride',
    icon: '🏔️',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationGain || 0) >= 200,
  },
  mtb_climb_500m: {
    id: 'mtb_climb_500m',
    name: 'Alpine Assault',
    description: 'Climb 500m elevation on a ride',
    icon: '🗻',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationGain || 0) >= 500,
  },
  
  // MTB Descent achievements (bombhole territory!)
  mtb_drop_5m: {
    id: 'mtb_drop_5m',
    name: 'First Drop',
    description: 'Descend 5m elevation loss on a ride',
    icon: '⬇️',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationLoss || 0) >= 5,
  },
  mtb_drop_10m: {
    id: 'mtb_drop_10m',
    name: 'Bombhole Hunter',
    description: 'Descend 10m elevation loss on a ride',
    icon: '💣',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationLoss || 0) >= 10,
  },
  mtb_drop_25m: {
    id: 'mtb_drop_25m',
    name: 'Gravity Rider',
    description: 'Descend 25m elevation loss on a ride',
    icon: '🎢',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationLoss || 0) >= 25,
  },
  mtb_drop_50m: {
    id: 'mtb_drop_50m',
    name: 'Downhill Demon',
    description: 'Descend 50m elevation loss on a ride',
    icon: '👹',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationLoss || 0) >= 50,
  },
  mtb_drop_100m: {
    id: 'mtb_drop_100m',
    name: 'Descent King',
    description: 'Descend 100m elevation loss on a ride',
    icon: '👑',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationLoss || 0) >= 100,
  },
  mtb_drop_200m: {
    id: 'mtb_drop_200m',
    name: 'Freefall Master',
    description: 'Descend 200m elevation loss on a ride',
    icon: '🦅',
    category: 'biking',
    check: (stats, activity) => activity && activity.type === 'biking' && (activity.elevationLoss || 0) >= 200,
  },
  
  // Total elevation gained biking
  mtb_total_climb_250m: {
    id: 'mtb_total_climb_250m',
    name: 'Climbing Legs',
    description: 'Gain 250m total elevation biking',
    icon: '🦵',
    category: 'biking',
    check: (stats) => stats.bikingElevation >= 250,
  },
  mtb_total_climb_1000m: {
    id: 'mtb_total_climb_1000m',
    name: 'Elevation Hunter',
    description: 'Gain 1000m total elevation biking',
    icon: '🎿',
    category: 'biking',
    check: (stats) => stats.bikingElevation >= 1000,
  },
  mtb_total_climb_5000m: {
    id: 'mtb_total_climb_5000m',
    name: 'Everest Equivalent',
    description: 'Gain 5000m total elevation biking',
    icon: '🏔️',
    category: 'biking',
    check: (stats) => stats.bikingElevation >= 5000,
  },
  
  // Total descent biking
  mtb_total_descent_250m: {
    id: 'mtb_total_descent_250m',
    name: 'Descent Lover',
    description: 'Descend 250m total on bike',
    icon: '📉',
    category: 'biking',
    check: (stats) => stats.bikingDescent >= 250,
  },
  mtb_total_descent_1000m: {
    id: 'mtb_total_descent_1000m',
    name: 'Drop Zone',
    description: 'Descend 1000m total on bike',
    icon: '🎯',
    category: 'biking',
    check: (stats) => stats.bikingDescent >= 1000,
  },
  mtb_total_descent_5000m: {
    id: 'mtb_total_descent_5000m',
    name: 'Gravity Addict',
    description: 'Descend 5000m total on bike',
    icon: '🌋',
    category: 'biking',
    check: (stats) => stats.bikingDescent >= 5000,
  },
  
  // Biking activity count
  mtb_5_activities: {
    id: 'mtb_5_activities',
    name: 'Regular Rider',
    description: 'Complete 5 rides',
    icon: '🚴',
    category: 'biking',
    check: (stats) => stats.bikingActivities >= 5,
  },
  mtb_20_activities: {
    id: 'mtb_20_activities',
    name: 'Riding Habit',
    description: 'Complete 20 rides',
    icon: '🚴‍♂️',
    category: 'biking',
    check: (stats) => stats.bikingActivities >= 20,
  },
  mtb_50_activities: {
    id: 'mtb_50_activities',
    name: 'MTB Enthusiast',
    description: 'Complete 50 rides',
    icon: '🥇',
    category: 'biking',
    check: (stats) => stats.bikingActivities >= 50,
  },
  mtb_100_activities: {
    id: 'mtb_100_activities',
    name: 'Trail Veteran',
    description: 'Complete 100 rides',
    icon: '🏅',
    category: 'biking',
    check: (stats) => stats.bikingActivities >= 100,
  },
};

// Level definitions
export const LEVELS = [
  { level: 1, name: 'Trail Beginner', xpRequired: 0, icon: '🌱' },
  { level: 2, name: 'Trail Walker', xpRequired: 100, icon: '🚶' },
  { level: 3, name: 'Trail Trekker', xpRequired: 250, icon: '🥾' },
  { level: 4, name: 'Trail Runner', xpRequired: 500, icon: '🏃' },
  { level: 5, name: 'Trail Blazer', xpRequired: 1000, icon: '🔥' },
  { level: 6, name: 'Trail Master', xpRequired: 2000, icon: '⭐' },
  { level: 7, name: 'Trail Champion', xpRequired: 3500, icon: '🏆' },
  { level: 8, name: 'Trail Legend', xpRequired: 5000, icon: '👑' },
  { level: 9, name: 'Trail Hero', xpRequired: 7500, icon: '🦸' },
  { level: 10, name: 'Trail God', xpRequired: 10000, icon: '⚡' },
];

// Distance landmarks for fun comparisons (in km)
export const LANDMARKS = [
  { distance: 1, name: 'a football pitch', icon: '⚽' },
  { distance: 5, name: 'the height of 5 Eiffel Towers', icon: '🗼' },
  { distance: 10, name: 'across Central Park', icon: '🌳' },
  { distance: 21.1, name: 'a half marathon', icon: '🏃' },
  { distance: 42.2, name: 'a full marathon', icon: '🏅' },
  { distance: 50, name: 'the English Channel width', icon: '🌊' },
  { distance: 100, name: 'the length of 1000 football pitches', icon: '💯' },
  { distance: 160, name: 'the Great Wall section', icon: '🧱' },
  { distance: 344, name: 'London to Paris', icon: '🇫🇷' },
  { distance: 500, name: 'the length of Ireland', icon: '☘️' },
  { distance: 774, name: 'Land\'s End to John o\' Groats', icon: '🇬🇧' },
  { distance: 1000, name: 'across France', icon: '🥖' },
  { distance: 2000, name: 'the length of Japan', icon: '🗾' },
  { distance: 5000, name: 'across the USA', icon: '🇺🇸' },
];

// Challenge templates
const CHALLENGE_TEMPLATES = [
  { id: 'daily_distance', type: 'distance', period: 'daily', targets: [2, 3, 5], unit: 'km', description: 'Walk/bike {target}km today' },
  { id: 'weekly_distance', type: 'distance', period: 'weekly', targets: [10, 15, 20, 25], unit: 'km', description: 'Travel {target}km this week' },
  { id: 'daily_activity', type: 'count', period: 'daily', targets: [1], unit: 'activities', description: 'Complete an activity today' },
  { id: 'weekly_activities', type: 'count', period: 'weekly', targets: [3, 4, 5], unit: 'activities', description: 'Complete {target} activities this week' },
  { id: 'streak', type: 'streak', period: 'weekly', targets: [3, 5, 7], unit: 'days', description: 'Keep a {target}-day streak going' },
  { id: 'long_activity', type: 'single_distance', period: 'weekly', targets: [3, 5, 7], unit: 'km', description: 'Complete a single {target}km+ activity' },
  { id: 'duration', type: 'duration', period: 'weekly', targets: [30, 45, 60], unit: 'mins', description: 'Be active for {target} minutes in one go' },
];

// Default gamification state
const defaultGamification = {
  xp: 0,
  level: 1,
  unlockedAchievements: [],
  newAchievements: [], // achievements unlocked but not yet seen
  challenges: [],
  lastChallengeGeneration: null,
  stats: {
    totalDistance: 0,
    totalActivities: 0,
    totalElevation: 0,
    // Separate walking stats
    walkingActivities: 0,
    walkingDistance: 0,
    walkingElevation: 0,
    // Separate biking stats  
    bikingActivities: 0,
    bikingDistance: 0,
    bikingElevation: 0,
    bikingDescent: 0,
    // Streaks
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    hasWeekendPair: false,
    weekendDays: [],
  },
};

// Load gamification data
export const loadGamification = async () => {
  try {
    const data = await AsyncStorage.getItem(GAMIFICATION_KEY);
    if (data) {
      return { ...defaultGamification, ...JSON.parse(data) };
    }
  } catch (e) {
    console.log('Error loading gamification:', e);
  }
  return defaultGamification;
};

// Save gamification data
export const saveGamification = async (data) => {
  try {
    await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
  } catch (e) {
    console.log('Error saving gamification:', e);
  }
};

// Calculate XP for an activity
export const calculateXP = (activity) => {
  let xp = 0;
  
  // Base XP for completing activity
  xp += 10;
  
  // XP for distance (10 XP per km)
  xp += Math.floor(activity.distance * 10);
  
  // XP for duration (1 XP per minute)
  xp += Math.floor(activity.duration / 60);
  
  // XP for elevation (1 XP per 10m gained)
  xp += Math.floor((activity.elevationGain || 0) / 10);
  
  // Bonus for long activities
  if (activity.distance >= 10) xp += 25;
  if (activity.duration >= 3600) xp += 25;
  
  return xp;
};

// Get level for XP amount
export const getLevelForXP = (xp) => {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

// Get XP progress to next level
export const getXPProgress = (xp) => {
  const currentLevel = getLevelForXP(xp);
  const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
  const nextLevel = LEVELS[currentLevelIndex + 1];
  
  if (!nextLevel) {
    return { current: xp, required: currentLevel.xpRequired, progress: 1, nextLevel: null };
  }
  
  const xpIntoLevel = xp - currentLevel.xpRequired;
  const xpForNextLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  
  return {
    current: xpIntoLevel,
    required: xpForNextLevel,
    progress: xpIntoLevel / xpForNextLevel,
    nextLevel,
  };
};

// Get distance comparison
export const getDistanceComparison = (totalKm) => {
  // Find the landmark we've passed
  let passedLandmark = null;
  let nextLandmark = null;
  
  for (let i = 0; i < LANDMARKS.length; i++) {
    if (totalKm >= LANDMARKS[i].distance) {
      passedLandmark = LANDMARKS[i];
      nextLandmark = LANDMARKS[i + 1] || null;
    } else {
      if (!nextLandmark) nextLandmark = LANDMARKS[i];
      break;
    }
  }
  
  // Fun comparisons
  const footballPitches = Math.floor(totalKm * 10); // ~100m per pitch
  const busLengths = Math.floor(totalKm * 100); // ~10m per bus
  
  return {
    passedLandmark,
    nextLandmark,
    progress: nextLandmark ? (totalKm / nextLandmark.distance) : 1,
    footballPitches,
    busLengths,
  };
};

// Calculate streak from activities
export const calculateStreak = (activities, lastActivityDate) => {
  if (!activities || activities.length === 0) return 0;
  
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Get unique activity dates
  const activityDates = new Set(
    sortedActivities.map(a => {
      const d = new Date(a.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  
  // Check if there's an activity today or yesterday (streak can continue)
  const hasToday = activityDates.has(today.getTime());
  const hasYesterday = activityDates.has(yesterday.getTime());
  
  if (!hasToday && !hasYesterday) return 0;
  
  // Count consecutive days
  let streak = 0;
  let checkDate = hasToday ? today : yesterday;
  
  while (activityDates.has(checkDate.getTime())) {
    streak++;
    checkDate = new Date(checkDate);
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
};

// Check for weekend pair (Saturday + Sunday activities in same week)
export const checkWeekendPair = (activities) => {
  const weekends = {};
  
  activities.forEach(a => {
    const date = new Date(a.timestamp);
    const day = date.getDay();
    
    if (day === 0 || day === 6) {
      // Get week identifier (start of week)
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - day);
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.getTime();
      
      if (!weekends[weekKey]) weekends[weekKey] = new Set();
      weekends[weekKey].add(day);
    }
  });
  
  // Check if any week has both Saturday (6) and Sunday (0)
  return Object.values(weekends).some(days => days.has(0) && days.has(6));
};

// Generate challenges
export const generateChallenges = (currentStats) => {
  const challenges = [];
  const now = new Date();
  
  // Pick 3 random challenge templates
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  
  selected.forEach((template, index) => {
    const target = template.targets[Math.floor(Math.random() * template.targets.length)];
    const description = template.description.replace('{target}', target);
    
    challenges.push({
      id: `${template.id}_${now.getTime()}_${index}`,
      templateId: template.id,
      type: template.type,
      period: template.period,
      target,
      unit: template.unit,
      description,
      progress: 0,
      completed: false,
      createdAt: now.toISOString(),
      expiresAt: template.period === 'daily' 
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
        : new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay())).toISOString(),
    });
  });
  
  return challenges;
};

// Update challenge progress
export const updateChallengeProgress = (challenges, activities, currentStreak) => {
  const now = new Date();
  
  return challenges.map(challenge => {
    if (challenge.completed) return challenge;
    
    // Check if expired
    if (new Date(challenge.expiresAt) < now) {
      return { ...challenge, expired: true };
    }
    
    // Filter activities for this challenge period
    const periodStart = challenge.period === 'daily'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    
    const periodActivities = activities.filter(a => 
      new Date(a.timestamp) >= periodStart
    );
    
    let progress = 0;
    
    switch (challenge.type) {
      case 'distance':
        progress = periodActivities.reduce((sum, a) => sum + a.distance, 0);
        break;
      case 'count':
        progress = periodActivities.length;
        break;
      case 'streak':
        progress = currentStreak;
        break;
      case 'single_distance':
        progress = Math.max(...periodActivities.map(a => a.distance), 0);
        break;
      case 'duration':
        progress = Math.max(...periodActivities.map(a => a.duration / 60), 0);
        break;
    }
    
    const completed = progress >= challenge.target;
    
    return { ...challenge, progress, completed };
  });
};

// ─── Selectable Challenges ──────────────────────────────────────

// Bonus XP by difficulty (target magnitude)
const getBonusXpForChallenge = (template, target) => {
  const maxTarget = Math.max(...template.targets);
  const ratio = target / maxTarget;
  if (ratio >= 0.8) return 250;
  if (ratio >= 0.5) return 100;
  return 50;
};

// Get all available challenge templates (for selection UI)
export const getChallengeTemplates = () => {
  return CHALLENGE_TEMPLATES.map(template => ({
    templateId: template.id,
    type: template.type,
    period: template.period,
    targets: template.targets,
    unit: template.unit,
    description: template.description,
  }));
};

// Select a challenge — sets baseline and selectedAt
export const selectChallenge = async (templateId, target) => {
  const template = CHALLENGE_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Unknown challenge template: ' + templateId);
  
  if (!target || !template.targets.includes(target)) {
    target = template.targets[Math.floor(Math.random() * template.targets.length)];
  }
  
  const bonusXp = getBonusXpForChallenge(template, target);
  const description = template.description.replace('{target}', target);
  
  const selectedChallenge = {
    templateId: template.id,
    description,
    type: template.type,
    period: template.period,
    target,
    unit: template.unit,
    bonusXp,
    selectedAt: new Date().toISOString(),
    baseline: { distance: 0, duration: 0, elevation: 0, activityCount: 0 },
    completedAt: null,
    bonusXpAwarded: false,
  };
  
  await AsyncStorage.setItem(SELECTED_CHALLENGE_KEY, JSON.stringify(selectedChallenge));
  return selectedChallenge;
};

// Get the currently selected challenge (or null)
export const getSelectedChallenge = async () => {
  try {
    const data = await AsyncStorage.getItem(SELECTED_CHALLENGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.log('Error loading selected challenge:', e);
    return null;
  }
};

// Abandon the current selected challenge
export const abandonSelectedChallenge = async () => {
  await AsyncStorage.removeItem(SELECTED_CHALLENGE_KEY);
};

// Calculate progress for a selected challenge
// Only counts activities with timestamp >= selectedAt
export const getSelectedChallengeProgress = (selectedChallenge, activities, currentStreak) => {
  if (!selectedChallenge) return null;
  
  const selectedAt = new Date(selectedChallenge.selectedAt);
  
  // Filter activities since selection point
  const relevantActivities = activities.filter(a => {
    const activityDate = new Date(a.date || a.timestamp || 0);
    return activityDate >= selectedAt;
  });
  
  let progress = 0;
  
  switch (selectedChallenge.type) {
    case 'distance':
      progress = relevantActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
      break;
    case 'count':
      progress = relevantActivities.length;
      break;
    case 'streak':
      progress = currentStreak || 0;
      break;
    case 'single_distance':
      progress = relevantActivities.length > 0
        ? Math.max(...relevantActivities.map(a => a.distance || 0))
        : 0;
      break;
    case 'duration':
      progress = relevantActivities.length > 0
        ? Math.max(...relevantActivities.map(a => (a.duration || 0) / 60))
        : 0;
      break;
  }
  
  const completed = progress >= selectedChallenge.target;
  return {
    ...selectedChallenge,
    progress,
    completed,
  };
};

// Get challenge reward ledger
export const getChallengeRewards = async () => {
  try {
    const data = await AsyncStorage.getItem(CHALLENGE_REWARDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log('Error loading challenge rewards:', e);
    return [];
  }
};

// Award bonus XP for completing a selected challenge
// Returns the updated gamification state and whether the award was made
export const awardSelectedChallengeBonus = async (gamification, selectedChallenge) => {
  if (!selectedChallenge || selectedChallenge.bonusXpAwarded) {
    return { gamification, awarded: false };
  }
  
  // Check if already in reward ledger
  const rewards = await getChallengeRewards();
  const alreadyAwarded = rewards.some(
    r => r.challengeId === selectedChallenge.templateId &&
         r.selectedAt === selectedChallenge.selectedAt
  );
  if (alreadyAwarded) {
    return { gamification, awarded: false };
  }
  
  // Award bonus XP
  gamification.xp += selectedChallenge.bonusXp;
  
  // Add to reward ledger
  const reward = {
    challengeId: selectedChallenge.templateId,
    selectedAt: selectedChallenge.selectedAt,
    awardedAt: new Date().toISOString(),
    xp: selectedChallenge.bonusXp,
    source: 'selected_challenge',
  };
  rewards.push(reward);
  await AsyncStorage.setItem(CHALLENGE_REWARDS_KEY, JSON.stringify(rewards));
  
  // Mark as awarded in selected challenge
  const updated = {
    ...selectedChallenge,
    completedAt: new Date().toISOString(),
    bonusXpAwarded: true,
  };
  await AsyncStorage.setItem(SELECTED_CHALLENGE_KEY, JSON.stringify(updated));
  
  return { gamification, awarded: true, bonusXp: selectedChallenge.bonusXp, updatedChallenge: updated };
};

// Process a new activity - update all gamification
export const processActivity = async (activity, allActivities) => {
  const gamification = await loadGamification();
  const results = {
    xpEarned: 0,
    newLevel: null,
    newAchievements: [],
    challengesCompleted: [],
  };
  
  // Calculate and add XP
  const xpEarned = calculateXP(activity);
  const oldLevel = getLevelForXP(gamification.xp);
  gamification.xp += xpEarned;
  const newLevel = getLevelForXP(gamification.xp);
  
  results.xpEarned = xpEarned;
  if (newLevel.level > oldLevel.level) {
    results.newLevel = newLevel;
  }
  
  // Update stats
  gamification.stats.totalDistance += activity.distance;
  gamification.stats.totalActivities += 1;
  gamification.stats.totalElevation += (activity.elevationGain || 0);
  
  if (activity.type === 'walking') {
    gamification.stats.walkingActivities += 1;
    gamification.stats.walkingDistance = (gamification.stats.walkingDistance || 0) + activity.distance;
    gamification.stats.walkingElevation = (gamification.stats.walkingElevation || 0) + (activity.elevationGain || 0);
  } else {
    gamification.stats.bikingActivities += 1;
    gamification.stats.bikingDistance = (gamification.stats.bikingDistance || 0) + activity.distance;
    gamification.stats.bikingElevation = (gamification.stats.bikingElevation || 0) + (activity.elevationGain || 0);
    gamification.stats.bikingDescent = (gamification.stats.bikingDescent || 0) + (activity.elevationLoss || 0);
  }
  
  // Update streak
  gamification.stats.currentStreak = calculateStreak(allActivities, activity.timestamp);
  if (gamification.stats.currentStreak > gamification.stats.longestStreak) {
    gamification.stats.longestStreak = gamification.stats.currentStreak;
  }
  gamification.stats.lastActivityDate = activity.timestamp;
  
  // Check weekend pair
  gamification.stats.hasWeekendPair = checkWeekendPair(allActivities);
  
  // Check achievements
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (!gamification.unlockedAchievements.includes(key)) {
      if (achievement.check(gamification.stats, activity)) {
        gamification.unlockedAchievements.push(key);
        gamification.newAchievements.push(key);
        results.newAchievements.push(achievement);
        
        // Bonus XP for achievements
        gamification.xp += 50;
        results.xpEarned += 50;
      }
    }
  }
  
  // Update challenges
  if (gamification.challenges.length > 0) {
    gamification.challenges = updateChallengeProgress(
      gamification.challenges, 
      allActivities,
      gamification.stats.currentStreak
    );
    
    results.challengesCompleted = gamification.challenges.filter(c => 
      c.completed && !c.rewarded
    );
    
    // Mark completed challenges as rewarded and add bonus XP
    gamification.challenges = gamification.challenges.map(c => {
      if (c.completed && !c.rewarded) {
        gamification.xp += 25;
        results.xpEarned += 25;
        return { ...c, rewarded: true };
      }
      return c;
    });
  }
  
  // Generate new challenges if needed
  const now = new Date();
  const lastGen = gamification.lastChallengeGeneration 
    ? new Date(gamification.lastChallengeGeneration)
    : null;
  
  const shouldGenerateChallenges = !lastGen || 
    (now.getDate() !== lastGen.getDate()) ||
    gamification.challenges.filter(c => !c.completed && !c.expired).length === 0;
  
  if (shouldGenerateChallenges) {
    // Remove expired/completed challenges older than 1 day
    gamification.challenges = gamification.challenges.filter(c => {
      if (c.expired || c.completed) {
        const age = now - new Date(c.createdAt);
        return age < 24 * 60 * 60 * 1000; // Keep for 24 hours for display
      }
      return true;
    });
    
    // Add new challenges
    const newChallenges = generateChallenges(gamification.stats);
    gamification.challenges = [...gamification.challenges, ...newChallenges];
    gamification.lastChallengeGeneration = now.toISOString();
  }
  
  // Check selected challenge for completion and award bonus XP
  const selectedChallenge = await getSelectedChallenge();
  if (selectedChallenge && !selectedChallenge.bonusXpAwarded) {
    const progressData = getSelectedChallengeProgress(selectedChallenge, allActivities, gamification.stats.currentStreak);
    if (progressData.completed) {
      const awardResult = await awardSelectedChallengeBonus(gamification, selectedChallenge);
      if (awardResult.awarded) {
        gamification = awardResult.gamification;
        results.xpEarned += awardResult.bonusXp;
        results.selectedChallengeCompleted = awardResult.updatedChallenge;
      }
    }
  }
  
  // Save and return
  await saveGamification(gamification);
  
  return results;
};

// Clear new achievements (after showing to user)
export const clearNewAchievements = async () => {
  const gamification = await loadGamification();
  gamification.newAchievements = [];
  await saveGamification(gamification);
};

// Reset gamification (for testing)
export const resetGamification = async () => {
  await saveGamification(defaultGamification);
};

// Recalculate all gamification from scratch based on current activities
// Called when an activity is deleted or modified
// If cutoffDate is provided, only activities on or after that date count towards stats
export const recalculateGamification = async (activities, cutoffDate = null) => {
  // Get cutoff date from storage if not provided
  if (cutoffDate === undefined) {
    cutoffDate = await getStatsCutoffDate();
  }
  
  // Filter activities by cutoff date for stats calculation
  const activitiesForStats = cutoffDate 
    ? activities.filter(a => new Date(a.timestamp) >= cutoffDate)
    : activities;
  
  // Start fresh
  const gamification = { ...defaultGamification };
  gamification.stats = { ...defaultGamification.stats };
  gamification.unlockedAchievements = [];
  gamification.newAchievements = [];
  gamification.xp = 0;
  
  // Sort activities by timestamp
  const sortedActivities = [...activitiesForStats].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  // Process each activity to rebuild stats and XP
  for (const activity of sortedActivities) {
    // Calculate XP for this activity
    gamification.xp += calculateXP(activity);
    
    // Update stats
    gamification.stats.totalDistance += activity.distance || 0;
    gamification.stats.totalActivities += 1;
    gamification.stats.totalElevation += (activity.elevationGain || 0);
    
    if (activity.type === 'walking') {
      gamification.stats.walkingActivities += 1;
      gamification.stats.walkingDistance = (gamification.stats.walkingDistance || 0) + (activity.distance || 0);
      gamification.stats.walkingElevation = (gamification.stats.walkingElevation || 0) + (activity.elevationGain || 0);
    } else {
      gamification.stats.bikingActivities += 1;
      gamification.stats.bikingDistance = (gamification.stats.bikingDistance || 0) + (activity.distance || 0);
      gamification.stats.bikingElevation = (gamification.stats.bikingElevation || 0) + (activity.elevationGain || 0);
      gamification.stats.bikingDescent = (gamification.stats.bikingDescent || 0) + (activity.elevationLoss || 0);
    }
    
    gamification.stats.lastActivityDate = activity.timestamp;
  }
  
  // Calculate rolling 365-day walking distance (for major achievement)
  // This uses ALL activities regardless of cutoff, as it's a rolling window
  gamification.stats.walkingDistanceLast365Days = getWalkingDistanceLast365Days(activities);
  
  // Calculate current streak
  gamification.stats.currentStreak = calculateStreak(activitiesForStats, new Date().toISOString());
  gamification.stats.longestStreak = Math.max(gamification.stats.currentStreak, gamification.stats.longestStreak);
  
  // Check weekend pair
  gamification.stats.hasWeekendPair = checkWeekendPair(activitiesForStats);
  
  // Check all achievements
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    // For achievements that depend on a single activity, check against each activity
    let unlocked = false;
    
    // Categories that need to check against individual activities
    const singleActivityCategories = ['walking', 'biking', 'general'];
    
    if (singleActivityCategories.includes(achievement.category)) {
      // Check against cumulative stats first (for total distance/count achievements)
      if (achievement.check(gamification.stats, null)) {
        unlocked = true;
      }
      // Also check against each activity (for single-activity achievements)
      if (!unlocked) {
        for (const activity of sortedActivities) {
          if (achievement.check(gamification.stats, activity)) {
            unlocked = true;
            break;
          }
        }
      }
    } else {
      // Cumulative achievements (streak, etc)
      unlocked = achievement.check(gamification.stats, null);
    }
    
    if (unlocked) {
      gamification.unlockedAchievements.push(key);
      // Add bonus XP for achievements - more for major achievements
      gamification.xp += achievement.isMajor ? 500 : 50;
    }
  }
  
  // Update challenges based on current activities (filtered)
  if (gamification.challenges.length > 0) {
    gamification.challenges = updateChallengeProgress(
      gamification.challenges,
      activitiesForStats,
      gamification.stats.currentStreak
    );
  }
  
  // Save the recalculated gamification
  await saveGamification(gamification);
  
  return gamification;
};
