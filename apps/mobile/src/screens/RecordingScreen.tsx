import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts, makeWaveformBars } from '@moments/ui';
import { Waveform } from '@moments/ui';

import { useRecordingSession } from '../features/recording/RecordingSessionProvider';
import { errorMessage } from '../lib/errors';
import { formatDuration } from '../lib/format';

export interface RecordingScreenProps {
  onBack: () => void;
  /** Opens the note sheet, pinned to this position in the recording (seconds). */
  onAddNote: (timestamp: number) => void;
  onStop: () => void;
}

function BackIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6 L9 12 L15 18"
        stroke={colors.recordingControl}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PauseIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6 L9 18 M15 6 L15 18"
        stroke={colors.recordingControl}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StopIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={colors.recordingControl}
        strokeWidth="1.8"
      />
      <Circle cx="12" cy="12" r="4" fill={colors.recordingControl} />
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5 L19 12 L8 19 Z"
        stroke={colors.recordingControl}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12 L10 17 L19 7"
        stroke={colors.toastCheck}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Briefly shows "Note saved" whenever `trigger` changes. */
function useToast(trigger: number | null) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (trigger === null) return;
    const animation = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [trigger, opacity]);
  return opacity;
}

/**
 * Recording (S3.dc.html): navy screen with timer, waveform, Add notes and
 * Pause/Stop controls. Recording starts when the screen opens.
 */
export function RecordingScreen({ onBack, onAddNote, onStop }: RecordingScreenProps) {
  const insets = useSafeAreaInsets();
  const session = useRecordingSession();
  const { status, elapsed, lastNoteAddedAt, start, pause, resume, stop, reset } = session;
  const [error, setError] = useState<string | null>(null);
  const toastOpacity = useToast(lastNoteAddedAt);
  const bars = useRef(
    makeWaveformBars(68, 250, 7, colors.recordingBar, {
      accentColor: colors.recordingBarAccent,
    }),
  ).current;

  useEffect(() => {
    if (status !== 'idle') return;
    start().catch((err: unknown) =>
      setError(errorMessage(err, 'Could not start recording.')),
    );
    // Start once when the screen opens; later status changes are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    if (status === 'idle' || status === 'stopped') {
      void reset().then(onBack);
      return;
    }
    Alert.alert('Discard this recording?', 'Your audio and notes will not be saved.', [
      { text: 'Keep recording', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => void reset().then(onBack) },
    ]);
  };

  const handleStop = async () => {
    try {
      await stop();
      onStop();
    } catch (err) {
      setError(errorMessage(err, 'Could not stop the recording.'));
    }
  };

  const tenths = Math.floor((elapsed % 1) * 10);
  const isPaused = status === 'paused';

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[styles.toast, { top: insets.top + 52, opacity: toastOpacity }]}
      >
        <CheckIcon />
        <Text style={styles.toastText}>Note saved</Text>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={handleBack}
        style={[styles.back, { top: insets.top + 16 }]}
      >
        <BackIcon />
      </Pressable>

      <View style={[styles.timerWrap, { paddingTop: insets.top + 112 }]}>
        <View style={styles.timerRow} accessibilityLabel={`Recorded ${formatDuration(elapsed)}`}>
          <Text style={styles.timer}>{formatDuration(elapsed)}</Text>
          <Text style={styles.ms}>.{tenths}</Text>
        </View>
        <Text style={styles.label}>{error ?? (isPaused ? 'Paused' : 'Recording')}</Text>
      </View>

      <View style={[styles.waveWrap, isPaused && styles.waveWrapPaused]}>
        <Waveform bars={bars} height={260} barWidth={2} gap={2} paddingHorizontal={28} />
      </View>

      <View style={[styles.controls, { bottom: insets.bottom + 92 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onAddNote(elapsed)}
          disabled={status !== 'recording' && status !== 'paused'}
          style={styles.addNote}
        >
          <Text style={styles.addNoteText}>Add notes</Text>
        </Pressable>

        <View style={styles.roundControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
            onPress={isPaused ? resume : pause}
            disabled={status !== 'recording' && status !== 'paused'}
            style={styles.roundControl}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Stop"
            onPress={handleStop}
            disabled={status !== 'recording' && status !== 'paused'}
            style={styles.roundControl}
          >
            <StopIcon />
          </Pressable>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.recordingBgMid,
  },
  back: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerWrap: {
    alignItems: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timer: {
    fontFamily: fonts.uiLight,
    fontSize: 64,
    color: colors.recordingTimer,
    fontVariant: ['tabular-nums'],
  },
  ms: {
    fontFamily: fonts.uiLight,
    fontSize: 18,
    color: colors.recordingMs,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.recordingLabel,
    marginTop: 4,
  },
  waveWrap: {
    marginTop: 40,
  },
  waveWrapPaused: {
    opacity: 0.4,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: colors.toastBg,
    borderWidth: 1,
    borderColor: colors.toastBorder,
    zIndex: 1,
  },
  toastText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.onNavy,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 28,
  },
  addNote: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 9999,
    borderWidth: 1.2,
    borderColor: colors.recordingAddBorder,
  },
  addNoteText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.recordingAddText,
  },
  roundControls: {
    flexDirection: 'row',
    gap: 40,
  },
  roundControl: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.2,
    borderColor: colors.recordingControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
