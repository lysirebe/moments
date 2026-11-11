import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export interface StepDotsProps {
  /** Total number of steps. */
  total: number;
  /** Current step, 0-indexed. */
  current: number;
}

/**
 * A row of dots joined by thin lines, used at the top of the enrich step forms.
 */
export function StepDots({ total, current }: StepDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        return (
          <React.Fragment key={index}>
            {index > 0 && <View style={styles.line} />}
            <View style={[styles.dot, isActive ? styles.dotActive : styles.dotEmpty]} />
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: colors.cobalt,
  },
  dotEmpty: {
    borderWidth: 1,
    borderColor: colors.cobalt,
  },
  line: {
    width: 34,
    height: 1,
    backgroundColor: 'rgba(49,86,184,0.4)',
  },
});
