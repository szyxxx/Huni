import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { shadow } from '../../theme/tokens';
import { Chip } from '../../components/Chip';
import { PropertyCard } from '../../components/PropertyCard';
import { PropertyMapView } from '../../components/PropertyMapView';
import { CompareTray } from '../../components/CompareTray';
import { fetchProperties, fetchProjects } from '../../data/repository';
import { useAppStore, defaultFilters, type SearchIntent } from '../../store/useAppStore';
import { parseIntentQuery, getEntitySuggestions } from '../../lib/intentParser';
import { getFitReasons } from '../../lib/recommendations';
import { formatIDR } from '../../lib/format';
import { useTranslate, type StringKey } from '../../lib/i18n';

type SortKey = 'recommendation' | 'newest' | 'priceLow' | 'priceHigh' | 'largestArea';
const SORTS: { key: SortKey; labelKey: StringKey }[] = [
  { key: 'recommendation', labelKey: 'sortRecommendation' },
  { key: 'newest', labelKey: 'sortNewest' },
  { key: 'priceLow', labelKey: 'sortPriceLow' },
  { key: 'priceHigh', labelKey: 'sortPriceHigh' },
  { key: 'largestArea', labelKey: 'sortLargestArea' },
];
const INTENTS: { key: SearchIntent; labelKey: StringKey }[] = [
  { key: 'buy', labelKey: 'intentBuy' },
  { key: 'rent', labelKey: 'intentRent' },
  { key: 'new-projects', labelKey: 'intentNewProjects' },
];
const EMPTY_CHIPS = new Set<string>();

