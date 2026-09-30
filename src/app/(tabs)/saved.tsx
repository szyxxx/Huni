import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { PropertyCard } from '../../components/PropertyCard';
import { CompareTray } from '../../components/CompareTray';
import { Chip } from '../../components/Chip';
import { SectionHeader } from '../../components/SectionHeader';
import { DataStatus } from '../../components/DataStatus';
import { fetchProperties } from '../../data/repository';
import { useAppStore } from '../../store/useAppStore';
import { formatIDR } from '../../lib/format';
import { useTranslate } from '../../lib/i18n';

export default function SavedScreen() {
  const theme = useTheme();
  const t = useTranslate();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columns = width >= 700 ? 2 : 1;
  const savedIds = useAppStore((s) => s.savedIds);
  const compareIds = useAppStore((s) => s.compareIds);
  const syncError = useAppStore((s) => s.syncError);
  const savedSearches = useAppStore((s) => s.savedSearches);
  const setIntent = useAppStore((s) => s.setIntent);
  const setFilters = useAppStore((s) => s.setFilters);
  const removeSavedSearch = useAppStore((s) => s.removeSavedSearch);
  const kprScenarios = useAppStore((s) => s.kprScenarios);
  const removeKprScenario = useAppStore((s) => s.removeKprScenario);
  const shortlists = useAppStore((s) => s.shortlists);
  const createShortlist = useAppStore((s) => s.createShortlist);
  const watchedPriceIds = useAppStore((s) => s.watchedPriceIds);
  const priceAlerts = useAppStore((s) => s.priceAlerts);
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);
  const hiddenIds = useAppStore((s) => s.hiddenIds);
  const toggleHidden = useAppStore((s) => s.toggleHidden);
  const { data: properties = [], error: propertiesError, isFetching, refetch } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const saved = properties.filter((p) => savedIds.has(p.id));
  const hidden = properties.filter((p) => hiddenIds.has(p.id));
  const getPropertyById = (id: string) => properties.find((p) => p.id === id);
  const recent = recentlyViewed.map(getPropertyById).filter(Boolean) as typeof properties;
  const [newShortlistName, setNewShortlistName] = useState('');
  const [section, setSection] = useState<'properties' | 'plans'>('properties');

  const watchedAlerts = priceAlerts.filter((a) => watchedPriceIds.has(a.propertyId));

  const addShortlist = () => {
    const name = newShortlistName.trim();
    if (!name) return;
    const sl = createShortlist(name);
    setNewShortlistName('');
    if (Platform.OS !== 'web') {
      Alert.alert(t('shortlistCreatedTitle'), t('shortlistCreatedBody').replace('{name}', sl.name));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
        <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>{t('yourDecisions')}</Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
          {t('savedIntro')}
        </Text>
        {saved.length || compareIds.length >= 2 ? <Pressable
          onPress={() => router.push(compareIds.length >= 2 ? '/compare' : '/(tabs)/search')}
          style={[styles.nextStep, { backgroundColor: theme.colors.inkPrimary }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[theme.type.micro, { color: theme.colors.brand }]}>{t('nextStepEyebrow')}</Text>
            <Text style={[theme.type.bodyStrong, { color: theme.colors.surface, marginTop: 5 }]}>
              {compareIds.length >= 2
                ? t('compareSelectedProperties').replace('{n}', String(compareIds.length))
                : saved.length ? t('findComparisonForPicks') : t('startWithLikedProperty')}
            </Text>
          </View>
          <Feather name="arrow-up-right" size={20} color={theme.colors.surface} />
        </Pressable> : null}
        <View style={styles.sectionTabs}>
          <Chip label={`${t('propertiesTab')} (${saved.length})`} selected={section === 'properties'} onPress={() => setSection('properties')} />
          <Chip label={t('plansAndCollections')} selected={section === 'plans'} onPress={() => setSection('plans')} />
        </View>
      </View>
      {syncError ? <DataStatus message={`${t('workspaceNotSynced')}: ${syncError}`} /> : null}
      {propertiesError ? (
        <DataStatus message={t('savedPropertiesLoadError')} onRetry={() => { void refetch(); }} />
      ) : null}

      <FlatList
        key={`saved-columns-${columns}-${section}`}
        data={section === 'properties' ? saved : []}
        keyExtractor={(p) => p.id}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? { gap: 14, paddingHorizontal: 20 } : undefined}
        contentContainerStyle={{ gap: 14, paddingBottom: insets.bottom + 110 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.colors.inkTertiary} />}
        ListHeaderComponent={<SectionHeader title={section === 'properties' ? t('savedProperties') : t('plansAndCollections')} subtitle={section === 'properties' ? `${saved.length} ${t('propertiesCount')}` : t('savePlansHint')} />}
        renderItem={({ item }) => (
          <View style={{ flex: 1, paddingHorizontal: columns === 1 ? 20 : 0 }}>
            <PropertyCard layout="grid" property={item} onPress={() => router.push(`/property/${item.id}`)} showCompareToggle />
          </View>
        )}
        ListEmptyComponent={section === 'properties' ?
          <View style={[styles.empty, { backgroundColor: theme.colors.surfaceSoft, marginHorizontal: 20 }]}>
            <Feather name="heart" size={24} color={theme.colors.inkSecondary} />
            <Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center' }]}>
              {t('noSavedPropertiesYet')}
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/search')} style={[styles.exploreBtn, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{t('exploreProperties')}</Text>
            </Pressable>
          </View>
        : null}
        ListFooterComponent={
          <View style={{ marginTop: 12 }}>
            {section === 'properties' && recent.length > 0 ? (
              <View style={{ marginBottom: 20 }}>
                <SectionHeader title={t('recentlyViewed')} subtitle={`${recent.length} ${t('propertiesCount')}`} />
                <FlatList
                  data={recent}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(p) => p.id}
                  contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                  renderItem={({ item }) => (
                    <View style={{ width: 240 }}>
                      <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
                    </View>
                  )}
                />
              </View>
            ) : null}

            {section === 'properties' && watchedAlerts.length > 0 ? (
              <View style={{ marginBottom: 20 }}>
                <SectionHeader title={t('priceDrops')} subtitle={`${watchedAlerts.length} ${t('propertiesYouWatch')}`} />
                <View style={{ paddingHorizontal: 20, gap: 10 }}>
                  {watchedAlerts.map((a) => {
                    const p = getPropertyById(a.propertyId);
                    if (!p) return null;
                    return (
                      <Pressable
                        key={a.propertyId}
                        onPress={() => router.push(`/property/${p.id}`)}
                        style={[styles.row, { backgroundColor: theme.colors.brandSoft, borderColor: theme.colors.brand }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[theme.type.bodyStrong, { color: theme.colors.brandInk }]} numberOfLines={1}>
                            {p.title}
                          </Text>
                          <Text style={[theme.type.caption, { color: theme.colors.brandInk, marginTop: 2 }]}>
                            {formatIDR(a.fromPrice)} → {formatIDR(a.toPrice)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {section === 'plans' ? <SectionHeader title={t('shortlist')} subtitle={`${shortlists.length} ${t('collections')}`} /> : null}
            {section === 'plans' ?
            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TextInput
                  value={newShortlistName}
                  onChangeText={setNewShortlistName}
                  placeholder={t('newShortlistPlaceholder')}
                  placeholderTextColor={theme.colors.inkTertiary}
                  style={[theme.type.body, { flex: 1, color: theme.colors.inkPrimary }]}
                  onSubmitEditing={addShortlist}
                />
                <Pressable onPress={addShortlist} hitSlop={8} style={{ marginLeft: 12 }} accessibilityRole="button" accessibilityLabel={t('createShortlistLabel')}>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>{t('create')}</Text>
                </Pressable>
              </View>
              {shortlists.map((sl) => (
                <Pressable
                  key={sl.id}
                  onPress={() => router.push(`/shortlist/${sl.id}`)}
                  style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{sl.name}</Text>
                    <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                      {sl.propertyIds.length} {t('propertiesCount')} · {t('shareable')}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={theme.colors.inkTertiary} />
                </Pressable>
              ))}
            </View> : null}

            {section === 'plans' ? <View style={{ marginTop: 20 }}>
              <SectionHeader title={t('savedSearchesTitle')} subtitle={`${savedSearches.length} ${t('savedSearchesCount')}`} />
            {savedSearches.length === 0 ? (
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, paddingHorizontal: 20 }]}>
                {t('noSavedSearchesHint')}
              </Text>
            ) : (
              <View style={{ paddingHorizontal: 20, gap: 10 }}>
                {savedSearches.map((s) => (
                  <View key={s.id} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{s.label}</Text>
                      <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                        {t('savedSearchLabel')}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        setIntent(s.intent);
                        setFilters(s.filters);
                        router.push({ pathname: '/(tabs)/search', params: { q: s.query, restore: `${s.id}:${Date.now()}` } });
                      }}
                      accessibilityRole="button"
                      style={styles.openSearch}
                    >
                      <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>{t('open')}</Text>
                    </Pressable>
                    <Pressable onPress={() => removeSavedSearch(s.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${t('removeSavedSearchLabel')} ${s.label}`}>
                      <Feather name="x" size={16} color={theme.colors.inkTertiary} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            </View> : null}

            {section === 'properties' && hidden.length > 0 ? (
              <View style={{ marginTop: 20 }}>
                <SectionHeader title={t('hidden')} subtitle={`${hidden.length} ${t('propertiesCount')}`} />
                <View style={{ paddingHorizontal: 20, gap: 10 }}>
                  {hidden.map((p) => (
                    <View key={p.id} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                          {p.area}, {p.city}
                        </Text>
                      </View>
                      <Pressable onPress={() => toggleHidden(p.id)} hitSlop={8}>
                        <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>{t('show')}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {section === 'plans' ? <View style={{ marginTop: 20 }}>
              <SectionHeader title={t('kprSimulations')} subtitle={`${kprScenarios.length} ${t('scenariosSaved')}`} />
              {kprScenarios.length === 0 ? (
                <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, paddingHorizontal: 20 }]}>
                  {t('saveKprHint')}
                </Text>
              ) : (
                <View style={{ paddingHorizontal: 20, gap: 10 }}>
                  {kprScenarios.map((s) => (
                    <View key={s.id} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{s.label}</Text>
                        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                          {formatIDR(s.monthlyInstallment)}{t('perMonthSuffix')} · {t('dpAbbrev')} {s.downPaymentPercent}% · {s.tenorYears} {t('yearsAbbrev')}
                        </Text>
                      </View>
                      <Pressable onPress={() => removeKprScenario(s.id)} hitSlop={8}>
                        <Feather name="x" size={16} color={theme.colors.inkTertiary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View> : null}
          </View>
        }
      />
      <CompareTray bottom={insets.bottom + 88} />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { borderRadius: 20, padding: 28, alignItems: 'center', gap: 12 },
  nextStep: { minHeight: 82, borderRadius: 20, padding: 18, marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTabs: { flexDirection: 'row', gap: 8, marginTop: 20 },
  exploreBtn: { borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, marginTop: 4 },
  openSearch: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
