import React, { useCallback, useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, Image, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from './utils/theme';
import TrackingScreen from './screens/TrackingScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatsScreen from './screens/StatsScreen';
import ActivityDetailScreen from './screens/ActivityDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import { TrackIcon, CalendarIcon, StatsIcon, SettingsIcon } from './components/Icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Custom header with textured background and circular app icon
function CustomHeader({ title, theme, isDark, username }) {
  const displayTitle = username ? `${username}'s ${title}` : title;
  return (
    <View style={headerStyles.container}>
      {/* Textured gradient background */}
      <LinearGradient
        colors={isDark 
          ? ['#1a2f1a', '#243524', '#1e2d1e'] 
          : ['#2d5a2d', '#3d6b3d', '#2e5c2e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={headerStyles.gradient}
      />
      {/* Subtle noise texture overlay */}
      <View style={headerStyles.textureOverlay} />
      
      {/* Content */}
      <View style={headerStyles.content}>
        {/* Circular app icon */}
        <View style={headerStyles.iconContainer}>
          <Image 
            source={require('./assets/icon.png')} 
            style={headerStyles.icon}
          />
        </View>
        {/* Title */}
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
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.08,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
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
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },
});

function TabNavigator() {
  const { theme, isDark, username } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.iconActive,
        tabBarInactiveTintColor: theme.icon,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 4,
        },
        header: () => <CustomHeader title={route.name} theme={theme} isDark={isDark} username={username} />,
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
  const { theme, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={isDark ? '#1a2f1a' : '#2d5a2d'}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: '#fff',
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
  const { isLoaded: themeLoaded, theme } = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded && themeLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplash();
  }, [fontsLoaded, themeLoaded]);

  if (!fontsLoaded || !themeLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
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
