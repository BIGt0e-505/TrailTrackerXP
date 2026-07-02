import React, { useCallback, useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, Image, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from './utils/theme';
import { COLORS, SPLASH_BG } from './src/theme/colors';
import { initFileStorage } from './utils/storage';
import TrackingScreen from './screens/TrackingScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatsScreen from './screens/StatsScreen';
import XPScreen from './screens/XPScreen';
import ActivityDetailScreen from './screens/ActivityDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import { TrackIcon, CalendarIcon, StatsIcon, SettingsIcon } from './components/Icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Custom header -- TubePulse-style dark with accent
function CustomHeader({ title, username }) {
  const displayTitle = username ? `${username}'s ${title}` : title;
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.content}>
        <View style={headerStyles.iconContainer}>
          <Image
            source={require('./assets/icon.png')}
            style={headerStyles.icon}
          />
        </View>
        <Text style={[headerStyles.title, username && { fontSize: 22 }]} numberOfLines={1}>
          {displayTitle}
        </Text>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: COLORS.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: -2,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: -1,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
});

function TabNavigator() {
  const { username } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textDim,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 4,
        },
        header: () => <CustomHeader title={route.name} username={username} />,
      })}
    >
      <Tab.Screen
        name="Track"
        component={TrackingScreen}
        options={{
          tabBarIcon: ({ color }) => <TrackIcon size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color }) => <CalendarIcon size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="XP"
        component={XPScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{
              color,
              fontFamily: 'Inter_700Bold',
              fontSize: focused ? 24 : 22,
              lineHeight: 28,
              marginTop: 4,
            }}>
              XP
            </Text>
          ),
          tabBarLabel: '',
          tabBarAccessibilityLabel: 'XP',
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color }) => <StatsIcon size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <SettingsIcon size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: COLORS.accent,
      background: COLORS.bg,
      card: COLORS.surface,
      text: COLORS.text,
      border: COLORS.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.bg}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.surface,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: COLORS.border,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ActivityDetail"
          component={ActivityDetailScreen}
          options={{
            title: 'Activity Details',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const { isLoaded: themeLoaded } = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function initialize() {
      await initFileStorage();

      if (fontsLoaded && themeLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    initialize();
  }, [fontsLoaded, themeLoaded]);

  if (!fontsLoaded || !themeLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
