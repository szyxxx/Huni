import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.inkPrimary,
        tabBarInactiveTintColor: theme.colors.inkSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom + (Platform.OS === 'ios' ? 6 : 8),
          height: 68,
          borderRadius: 26,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          ...theme.shadow.soft,
        },
        tabBarBackground: () => (
          <GlassSurface style={[StyleSheet.absoluteFill, { borderRadius: 26 }]} intensity={60} />
        ),
        tabBarItemStyle: { paddingTop: 7, paddingBottom: 5 },
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
