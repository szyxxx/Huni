import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { VerificationTier } from '../data/properties';

export const VERIFICATION_LABELS: Record<VerificationTier, string> = {
  unverified: '',
  verified_owner: 'Pemilik terverifikasi',
  verified_agent: 'Agen terverifikasi',
  verified_agency: 'Agensi terverifikasi',
  official_developer: 'Developer resmi',
};

export function VerificationBadge({ tier }: { tier: VerificationTier }) {
  const theme = useTheme();
  const label = VERIFICATION_LABELS[tier];
  if (!label) return null;
  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.brandSoft }]}>
      <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