export default function SearchScreen() {
  const theme = useTheme();
  const t = useTranslate();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columns = width >= 700 ? 2 : 1;
  const params = useLocalSearchParams<{ q?: string; restore?: string; compose?: string; unresolvedLocation?: string }>();
  const intent = useAppStore((s) => s.intent);
  const setIntent = useAppStore((s) => s.setIntent);
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const kprScenarios = useAppStore((s) => s.kprScenarios);
  const addSavedSearch = useAppStore((s) => s.addSavedSearch);
  const compareIds = useAppStore((s) => s.compareIds);
  const hiddenIds = useAppStore((s) => s.hiddenIds);
  const searchHistory = useAppStore((s) => s.searchHistory);
  const addSearchHistory = useAppStore((s) => s.addSearchHistory);
  const clearSearchHistory = useAppStore((s) => s.clearSearchHistory);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const routeQuery = params.q ?? '';
  const routeKey = `${params.restore ?? ''}:${routeQuery}`;
  const [queryInput, setQueryInput] = useState({ routeKey, value: routeQuery });
  const query = queryInput.routeKey === routeKey ? queryInput.value : routeQuery;
  const setQuery = (value: string) => setQueryInput({ routeKey, value });
  const [sort, setSort] = useState<SortKey>(SORTS[0].key);
  const [view, setView] = useState<'list' | 'map'>('list');
  const lastParsedQuery = useRef<string | null>(null);
  const [chipState, setChipState] = useState<{ query: string; removed: Set<string> }>({ query, removed: new Set() });
  const removedChipKeys = chipState.query === query ? chipState.removed : EMPTY_CHIPS;
  const {
    data: properties = [],
    error,
    isFetching,
    refetch,
  } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const { data: projects = [], error: projectsError, isFetching: fetchingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'], queryFn: fetchProjects, enabled: intent === 'new-projects',
  });

  useEffect(() => {
    if (routeQuery) addSearchHistory(routeQuery);
  }, [routeQuery, addSearchHistory]);

  useEffect(() => {
    if (!params.compose) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [params.compose]);

  const parsed = useMemo(() => parseIntentQuery(query), [query]);
  const activeChips = parsed.chips.filter((c) => !removedChipKeys.has(c.key));
  const suggestions = useMemo(
    () => (searchFocused ? getEntitySuggestions(query, properties) : []),
    [searchFocused, query, properties]
  );

  useEffect(() => {
    if (lastParsedQuery.current === query) return;
    lastParsedQuery.current = query;
    if (intent !== 'new-projects' && !(params.restore && query === routeQuery) && !removedChipKeys.has('intent') && parsed.intent) setIntent(parsed.intent);
  }, [query, routeQuery, intent, params.restore, parsed.intent, removedChipKeys, setIntent]);

  const activeFilterCount =
    filters.types.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    (filters.bathrooms ? 1 : 0) +
    (filters.maxInstallment ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.furnished ? 1 : 0) +
    (filters.minArea ? 1 : 0) +
    (filters.specialOfferOnly ? 1 : 0) +
    (filters.videoOnly ? 1 : 0);

  const results = useMemo(() => {
    let list = properties.filter(
      (p) => p.intent === (intent === 'new-projects' ? 'buy' : intent) && !hiddenIds.has(p.id)
    );

    const hasChip = (key: string) => activeChips.some((c) => c.key === key);

    if (hasChip('type') && parsed.type) list = list.filter((p) => p.type === parsed.type);
    if (hasChip('bedrooms') && parsed.bedrooms) list = list.filter((p) => (p.bedrooms ?? 0) >= parsed.bedrooms!);
    if (hasChip('maxInstallment') && parsed.maxInstallment)
      list = list.filter((p) => (p.estimatedInstallment ?? Infinity) <= parsed.maxInstallment!);
    if (hasChip('maxPrice') && parsed.maxPrice) list = list.filter((p) => p.price <= parsed.maxPrice!);
    if (hasChip('location') && parsed.location) {
      const loc = parsed.location.toLowerCase();
      list = list.filter((p) => p.area.toLowerCase().includes(loc) || p.city.toLowerCase().includes(loc));
    }
    if (!parsed.chips.length && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
      );
    }

    if (filters.types.length) list = list.filter((p) => filters.types.includes(p.type));
    if (filters.minPrice) list = list.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice) list = list.filter((p) => p.price <= filters.maxPrice!);
    if (filters.bedrooms) list = list.filter((p) => (p.bedrooms ?? 0) >= filters.bedrooms!);
    if (filters.bathrooms) list = list.filter((p) => (p.bathrooms ?? 0) >= filters.bathrooms!);
    if (filters.maxInstallment)
      list = list.filter((p) => (p.estimatedInstallment ?? Infinity) <= filters.maxInstallment!);
    if (filters.verifiedOnly) list = list.filter((p) => p.advertiser.connected && p.verification !== 'unverified');
    if (filters.furnished) list = list.filter((p) => p.furnished === true);
    if (filters.minArea) list = list.filter((p) => (p.landArea ?? p.buildingArea ?? 0) >= filters.minArea!);
    if (filters.specialOfferOnly) list = list.filter((p) => p.promotion !== 'normal');
    if (filters.videoOnly) list = list.filter((p) => Boolean(p.videoUrl));

    if (sort === 'priceLow') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'priceHigh') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'newest') list = [...list].sort((a, b) => (a.lastConfirmed < b.lastConfirmed ? 1 : -1));
    if (sort === 'largestArea')
      list = [...list].sort((a, b) => (b.landArea ?? b.buildingArea ?? 0) - (a.landArea ?? a.buildingArea ?? 0));
    if (sort === 'recommendation') {
      list = [...list].sort(
        (a, b) =>
          getFitReasons(b, { filters, kprScenarios }, t).length - getFitReasons(a, { filters, kprScenarios }, t).length
      );
    }
    return list;
  }, [intent, query, sort, filters, activeChips, parsed, hiddenIds, kprScenarios, properties, t]);

  const projectResults = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('id');
    if (!q) return projects;
    return projects.filter((project) =>
      [project.name, project.area, project.city, project.developer]
        .some((value) => value.toLocaleLowerCase('id').includes(q))
    );
  }, [projects, query]);
  const mapCities = Array.from(new Set(results.map((property) => property.city)));
  const mapCity = selectedCity && mapCities.includes(selectedCity) ? selectedCity : mapCities[0];
  const mapResults = results.filter((property) => property.city === mapCity);
  const selectedMapProperty = mapResults.find((property) => property.id === selectedMapId) ?? mapResults[0];

  const saveThisSearch = () => {
    addSavedSearch({ label: query.trim() || t('savedSearchDefaultLabel'), query, intent, filters, notify: false });
    const msg = t('searchSavedToast');
    if (Platform.OS === 'web') {
      alert(msg);
    } else {
      Alert.alert(t('searchSavedTitle'), msg);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas, paddingTop: insets.top + 8 }}>
      <View style={styles.searchIntro}>
        <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>{t('exploreEyebrow')}</Text>
        <Text style={[theme.type.title, { color: theme.colors.inkPrimary, marginTop: 4 }]}>{t('exploreTitle')}</Text>
      </View>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Feather name="search" size={18} color={theme.colors.inkTertiary} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={() => addSearchHistory(query)}
            placeholder={t('exploreSearchPlaceholder')}
            placeholderTextColor={theme.colors.inkTertiary}
            style={[theme.type.body, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('askAi')}
            onPress={() => router.push('/ai-search')}
            hitSlop={8}
            style={[styles.aiBtn, { backgroundColor: theme.colors.brandSoft }]}
          >
            <Feather name="zap" size={15} color={theme.colors.brandInk} />
          </Pressable>
        </View>
        {intent !== 'new-projects' ? <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('openFilters')}
          onPress={() => router.push('/filters')}
          style={[styles.toggleBtn, { backgroundColor: activeFilterCount ? theme.colors.brand : theme.colors.inkPrimary }]}
        >
          <Feather name="sliders" size={18} color={activeFilterCount ? theme.colors.onBrand : theme.colors.surface} />
        </Pressable> : null}
        {intent !== 'new-projects' ? <Pressable
          accessibilityRole="button"
          accessibilityLabel={view === 'list' ? t('showMap') : t('showList')}
          onPress={() => setView(view === 'list' ? 'map' : 'list')}
          style={[styles.toggleBtn, { backgroundColor: theme.colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border }]}
        >
          <Feather name={view === 'list' ? 'map' : 'grid'} size={18} color={theme.colors.inkPrimary} />
        </Pressable> : null}
      </View>

      <View style={styles.intentRow}>
        {INTENTS.map((item) => (
          <Chip key={item.key} label={t(item.labelKey)} selected={intent === item.key} onPress={() => setIntent(item.key)} />
        ))}
      </View>

      {params.unresolvedLocation && !query.trim() ? (
        <View style={[styles.locationNotice, { backgroundColor: theme.colors.brandSoft }]}>
          <Feather name="info" size={16} color={theme.colors.brandInk} />
          <View style={{ flex: 1 }}>
            <Text style={[theme.type.caption, { color: theme.colors.brandInk }]}>
              Area sekitar “{params.unresolvedLocation}” belum dapat dipastikan. {activeFilterCount} filter lain tetap aktif.
            </Text>
            <Pressable onPress={() => router.push('/filters')} accessibilityRole="button" style={{ alignSelf: 'flex-start', paddingVertical: 6 }}>
              <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Lihat dan ubah filter</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {searchFocused && query.trim() && suggestions.length > 0 ? (
        <View style={[styles.historyBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {suggestions.map((s) => (
            <Pressable
              key={`${s.kind}:${s.label}`}
              onPressIn={() => { setQuery(s.label); setSearchFocused(false); }}
              style={styles.historyRow}
            >
              <Feather name="map-pin" size={15} color={theme.colors.inkTertiary} />
              <Text style={[theme.type.body, { color: theme.colors.inkPrimary, marginLeft: 10 }]} numberOfLines={1}>
                {s.label}
              </Text>
              <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginLeft: 8 }]}>
                {s.kind === 'area' ? t('entityArea') : t('entityCity')}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {searchFocused && !query.trim() && searchHistory.length > 0 ? (
        <View style={[styles.historyBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.historyHeader}>
            <Text style={[theme.type.micro, { color: theme.colors.inkTertiary }]}>{t('recentSearches')}</Text>
            <Pressable onPress={clearSearchHistory} hitSlop={8}>
              <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>{t('clear')}</Text>
            </Pressable>
          </View>
          {searchHistory.map((h) => (
            <Pressable
              key={h}
              onPressIn={() => { setQuery(h); setSearchFocused(false); }}
              style={styles.historyRow}
            >
              <Feather name="clock" size={15} color={theme.colors.inkTertiary} />
              <Text style={[theme.type.body, { color: theme.colors.inkPrimary, marginLeft: 10 }]} numberOfLines={1}>
                {h}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {searchFocused && !query.trim() ? <View style={[styles.promptCard, { backgroundColor: theme.colors.surface }]}>
        <Feather name="edit-3" size={17} color={theme.colors.brandInk} />
        <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary, marginTop: 10 }]}>{t('describePlaceTitle')}</Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>{t('describePlaceHint')}</Text>
        <Pressable onPress={() => { setQuery('rumah 3 kamar dekat BSD City cicilan 12 juta'); inputRef.current?.focus(); }} style={[styles.promptExample, { backgroundColor: theme.colors.surfaceSoft }]}>
          <Text style={[theme.type.caption, { color: theme.colors.inkPrimary, flex: 1 }]}>{t('describePlaceExample')}</Text>
          <Feather name="arrow-up-right" size={16} color={theme.colors.inkPrimary} />
        </Pressable>
      </View> : null}

      {activeChips.length > 0 ? (
        <View style={styles.parsedChipRow}>
          <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginRight: 4 }]}>{t('yourSearch')}</Text>
          {activeChips.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setChipState({ query, removed: new Set(removedChipKeys).add(c.key) })}
              accessibilityRole="button"
              accessibilityLabel={`Hapus ${c.label} dari pencarian`}
              style={[styles.parsedChip, { backgroundColor: theme.colors.brandSoft }]}
            >
              <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>{c.label}</Text>
              <Feather name="x" size={13} color={theme.colors.brandInk} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {intent !== 'new-projects' && view === 'list' ? <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
        style={{ flexGrow: 0, height: 46, marginTop: 12 }}
      >
        {SORTS.map((item) => <Chip key={item.key} label={t(item.labelKey)} selected={sort === item.key} onPress={() => setSort(item.key)} />)}
      </ScrollView> : null}

      <View style={styles.resultRow}>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>
          {intent === 'new-projects' ? `${projectResults.length} ${t('projectsFound')}` : `${results.length} ${t('propertiesFound')}`}
        </Text>
        <Pressable onPress={saveThisSearch} hitSlop={8}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>{t('saveSearch')}</Text>
        </Pressable>
      </View>

      {intent === 'new-projects' ? (
        <FlatList
          data={projectResults}
          keyExtractor={(project) => project.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: insets.bottom + 110, gap: 16 }}
          refreshControl={<RefreshControl refreshing={fetchingProjects} onRefresh={refetchProjects} tintColor={theme.colors.inkTertiary} />}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/project/${item.id}`)}
              style={[styles.projectCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Image source={{ uri: item.images[0] }} style={styles.projectImage} contentFit="cover" />
              <View style={styles.projectBody}>
                <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>{!item.developerConnected ? 'DATA CONTOH · ' : ''}{item.progressPercent >= 100 ? t('projectReadyBadge') : `${t('projectBuildingBadge')} · ${item.progressPercent}% ${t('percentComplete')}`}</Text>
                <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 5 }]}>{item.name}</Text>
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 3 }]}>{item.area}, {item.city}</Text>
                <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary, marginTop: 10 }]}>{item.units.length ? `${t('startingFrom')} ${formatIDR(Math.min(...item.units.map((unit) => unit.priceFrom)))}` : t('unitPriceUnavailable')}</Text>
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 3 }]}>{item.developer} · {item.units.length} {t('unitTypeCount')} · {item.units.reduce((sum, unit) => sum + unit.available, 0)} {t('unitsAvailable')}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center', marginTop: 48 }]}>{projectsError ? t('projectsLoadError') : t('noMatchingProjects')}</Text>}
        />
      ) : view === 'map' ? (
        results.length ? <View style={styles.mapSection}>
          {mapCities.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroller} contentContainerStyle={styles.cityRow}>
            {mapCities.map((city) => (
              <Chip key={city} label={city} selected={mapCity === city} onPress={() => { setSelectedCity(city); setSelectedMapId(null); }} />
            ))}
          </ScrollView> : null}
          <View style={styles.mapWrap}>
            <PropertyMapView key={mapCity ?? 'empty'} properties={mapResults} onSelect={setSelectedMapId} selectedId={selectedMapProperty?.id} showNearbyPlaces />
            {selectedMapProperty ? (
              <View style={[styles.mapPreview, { backgroundColor: theme.colors.surface }]}>
                <Pressable onPress={() => router.push(`/property/${selectedMapProperty.id}`)} accessibilityRole="button" accessibilityLabel={`${t('openPreview')} ${selectedMapProperty.title}`} style={styles.mapPreviewOpen}>
                  <Image source={{ uri: selectedMapProperty.images[0] }} style={styles.mapPreviewImage} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(selectedMapProperty.price)}</Text>
                    <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 3 }]} numberOfLines={1}>{selectedMapProperty.title}</Text>
                    <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginTop: 3 }]} numberOfLines={1}>{selectedMapProperty.area}, {selectedMapProperty.city}</Text>
                  </View>
                  <Feather name="arrow-up-right" size={18} color={theme.colors.inkPrimary} />
                </Pressable>
              </View>
            ) : null}
          </View>
        </View> : <View style={styles.emptyMap}>
          <Feather name="map-pin" size={24} color={theme.colors.inkTertiary} />
          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 14 }]}>{t('noResultsOnMap')}</Text>
          <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 6, textAlign: 'center' }]}>{t('noResultsOnMapHint')}</Text>
          <Pressable onPress={() => { setQuery(''); setFilters(defaultFilters); }} style={[styles.retryBtn, { backgroundColor: theme.colors.inkPrimary, marginTop: 18 }]}>
            <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{t('seeAllProperties')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          key={`property-columns-${columns}`}
          data={results}
          keyExtractor={(p) => p.id}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? { gap: 14 } : undefined}
          contentContainerStyle={{ gap: 14, paddingHorizontal: 20, paddingTop: 14, paddingBottom: insets.bottom + (compareIds.length >= 2 ? 168 : 110) }}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.colors.inkTertiary} />
          }
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <PropertyCard layout="grid" property={item} onPress={() => router.push(`/property/${item.id}`)} showCompareToggle />
            </View>
          )}
          ListEmptyComponent={
            <View style={{ paddingTop: 60, alignItems: 'center', paddingHorizontal: 32 }}>
              <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, textAlign: 'center' }]}>
                {error ? t('loadPropertiesError') : t('noResults')}
              </Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, textAlign: 'center', marginTop: 6 }]}>
                {error ? t('checkConnectionRetry') : t('tryOtherKeywordOrArea')}
              </Text>
              {error ? (
                <Pressable
                  onPress={() => refetch()}
                  style={[styles.retryBtn, { backgroundColor: theme.colors.inkPrimary, marginTop: 16 }]}
                >
                  <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{t('retry')}</Text>
                </Pressable>
              ) : null}
              {!error ? <Pressable onPress={() => { setQuery(''); setFilters(defaultFilters); }} style={[styles.retryBtn, { backgroundColor: theme.colors.inkPrimary, marginTop: 16 }]}>
                <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{t('seeAllProperties')}</Text>
              </Pressable> : null}
            </View>
          }
        />
      )}

      {intent !== 'new-projects' ? <CompareTray bottom={insets.bottom + 88} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  locationNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 20, marginTop: 12, padding: 12, borderRadius: 14 },
  searchIntro: { paddingHorizontal: 24, marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24 },
  intentRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 14 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 56,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  toggleBtn: { width: 52, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  aiBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  promptCard: { marginHorizontal: 24, marginTop: 12, padding: 20, borderRadius: 22 },
  promptExample: { minHeight: 46, paddingHorizontal: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  historyBox: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 },
  parsedChipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, gap: 6 },
  parsedChip: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  sortRow: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  mapSection: { flex: 1 },
  emptyMap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 110 },
  cityScroller: { flexGrow: 0, height: 54 },
  cityRow: { paddingHorizontal: 20, alignItems: 'center', gap: 8 },
  mapWrap: { flex: 1, marginTop: 12, marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 110 },
  mapPreview: { position: 'absolute', left: 12, right: 12, bottom: 12, borderRadius: 18, padding: 10, ...shadow.soft },
  mapPreviewOpen: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 34 },
  mapPreviewImage: { width: 68, height: 68, borderRadius: 12 },
  projectCard: { borderRadius: 20, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  projectImage: { width: '100%', height: 210 },
  projectBody: { padding: 16 },
});
