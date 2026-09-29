import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const dockWidth = Math.min(width - 48, 460);
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
          start: (width - dockWidth) / 2,
          end: undefined,
          width: dockWidth,
          bottom: insets.bottom + (Platform.OS === 'ios' ? 6 : 8),
          height: 72,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          ...theme.shadow.soft,
        },
        tabBarBackground: () => (
          <GlassSurface style={[StyleSheet.absoluteFill, { borderRadius: 28 }]} intensity={60} />
        ),
        tabBarItemStyle: { paddingTop: 5, paddingBottom: 5 },
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.iconSeat, focused && { backgroundColor: theme.colors.inkPrimary }]}>
            <Feather name={ICONS[route.name]} size={20} color={focused ? theme.colors.surface : color} />
          </View>
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

const styles = StyleSheet.create({
  iconSeat: { width: 38, height: 34, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
