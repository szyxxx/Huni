import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';

type Props = ViewProps & { intensity?: number };

const INTENSITY_SCALE = { low: 0.5, medium: 1, high: 1.5 };

function useReduceTransparency() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled?.()
      .then(setReduce)
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceTransparencyChanged', setReduce);
    return () => sub?.remove?.();
  }, []);
  return reduce;
}

/**
 * Floating glass material per DESIGN.md layer 3 (nav, sticky bars, overlay controls).
 * `intensity` is each call site's designed baseline; the user's Settings > Tampilan
 * "Intensitas kaca" preference (Low/Medium/High) scales it globally from one place,
 * so every floating surface stays consistent when that setting changes. Falls back
 * to an opaque tinted surface where blur is unsupported/expensive, or when the
 * system's Reduce Transparency accessibility setting is on.
 */
export function GlassSurface({ style, intensity = 40, children, ...rest }: Props) {
  const theme = useTheme();
  const glassIntensity = useAppStore((s) => s.glassIntensity);
  const reduceTransparency = useReduceTransparency();
  const scaledIntensity = Math.min(100, Math.round(intensity * INTENSITY_SCALE[glassIntensity]));

  if (Platform.OS !== 'ios' || reduceTransparency) {
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
      intensity={scaledIntensity}
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
