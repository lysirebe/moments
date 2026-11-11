import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radii } from '../theme';
import { Waveform, type WaveformBar } from './Waveform';

export interface PlayerCardProps {
  /** Duration label, e.g. "12:46". */
  duration: string;
  /** Mini waveform bars. */
  bars: WaveformBar[];
  onPlay?: () => void;
}

function PlayIcon() {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5 L19 12 L8 19 Z"
        fill={colors.white}
        stroke={colors.white}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * A compact player row: a round play button, a mini waveform and the duration.
 */
export function PlayerCard({ duration, bars, onPlay }: PlayerCardProps) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Play"
        onPress={onPlay}
        style={styles.play}
      >
        <PlayIcon />
      </Pressable>
      <Waveform bars={bars} height={36} barWidth={2} gap={2} style={styles.wave} />
      <Text style={styles.duration}>{duration}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(49,86,184,0.12)',
  },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    flex: 1,
  },
  duration: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
