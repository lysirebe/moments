import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@moments/ui';
import { MomentsLogo } from '@moments/ui';

import { errorMessage } from '../lib/errors';

export interface SavingScreenProps {
  /** Performs the save and resolves with the new Moment's ID. */
  save: () => Promise<string>;
  onDone: (momentId: string) => void;
  /** Leaves the screen after a failed save (the recording is kept). */
  onCancel: () => void;
}

/** The fill animation always plays for at least this long, so it never flickers. */
const MIN_DURATION_MS = 1800;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Saving (S6.dc.html): navy screen with the logo filling left to right and a
 * thin progress line while the recording uploads.
 */
export function SavingScreen({ save, onDone, onCancel }: SavingScreenProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const run = useCallback(async () => {
    const [momentId] = await Promise.all([save(), wait(MIN_DURATION_MS)]);
    return momentId;
  }, [save]);

  useEffect(() => {
    let active = true;
    progress.setValue(0);
    barWidth.setValue(0);
    const animation = Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: MIN_DURATION_MS, useNativeDriver: false }),
      Animated.timing(barWidth, {
        toValue: 120,
        duration: MIN_DURATION_MS,
        useNativeDriver: false,
      }),
    ]);
    animation.start();

    run()
      .then((momentId) => {
        if (active) onDone(momentId);
      })
      .catch((err: unknown) => {
        if (active) setError(errorMessage(err, 'Your Moment could not be saved.'));
      });

    return () => {
      active = false;
      animation.stop();
    };
    // `attempt` re-runs the save when the user taps Try again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <MomentsLogo color={colors.savingOutline} width={150} progress={0} />
        <Animated.View style={styles.logoFill}>
          <MomentsLogo color={colors.savingFill} width={150} progress={progress} />
        </Animated.View>
      </View>

      <Text style={styles.title}>{error ? 'Something went wrong' : 'Saving your Moment'}</Text>

      {error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setError(null);
                setAttempt((n) => n + 1);
              }}
              style={styles.action}
            >
              <Text style={styles.actionText}>Try again</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.action}>
              <Text style={styles.actionText}>Back</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { width: barWidth }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.savingBgMid,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    position: 'relative',
  },
  logoFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.savingTitle,
    marginTop: 40,
  },
  track: {
    width: 120,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.savingTrack,
    marginTop: 20,
    overflow: 'hidden',
  },
  bar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.savingBar,
  },
  error: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.savingTitle,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  action: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.savingTrack,
  },
  actionText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.savingTitle,
  },
});
