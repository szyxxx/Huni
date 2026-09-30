import React from 'react';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';

type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  index: 'home',
  search: 'compass',
  saved: 'heart',
  profile: 'user',
};

const LABELS: Record<string, string> = {
  index: 'Beranda',
  search: 'Explore',
  saved: 'Tersimpan',
  profile: 'Profil',
};

function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const dockWidth = Math.min(width - 32, 420);

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
              style={styles.tab}
            >
              <View style={[styles.iconWell, active && { backgroundColor: theme.colors.inkPrimary, borderRadius: 999 }]}>
                <Feather name={icon} size={20} color={active ? theme.colors.surface : theme.colors.inkSecondary} />
              </View>
              <Text numberOfLines={1} style={[styles.tabLabel, { color: active ? theme.colors.inkPrimary : theme.colors.inkTertiary, fontWeight: active ? '600' : '400' }]}>{label}</Text>
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
  dock: { height: 74, borderRadius: 28, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5 },
  tab: { flex: 1, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 2 },
  iconWell: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, lineHeight: 14, letterSpacing: -0.1 },
});
