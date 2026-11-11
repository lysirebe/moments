import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '@moments/ui';
import { Orb, BottomNav, PaperGrain } from '@moments/ui';
import { useAuth } from '../features/auth/AuthProvider';
import { useMoments } from '../features/moment/useMoments';
import { getProfile } from '../lib/profile';
import { formatRelativeDate } from '../lib/format';

export interface HomeScreenProps {
  onRecord: () => void;
  onOpenMoment: (momentId: string) => void;
  onSeeAll: () => void;
  onImport: () => void;
  onCollections: () => void;
  onSignOut: () => void;
}

function CollectionsIcon() {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 4h18v5H3z"
        stroke={colors.cobalt}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"
        stroke={colors.cobalt}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SignOutIcon() {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke={colors.cobalt}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 17l5-5-5-5M21 12H9"
        stroke={colors.cobalt}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Chevron() {
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
 * Home (S2.dc.html): greeting, recording orb, Recent Moments row, bottom nav.
 */
export function HomeScreen({
  onRecord,
  onOpenMoment,
  onSeeAll,
  onImport,
  onCollections,
  onSignOut,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { moments, error } = useMoments();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getProfile(userId)
      .then((profile) => {
        if (active) setDisplayName(profile?.displayName ?? null);
      })
      .catch((err: unknown) => {
        // Not fatal: the greeting falls back to a generic name.
        console.warn('Could not load profile', err);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const greetingName = displayName ?? 'friend';
  const recentMoments = moments.slice(0, 3);

  return (
    <View style={styles.container}>
      <PaperGrain opacity={0.35} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.greeting}>
          Welcome back,{'\n'}
          {greetingName}
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Collections"
            onPress={onCollections}
            style={styles.headerIcon}
          >
            <CollectionsIcon />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={onSignOut}
            style={styles.headerIcon}
          >
            <SignOutIcon />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Record a moment"
          onPress={onRecord}
          style={styles.orbWrap}
        >
          <Orb size={300} />
        </Pressable>

        <View style={styles.orbCaption}>
          <Text style={styles.orbTitle}>Come sit with Jesus</Text>
          <Text style={styles.orbSubtitle}>Press and be still</Text>
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Moments</Text>
          <Pressable accessibilityRole="button" onPress={onSeeAll} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentRow}
        >
          {error ? (
            <Text style={styles.recentEmpty}>{error}</Text>
          ) : recentMoments.length === 0 ? (
            <Text style={styles.recentEmpty}>
              No moments yet. Press the orb to record your first one.
            </Text>
          ) : (
            recentMoments.map((moment) => (
              <Pressable
                key={moment.id}
                accessibilityRole="button"
                onPress={() => onOpenMoment(moment.id)}
                style={styles.recentCard}
              >
                <View style={styles.recentCardBody}>
                  <Text style={styles.recentCardTitle} numberOfLines={1}>
                    {moment.title}
                  </Text>
                  <Text style={styles.recentCardTime}>{formatRelativeDate(moment.date)}</Text>
                </View>
                <Chevron />
              </Pressable>
            ))
          )}
        </ScrollView>
      </ScrollView>

      <View style={[styles.nav, { paddingBottom: insets.bottom + 8 }]}>
        <BottomNav
          active="record"
          onPress={(tab) => {
            if (tab === 'import') onImport();
            if (tab === 'collections') onCollections();
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
    backgroundColor: colors.homeBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  greeting: {
    fontFamily: fonts.handwriting,
    fontSize: 32,
    lineHeight: 38,
    color: colors.cobalt,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 120,
  },
  orbWrap: {
    alignItems: 'center',
    marginTop: 24,
  },
  orbCaption: {
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  orbTitle: {
    fontFamily: fonts.handwriting,
    fontSize: 34,
    color: colors.cobalt,
  },
  orbSubtitle: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 16,
  },
  recentTitle: {
    fontFamily: fonts.heading,
    fontSize: 25,
    color: colors.darkBlue,
  },
  seeAll: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.cobalt,
  },
  recentRow: {
    gap: 14,
    paddingRight: 28,
  },
  recentEmpty: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textSecondary,
    paddingVertical: 24,
  },
  recentCard: {
    width: 292,
    height: 84,
    borderRadius: 18,
    backgroundColor: colors.warmWhiteCard,
    borderWidth: 1,
    borderColor: colors.homeBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  recentCardBody: {
    flex: 1,
    gap: 4,
  },
  recentCardTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.darkBlue,
  },
  recentCardTime: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
