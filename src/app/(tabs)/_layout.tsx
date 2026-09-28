import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';

const ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  index: 'home',
  search: 'search',
  saved: 'heart',
  profile: 'user',
};

const LABELS: Record<string, string> = {
  index: 'Beranda',
  search: 'Cari',
  saved: 'Tersimpan',
  profile: 'Profil',
};

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.inkPrimary,
        tabBarInactiveTintColor: theme.colors.inkTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Platform.select({ ios: 28, default: 18 }),
          height: 64,
          borderRadius: 24,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarBackground: () => (
          <GlassSurface style={StyleSheet.absoluteFill} intensity={50} />
        ),
        tabBarItemStyle: { paddingTop: 10 },
        tabBarIcon: ({ color, focused }) => (
          <Feather name={ICONS[route.name]} size={20} color={color} style={{ opacity: focused ? 1 : 0.85 }} />
        ),
        tabBarLabel: LABELS[route.name],
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
