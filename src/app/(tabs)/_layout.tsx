import React from 'react';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';

type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

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

function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const dockWidth = Math.min(width - 56, 380);

  return (
    <View pointerEvents="box-none" style={[styles.position, { bottom: insets.bottom + 8 }]}>
      <GlassSurface
        intensity={72}
        style={[
          styles.dock,
          {
            width: dockWidth,
            borderColor: theme.scheme === 'dark' ? theme.colors.borderStrong : 'rgba(255,255,255,0.85)',
            ...theme.shadow.soft,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const options = descriptors[route.key].options;
          const label = LABELS[route.name] ?? route.name;
          const icon = ICONS[route.name] ?? 'circle';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={options.tabBarButtonTestID}
              style={[styles.tab, active ? styles.activeTab : styles.inactiveTab, active && { backgroundColor: theme.colors.surfaceSoft }]}
            >
              <Feather name={icon} size={21} color={active ? theme.colors.inkPrimary : theme.colors.inkSecondary} />
              {active ? <Text numberOfLines={1} style={[styles.activeLabel, { color: theme.colors.inkPrimary }]}>{label}</Text> : null}
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { position: 'absolute', height: 64, backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  position: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  dock: { height: 62, borderRadius: 23, flexDirection: 'row', alignItems: 'center', padding: 6 },
  tab: { minHeight: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  activeTab: { flex: 1.55, gap: 8, paddingHorizontal: 12 },
  inactiveTab: { flex: 0.8 },
  activeLabel: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: -0.2 },
});
