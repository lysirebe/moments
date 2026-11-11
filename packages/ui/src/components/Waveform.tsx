import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

export interface WaveformBar {
  /** Bar height in px. */
  h: number;
  /** Bar opacity. */
  o?: number;
  /** Bar colour. */
  c?: string;
  /** Vertical offset in px. */
  dy?: number;
}

export interface WaveformProps {
  /** Bars to render, left to right. */
  bars: WaveformBar[];
  /** Container height in px. */
  height?: number;
  /** Bar width in px. */
  barWidth?: number;
  /** Gap between bars in px. */
  gap?: number;
  /** Horizontal padding in px. */
  paddingHorizontal?: number;
  style?: ViewStyle;
}

/**
 * A thin vertical-bar waveform used across the recording, player and step
 * screens. Bars are laid out with `space-between` so they fill the width.
 */
export function Waveform({
  bars,
  height = 44,
  barWidth = 2,
  gap = 2,
  paddingHorizontal = 0,
  style,
}: WaveformProps) {
  return (
    <View style={[styles.container, { height, paddingHorizontal, gap }, style]}>
      {bars.map((bar, index) => (
        <View
          key={index}
          style={{
            width: barWidth,
            height: bar.h,
            borderRadius: barWidth / 2,
            backgroundColor: bar.c ?? '#3156B8',
            opacity: bar.o ?? 1,
            transform: [{ translateY: bar.dy ?? 0 }],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
