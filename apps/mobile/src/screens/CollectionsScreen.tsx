import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, makeMiniBars } from '@moments/ui';
import { BottomNav, PaperGrain, Waveform } from '@moments/ui';
import type { MomentType } from '@moments/types';
import { useMoments } from '../features/moment/useMoments';
import { formatDuration, formatLongDate } from '../lib/format';

export interface CollectionsScreenProps {
  onBack: () => void;
  onOpenMoment: (momentId: string) => void;
  onRecord: () => void;
  onImport: () => void;
}

const FILTERS: { label: string; value: MomentType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Quiet time', value: 'quiet_time' },
  { label: 'Prayer', value: 'prayer' },
  { label: 'Living room', value: 'living_room' },
  { label: 'Conference', value: 'conference' },
  { label: 'Spontaneous', value: 'spontaneous' },
  { label: 'Worship', value: 'worship' },
  { label: 'Other', value: 'other' },
];

function BackIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6 L9 12 L15 18"
        stroke={colors.cobalt}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Arrow() {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6 L15 12 L9 18"
        stroke={colors.textSecondary}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Collections (S10.dc.html): search, filter, list of Moment cards, bottom nav.
 */
export function CollectionsScreen({
  onBack,
  onOpenMoment,
  onRecord,
  onImport,
}: CollectionsScreenProps) {
  const insets = useSafeAreaInsets();
  const { moments, loading, error } = useMoments();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MomentType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const visibleMoments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return moments.filter((moment) => {
      const matchesQuery = q === '' || moment.title.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || moment.type === filter;
      return matchesQuery && matchesFilter;
    });
  }, [moments, query, filter]);

  const toggleFilter = useCallback((value: MomentType | 'all') => {
    setFilter(value);
  }, []);

  return (
    <View style={styles.container}>
      <PaperGrain opacity={0.35} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={[styles.back, { top: insets.top + 16 }]}
      >
        <BackIcon />
      </Pressable>

      <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.title}>Collections</Text>
        <Text style={styles.subtitle}>Your Moments</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search"
          placeholderTextColor={colors.placeholder}
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter"
          onPress={() => setShowFilters((s) => !s)}
          style={[styles.filter, showFilters && styles.filterActive]}
        >
          <Text style={styles.filterText}>Filter</Text>
        </Pressable>
      </View>

      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((item) => {
            const active = filter === item.value;
            return (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => toggleFilter(item.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.cobalt} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : visibleMoments.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            {moments.length === 0 ? 'No Moments yet' : 'No matches'}
          </Text>
          <Text style={styles.emptyText}>
            {moments.length === 0
              ? 'Record or import a Moment to see it here.'
              : 'Try a different search or filter.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {visibleMoments.map((moment, index) => (
            <Pressable
              key={moment.id}
              accessibilityRole="button"
              onPress={() => onOpenMoment(moment.id)}
              style={styles.card}
            >
              <View style={styles.thumb}>
                <Waveform
                  bars={makeMiniBars(12, 40, index + 1, colors.collectionsCardWave, {
                    wave: 4,
                    minHeight: 3,
                  })}
                  height={40}
                  barWidth={2}
                  gap={2}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {moment.title}
                </Text>
                <Text style={styles.cardMeta}>
                  {formatLongDate(moment.date)} · {formatDuration(moment.audio?.duration ?? 0)}
                </Text>
              </View>
              <Arrow />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={[styles.nav, { paddingBottom: insets.bottom + 8 }]}>
        <BottomNav
          active="collections"
          onPress={(tab) => {
            if (tab === 'import') onImport();
            if (tab === 'record') onRecord();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  back: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 42,
    color: colors.collectionsTitle,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.collectionsSubtitle,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 28,
    marginTop: 24,
  },
  search: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.collectionsSearchBorder,
    backgroundColor: colors.collectionsSearchBg,
    paddingHorizontal: 16,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.collectionsSearchText,
  },
  filter: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.collectionsFilterBorder,
    backgroundColor: colors.collectionsFilterBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {
    borderColor: colors.cobalt,
    backgroundColor: colors.paleBlue,
  },
  filterText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.cobalt,
  },
  filterRow: {
    paddingHorizontal: 28,
    paddingTop: 14,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.collectionsFilterBorder,
    backgroundColor: colors.collectionsFilterBg,
  },
  chipActive: {
    borderColor: colors.cobalt,
    backgroundColor: colors.paleBlue,
  },
  chipText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.collectionsCardMeta,
  },
  chipTextActive: {
    color: colors.cobalt,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.collectionsCardTitle,
  },
  emptyText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.collectionsCardMeta,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.collectionsCardBorder,
    backgroundColor: colors.collectionsCardBg,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.collectionsCardTitle,
  },
  cardMeta: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.collectionsCardMeta,
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
