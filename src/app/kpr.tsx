import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Chip } from '../components/Chip';
import { Stepper } from '../components/Stepper';
import { calculateKpr, calculateTakeOver } from '../lib/kpr';
import { formatDigits, formatIDR } from '../lib/format';
import { useAppStore } from '../store/useAppStore';

type Mode = 'new' | 'takeover';

export default function KprScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ price?: string }>();
  const addKprScenario = useAppStore((s) => s.addKprScenario);
  const [mode, setMode] = useState<Mode>('new');

  const [priceText, setPriceText] = useState(String(Number(params.price) || 1_500_000_000));
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [tenorYears, setTenorYears] = useState(15);
  const [ratePercent, setRatePercent] = useState(7.5);

  const price = Number(priceText.replace(/[^0-9]/g, '')) || 0;
  const result = useMemo(
    () => calculateKpr({ price, downPaymentPercent, tenorYears, ratePercent }),
    [price, downPaymentPercent, tenorYears, ratePercent]
  );

  const [remainingPrincipalText, setRemainingPrincipalText] = useState('800000000');
  const [remainingTenorYears, setRemainingTenorYears] = useState(10);
  const [currentInstallmentText, setCurrentInstallmentText] = useState('9500000');
  const [newRatePercent, setNewRatePercent] = useState(6.5);

  const remainingPrincipal = Number(remainingPrincipalText.replace(/[^0-9]/g, '')) || 0;
  const currentInstallment = Number(currentInstallmentText.replace(/[^0-9]/g, '')) || 0;
  const takeOverResult = useMemo(
    () => calculateTakeOver({ remainingPrincipal, remainingTenorYears, currentInstallment, newRatePercent }),
    [remainingPrincipal, remainingTenorYears, currentInstallment, newRatePercent]
  );

  const save = () => {
    if (mode === 'new') {
      addKprScenario({
        label: `Simulasi ${formatIDR(price)}`,
        price,
        downPaymentPercent,
        tenorYears,
        ratePercent,
        monthlyInstallment: result.monthlyInstallment,
      });
    } else {
      addKprScenario({
        label: `Take-over KPR ${formatIDR(remainingPrincipal)}`,
        price: remainingPrincipal,
        downPaymentPercent: 0,
        tenorYears: remainingTenorYears,
        ratePercent: newRatePercent,
        monthlyInstallment: takeOverResult.newInstallment,
      });
    }
    if (Platform.OS === 'web') {
      router.back();
    } else {
      Alert.alert('Tersimpan', 'Simulasi disimpan ke workspace kamu.', [{ text: 'OK', onPress: () => router.back() }]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ fontSize: 20, color: theme.colors.inkPrimary }}>←</Text>
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>
          Simulasi KPR
        </Text>
      </View>

      <View style={styles.modeRow}>
        <Chip label="KPR baru" selected={mode === 'new'} onPress={() => setMode('new')} />
        <Chip label="Take-over KPR" selected={mode === 'takeover'} onPress={() => setMode('takeover')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {mode === 'new' ? (
          <>
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>Harga properti</Text>
            <View style={[styles.priceInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[theme.type.headline, { color: theme.colors.inkTertiary }]}>Rp</Text>
              <TextInput
                value={formatDigits(priceText)}
                onChangeText={(t) => setPriceText(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                style={[theme.type.headline, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
              />
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Stepper
                label="Uang muka"
                value={`${downPaymentPercent}%  ·  ${formatIDR(price * (downPaymentPercent / 100))}`}
                onDecrease={() => setDownPaymentPercent((v) => Math.max(5, v - 5))}
                onIncrease={() => setDownPaymentPercent((v) => Math.min(90, v + 5))}
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Stepper
                label="Tenor"
                value={`${tenorYears} tahun`}
                onDecrease={() => setTenorYears((v) => Math.max(1, v - 1))}
                onIncrease={() => setTenorYears((v) => Math.min(30, v + 1))}
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Stepper
                label="Asumsi suku bunga"
                value={`${ratePercent.toFixed(1)}% / tahun`}
                onDecrease={() => setRatePercent((v) => Math.max(2, Math.round((v - 0.25) * 100) / 100))}
                onIncrease={() => setRatePercent((v) => Math.min(20, Math.round((v + 0.25) * 100) / 100))}
              />
            </View>

            <View style={[styles.resultCard, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)' }]}>Estimasi cicilan bulanan</Text>
              <Text style={[theme.type.display, { color: theme.colors.surface, marginTop: 4 }]}>
                {formatIDR(result.monthlyInstallment)}
              </Text>
              <View style={styles.resultRow}>
                <ResultItem label="Jumlah pinjaman" value={formatIDR(result.loanAmount)} />
                <ResultItem label="Total uang muka" value={formatIDR(result.downPaymentAmount)} />
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginBottom: 12 }]}>
              Pindahkan sisa cicilan KPR-mu ke suku bunga baru dan lihat estimasi penghematannya.
            </Text>

            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>Sisa pokok pinjaman</Text>
            <View style={[styles.priceInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[theme.type.headline, { color: theme.colors.inkTertiary }]}>Rp</Text>
              <TextInput
                value={formatDigits(remainingPrincipalText)}
                onChangeText={(t) => setRemainingPrincipalText(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                style={[theme.type.headline, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
              />
            </View>

            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 16 }]}>
              Cicilan saat ini per bulan
            </Text>
            <View style={[styles.priceInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[theme.type.headline, { color: theme.colors.inkTertiary }]}>Rp</Text>
              <TextInput
                value={formatDigits(currentInstallmentText)}
                onChangeText={(t) => setCurrentInstallmentText(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                style={[theme.type.headline, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
              />
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Stepper
                label="Sisa tenor"
                value={`${remainingTenorYears} tahun`}
                onDecrease={() => setRemainingTenorYears((v) => Math.max(1, v - 1))}
                onIncrease={() => setRemainingTenorYears((v) => Math.min(30, v + 1))}
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Stepper
                label="Suku bunga baru"
                value={`${newRatePercent.toFixed(1)}% / tahun`}
                onDecrease={() => setNewRatePercent((v) => Math.max(2, Math.round((v - 0.25) * 100) / 100))}
                onIncrease={() => setNewRatePercent((v) => Math.min(20, Math.round((v + 0.25) * 100) / 100))}
              />
            </View>

            <View style={[styles.resultCard, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)' }]}>Cicilan baru per bulan</Text>
              <Text style={[theme.type.display, { color: theme.colors.surface, marginTop: 4 }]}>
                {formatIDR(takeOverResult.newInstallment)}
              </Text>
              <View style={styles.resultRow}>
                <ResultItem
                  label="Hemat per bulan"
                  value={`${takeOverResult.monthlySavings >= 0 ? '' : '-'}${formatIDR(Math.abs(takeOverResult.monthlySavings))}`}
                />
                <ResultItem
                  label="Estimasi hemat total"
                  value={`${takeOverResult.totalSavings >= 0 ? '' : '-'}${formatIDR(Math.abs(takeOverResult.totalSavings))}`}
                />
              </View>
            </View>
          </>
        )}

        <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginTop: 14, lineHeight: 16 }]}>
          HASIL INI ADALAH ESTIMASI, BUKAN PERSETUJUAN, PENAWARAN, ATAU KEPUTUSAN PEMBERIAN PINJAMAN DARI BANK
          MANAPUN. SUKU BUNGA AKTUAL DAPAT BERBEDA TERGANTUNG PRODUK DAN KEBIJAKAN BANK.
        </Text>

        <Pressable onPress={save} style={[styles.saveBtn, { backgroundColor: theme.colors.brand }]}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.onBrand }]}>Simpan simulasi ini</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[theme.type.micro, { color: 'rgba(255,255,255,0.6)' }]}>{label.toUpperCase()}</Text>
      <Text style={[theme.type.bodyStrong, { color: theme.colors.surface, marginTop: 2 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  modeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 4 },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    marginTop: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  divider: { height: StyleSheet.hairlineWidth },
  resultCard: { marginTop: 20, borderRadius: 20, padding: 20 },
  resultRow: { flexDirection: 'row', marginTop: 18, gap: 16 },
  saveBtn: { marginTop: 20, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
});
