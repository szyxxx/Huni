import React, { useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { Chip } from '../components/Chip';
import { Stepper } from '../components/Stepper';
import { calculateKpr, calculateTakeOver, calculateBankProgram, BANK_PROGRAMS } from '../lib/kpr';
import { formatDigits, formatIDR } from '../lib/format';
import { useAppStore, defaultFilters } from '../store/useAppStore';
import { fetchPropertyById } from '../data/repository';
import { logLead } from '../lib/leads';
import { useAuth } from '../auth/AuthProvider';
import { useTranslate } from '../lib/i18n';

type Mode = 'program' | 'new' | 'takeover';

export default function KprScreen() {
  const theme = useTheme();
  const t = useTranslate();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ price?: string; propertyId?: string }>();
  const { user } = useAuth();
  const addKprScenario = useAppStore((s) => s.addKprScenario);
  const setFilters = useAppStore((s) => s.setFilters);
  const setIntent = useAppStore((s) => s.setIntent);
  const [mode, setMode] = useState<Mode>('program');

  const { data: linkedProperty } = useQuery({
    queryKey: ['property', params.propertyId],
    queryFn: () => fetchPropertyById(params.propertyId!),
    enabled: Boolean(params.propertyId),
  });

  const [priceText, setPriceText] = useState(String(Number(params.price) || 1_500_000_000));
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [tenorYears, setTenorYears] = useState(15);
  const [ratePercent, setRatePercent] = useState(7.5);
  const [bankFilter, setBankFilter] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState(BANK_PROGRAMS[0].id);
  const [showRincian, setShowRincian] = useState(false);

  const price = Number(priceText.replace(/[^0-9]/g, '')) || 0;
  const filteredPrograms = bankFilter ? BANK_PROGRAMS.filter((p) => p.bankName === bankFilter) : BANK_PROGRAMS;
  const selectedProgram = BANK_PROGRAMS.find((p) => p.id === selectedProgramId) ?? BANK_PROGRAMS[0];
  const programResult = useMemo(
    () => calculateBankProgram({ price, downPaymentPercent, tenorYears, program: selectedProgram }),
    [price, downPaymentPercent, tenorYears, selectedProgram]
  );
  const askProgram = () => {
    const phone = linkedProperty?.advertiser.contactPhone;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void logLead({
      propertyId: linkedProperty?.id,
      userId: user?.id ?? null,
      sourceSurface: 'kpr_program',
      channel: 'inquiry',
      note: `Program ${selectedProgram.bankName}, tenor ${tenorYears} tahun`,
    });
    const text = encodeURIComponent(
      `Halo, saya ingin bertanya tentang program KPR ${selectedProgram.bankName} (fix ${selectedProgram.fixRatePercent}% selama ${selectedProgram.fixYears} tahun)${linkedProperty ? ` untuk properti "${linkedProperty.title}"` : ''} di Huni.`
    );
    if (phone) {
      Linking.openURL(`https://wa.me/${phone}?text=${text}`).catch(() => {});
    } else {
      Alert.alert(t('programInfoTitle'), t('contactAgentForMoreInfo'));
    }
  };
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
  const canSave = mode === 'new' || mode === 'program' ? price > 0 : remainingPrincipal > 0 && currentInstallment > 0;

  const save = () => {
    if (mode === 'program') {
      addKprScenario({
        label: `${selectedProgram.bankName} · ${formatIDR(price)}`,
        price,
        downPaymentPercent,
        tenorYears,
        ratePercent: selectedProgram.fixRatePercent,
        monthlyInstallment: programResult.fixInstallment,
      });
    } else if (mode === 'new') {
      addKprScenario({
        label: `${t('simulationLabel')} ${formatIDR(price)}`,
        price,
        downPaymentPercent,
        tenorYears,
        ratePercent,
        monthlyInstallment: result.monthlyInstallment,
      });
    } else {
      addKprScenario({
        label: `${t('takeoverKprLabel')} ${formatIDR(remainingPrincipal)}`,
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
      Alert.alert(t('savedTitle'), t('simulationSavedToWorkspace'), [{ text: t('ok'), onPress: () => router.back() }]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>
          {t('kprSimTitle')}
        </Text>
      </View>

      <View style={styles.modeRow}>
        <Chip label={t('modeBankProgram')} selected={mode === 'program'} onPress={() => setMode('program')} />
        <Chip label={t('modeNewKpr')} selected={mode === 'new'} onPress={() => setMode('new')} />
        <Chip label={t('modeTakeover')} selected={mode === 'takeover'} onPress={() => setMode('takeover')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {mode === 'program' ? (
          <>
            <View style={[styles.resultCard, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)' }]}>
                {t('installmentPerMonthFixPrefix')} {selectedProgram.fixYears} {t('yearsFirstSuffix')}
              </Text>
              <Text style={[theme.type.display, { color: theme.colors.surface, marginTop: 4 }]}>
                {formatIDR(programResult.fixInstallment)}
              </Text>
              <Pressable onPress={() => setShowRincian((v) => !v)} hitSlop={8} style={{ marginTop: 10 }}>
                <Text style={[theme.type.captionStrong, { color: theme.colors.brand }]}>
                  {showRincian ? t('hideDetails') : t('viewDetails')}
                </Text>
              </Pressable>
            </View>

            {showRincian ? (
              <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, paddingVertical: 4 }]}>
                <View style={styles.rincianRow}>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>
                    {t('installmentFixYearsPrefix')}{selectedProgram.fixYears}, {t('interestSuffix')} {selectedProgram.fixRatePercent}%)
                  </Text>
                  <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(programResult.fixInstallment)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.rincianRow}>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>
                    {t('installmentFloatingYearsPrefix')} {selectedProgram.fixYears + 1}-{tenorYears}, {t('estimatedInterestSuffix')} {selectedProgram.estimatedFloatingRatePercent}%)
                  </Text>
                  <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(programResult.floatingInstallment)}</Text>
                </View>

                <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 16 }]}>
                  {t('firstPaymentEstimate')}
                </Text>
                <View style={styles.rincianRow}>
                  <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{t('downPayment')}</Text>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(programResult.downPaymentAmount)}</Text>
                </View>
                <View style={styles.rincianRow}>
                  <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{t('firstInstallment')}</Text>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(programResult.fixInstallment)}</Text>
                </View>
                <View style={styles.rincianRow}>
                  <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{t('estimatedOtherCosts')}</Text>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(programResult.estimatedOtherCosts)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.rincianRow}>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{t('totalFirstPayment')}</Text>
                  <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(programResult.firstPaymentTotal)}</Text>
                </View>

                <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 16 }]}>{t('loanDetail')}</Text>
                <View style={styles.rincianRow}>
                  <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{t('principalLoan')}</Text>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(programResult.loanAmount)}</Text>
                </View>
                <View style={[styles.rincianRow, { paddingBottom: 14 }]}>
                  <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{t('estimatedLoanInterest')}</Text>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(programResult.totalEstimatedInterest)}</Text>
                </View>
              </View>
            ) : null}

            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 20 }]}>{t('propertyPrice')}</Text>
            <View style={[styles.priceInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[theme.type.headline, { color: theme.colors.inkTertiary }]}>Rp</Text>
              <TextInput
                value={formatDigits(priceText)}
                onChangeText={(v) => setPriceText(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                style={[theme.type.headline, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
              />
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Stepper
                label={t('downPaymentDp')}
                value={`${downPaymentPercent}%  ·  ${formatIDR(price * (downPaymentPercent / 100))}`}
                onDecrease={() => setDownPaymentPercent((v) => Math.max(5, v - 5))}
                onIncrease={() => setDownPaymentPercent((v) => Math.min(90, v + 5))}
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Stepper
                label={t('loanTerm')}
                value={`${tenorYears} ${t('yearsSuffix')}`}
                onDecrease={() => setTenorYears((v) => Math.max(selectedProgram.minTenorYears, v - 1))}
                onIncrease={() => setTenorYears((v) => Math.min(selectedProgram.maxTenorYears, v + 1))}
              />
            </View>

            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 20 }]}>{t('kprProgramChoice')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 10 }}>
              <Chip label={t('allBanks')} selected={!bankFilter} onPress={() => setBankFilter(null)} />
              {Array.from(new Set(BANK_PROGRAMS.map((p) => p.bankName))).map((bank) => (
                <Chip key={bank} label={bank} selected={bankFilter === bank} onPress={() => setBankFilter(bank)} />
              ))}
            </ScrollView>

            <View style={{ marginTop: 12, gap: 10 }}>
              {filteredPrograms.map((program) => {
                const selected = program.id === selectedProgramId;
                return (
                  <Pressable
                    key={program.id}
                    onPress={() => setSelectedProgramId(program.id)}
                    style={[
                      styles.programCard,
                      { borderColor: selected ? theme.colors.brand : theme.colors.border, backgroundColor: selected ? theme.colors.brandSoft : theme.colors.surface },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{program.bankName}</Text>
                        {program.badge ? (
                          <View style={[styles.programBadge, { backgroundColor: theme.colors.inkPrimary }]}>
                            <Text style={[theme.type.micro, { color: theme.colors.surface }]}>{program.badge}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
                        {t('fixInterestLabel')} {program.fixRatePercent}% · {t('fixPeriodLabel')} {program.fixYears} {t('yearsSuffix')}
                      </Text>
                      <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                        {t('creditPeriodLabel')} {program.minTenorYears}-{program.maxTenorYears} {t('yearsSuffix')}
                      </Text>
                    </View>
                    <View style={[styles.radio, { borderColor: selected ? theme.colors.brand : theme.colors.border }]}>
                      {selected ? <View style={[styles.radioDot, { backgroundColor: theme.colors.brand }]} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : mode === 'new' ? (
          <>
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>{t('propertyPrice')}</Text>
            <View style={[styles.priceInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[theme.type.headline, { color: theme.colors.inkTertiary }]}>Rp</Text>
              <TextInput
                value={formatDigits(priceText)}
                onChangeText={(v) => setPriceText(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                style={[theme.type.headline, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
              />
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Stepper
                label={t('downPaymentSimple')}
                value={`${downPaymentPercent}%  ·  ${formatIDR(price * (downPaymentPercent / 100))}`}
                onDecrease={() => setDownPaymentPercent((v) => Math.max(5, v - 5))}
                onIncrease={() => setDownPaymentPercent((v) => Math.min(90, v + 5))}
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Stepper
                label={t('tenor')}
                value={`${tenorYears} ${t('yearsSuffix')}`}
                onDecrease={() => setTenorYears((v) => Math.max(1, v - 1))}
                onIncrease={() => setTenorYears((v) => Math.min(30, v + 1))}
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Stepper
                label={t('rateAssumption')}
                value={`${ratePercent.toFixed(1)}% ${t('perYear')}`}
                onDecrease={() => setRatePercent((v) => Math.max(2, Math.round((v - 0.25) * 100) / 100))}
                onIncrease={() => setRatePercent((v) => Math.min(20, Math.round((v + 0.25) * 100) / 100))}
              />
            </View>

            <View style={[styles.resultCard, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)' }]}>{t('estimatedMonthlyInstallment')}</Text>
              <Text style={[theme.type.display, { color: theme.colors.surface, marginTop: 4 }]}>
                {formatIDR(result.monthlyInstallment)}
              </Text>
              <View style={styles.resultRow}>
                <ResultItem label={t('loanAmount')} value={formatIDR(result.loanAmount)} />
                <ResultItem label={t('totalDownPayment')} value={formatIDR(result.downPaymentAmount)} />
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={price <= 0}
              onPress={() => {
                setIntent('buy');
                setFilters({ ...defaultFilters, maxInstallment: Math.ceil(result.monthlyInstallment / 500_000) * 500_000 });
                router.replace('/(tabs)/search');
              }}
              style={[styles.findBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: price > 0 ? 1 : 0.45 }]}
            >
              <Feather name="search" size={18} color={theme.colors.inkPrimary} />
              <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary, flex: 1 }]}>{t('exploreSimilarInstallment')}</Text>
              <Feather name="arrow-right" size={17} color={theme.colors.inkPrimary} />
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginBottom: 12 }]}>
              {t('takeoverIntro')}
            </Text>

            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>{t('remainingPrincipal')}</Text>
            <View style={[styles.priceInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[theme.type.headline, { color: theme.colors.inkTertiary }]}>Rp</Text>
              <TextInput
                value={formatDigits(remainingPrincipalText)}
                onChangeText={(v) => setRemainingPrincipalText(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                style={[theme.type.headline, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
              />
            </View>

            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 16 }]}>
              {t('currentInstallmentPerMonth')}
            </Text>
            <View style={[styles.priceInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[theme.type.headline, { color: theme.colors.inkTertiary }]}>Rp</Text>
              <TextInput
                value={formatDigits(currentInstallmentText)}
                onChangeText={(v) => setCurrentInstallmentText(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                style={[theme.type.headline, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
              />
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Stepper
                label={t('remainingTenor')}
                value={`${remainingTenorYears} ${t('yearsSuffix')}`}
                onDecrease={() => setRemainingTenorYears((v) => Math.max(1, v - 1))}
                onIncrease={() => setRemainingTenorYears((v) => Math.min(30, v + 1))}
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Stepper
                label={t('newInterestRate')}
                value={`${newRatePercent.toFixed(1)}% ${t('perYear')}`}
                onDecrease={() => setNewRatePercent((v) => Math.max(2, Math.round((v - 0.25) * 100) / 100))}
                onIncrease={() => setNewRatePercent((v) => Math.min(20, Math.round((v + 0.25) * 100) / 100))}
              />
            </View>

            <View style={[styles.resultCard, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)' }]}>{t('newInstallmentPerMonth')}</Text>
              <Text style={[theme.type.display, { color: theme.colors.surface, marginTop: 4 }]}>
                {formatIDR(takeOverResult.newInstallment)}
              </Text>
              <View style={styles.resultRow}>
                <ResultItem
                  label={t('monthlySavings')}
                  value={`${takeOverResult.monthlySavings >= 0 ? '' : '-'}${formatIDR(Math.abs(takeOverResult.monthlySavings))}`}
                />
                <ResultItem
                  label={t('totalEstimatedSavings')}
                  value={`${takeOverResult.totalSavings >= 0 ? '' : '-'}${formatIDR(Math.abs(takeOverResult.totalSavings))}`}
                />
              </View>
            </View>
          </>
        )}

        <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginTop: 14, lineHeight: 16 }]}>
          {t('kprDisclaimer')}
        </Text>

        <Pressable disabled={!canSave} onPress={save} style={[styles.saveBtn, { backgroundColor: theme.colors.brand, opacity: canSave ? 1 : 0.45 }]}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.onBrand }]}>{t('saveThisSimulation')}</Text>
        </Pressable>

        {mode === 'program' ? (
          <Pressable onPress={askProgram} style={[styles.saveBtn, { marginTop: 10, backgroundColor: theme.colors.inkPrimary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }]}>
            <Feather name="message-circle" size={16} color={theme.colors.surface} />
            <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{t('askAboutThisProgram')}</Text>
          </Pressable>
        ) : null}
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
  findBtn: { minHeight: 52, marginTop: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rincianRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, gap: 12 },
  programCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  programBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
