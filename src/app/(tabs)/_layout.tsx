import React from 'react';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';
import { useTranslate, type StringKey } from '../../lib/i18n';

type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  index: 'home',
  search: 'compass',
  saved: 'heart',
  profile: 'user',
};

const LABEL_KEYS: Record<string, StringKey> = {
  index: 'tabHome',
  search: 'tabExplore',
  saved: 'tabSaved',
  profile: 'tabProfile',
};

function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const t = useTranslate();
  const { width } = useWindowDimensions();
  const dockWidth = Math.min(width - 40, 408);

  return (
    <View pointerEvents="box-none" style={[styles.position, { bottom: insets.bottom + 10 }]}>
      <GlassSurface
        intensity={72}
        style={[
          styles.dock,
          {
            width: dockWidth,
            borderColor: theme.scheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.94)',
            ...theme.shadow.soft,
          },
        ]}
      >
        <View pointerEvents="none" style={[styles.edgeLight, { backgroundColor: theme.scheme === 'dark' ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.90)' }]} />
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const options = descriptors[route.key].options;
          const label = LABEL_KEYS[route.name] ? t(LABEL_KEYS[route.name]) : route.name;
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
              style={[styles.tab, active && { backgroundColor: theme.scheme === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.58)' }]}
            >
              <View style={[styles.iconWell, active && { backgroundColor: theme.colors.brandSoft, borderColor: theme.colors.brand + '66', borderWidth: StyleSheet.hairlineWidth }]}>
                <Feather name={icon} size={20} color={active ? theme.colors.brandInk : theme.colors.inkSecondary} />
              </View>
              <Text numberOfLines={1} style={[styles.tabLabel, { color: active ? theme.colors.inkPrimary : theme.colors.inkSecondary, fontWeight: active ? '600' : '500' }]}>{label}</Text>
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
  dock: { height: 76, borderRadius: 30, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 7 },
  edgeLight: { position: 'absolute', top: 1, left: 22, right: 22, height: 1, borderRadius: 1 },
  tab: { flex: 1, minHeight: 62, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 2 },
  iconWell: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, lineHeight: 14, letterSpacing: -0.1 },
});
