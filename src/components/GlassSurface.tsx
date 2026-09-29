import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';

type Props = ViewProps & { intensity?: number };

/**
 * Floating glass material per DESIGN.md layer 3 (nav, sticky bars, overlay controls).
 * Falls back to an opaque tinted surface where blur is unsupported/expensive.
 */
export function GlassSurface({ style, intensity = 40, children, ...rest }: Props) {
  const theme = useTheme();
  if (Platform.OS !== 'ios') {
    return (
      <View
        style={[
          styles.base,
          {
            backgroundColor: Platform.OS === 'android' ? theme.colors.surface : theme.colors.surfaceGlass,
            borderColor: theme.colors.borderStrong,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  }
  return (
    <BlurView
      intensity={intensity}
      tint={theme.scheme === 'dark' ? 'dark' : 'light'}
      style={[styles.base, { borderColor: theme.colors.border }, style]}
      {...rest}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
