import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  hint?: string;
};

export function Stepper({ label, value, onDecrease, onIncrease, hint }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>{label}</Text>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 2 }]}>{value}</Text>
        {hint ? <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginTop: 2 }]}>{hint}</Text> : null}
      </View>
      <View style={styles.controls}>
        <Pressable
          onPress={onDecrease}
          style={[styles.btn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
        >
          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary }]}>–</Text>
        </Pressable>
        <Pressable
          onPress={onIncrease}
          style={[styles.btn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
        >
          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  controls: { flexDirection: 'row', gap: 8 },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
