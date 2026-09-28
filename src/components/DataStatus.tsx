import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function DataStatus({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ marginHorizontal: 20, marginBottom: 16, padding: 14, borderRadius: 12, backgroundColor: theme.colors.brandSoft }}>
      <Text style={[theme.type.caption, { color: theme.colors.brandInk }]}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={{ marginTop: 8 }}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Coba lagi</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
