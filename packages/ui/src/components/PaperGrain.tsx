import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface PaperGrainProps {
  /** Overall opacity of the grain overlay. */
  opacity?: number;
}

/**
 * A subtle paper-grain texture used on light (warm-white) screens. The design
 * uses an SVG `feTurbulence` filter; this approximates it with a faint,
 * deterministic dot grid so it renders identically on every platform.
 */
export function PaperGrain({ opacity = 0.35 }: PaperGrainProps) {
  const dots: React.ReactNode[] = [];
  const cols = 16;
  const rows = 34;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = (i / cols) * 100;
      const y = (j / rows) * 100;
      const jitter = ((i * 7 + j * 13) % 5) / 5;
      dots.push(
        <View
          key={`${i}-${j}`}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: 1.4,
            height: 1.4,
            borderRadius: 0.7,
            backgroundColor: 'rgba(49,86,184,0.05)',
            opacity: 0.4 + jitter * 0.6,
          }}
        />,
      );
    }
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      {dots}
    </View>
  );
}
