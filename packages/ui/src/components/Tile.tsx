import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radii } from '../theme';

export interface TileProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function CheckBadge() {
  return (
    <View style={styles.badge}>
      <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 12 L10 17 L19 7"
          stroke={colors.white}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

/**
 * A square tile in the Enrich grid. Selected tiles get a pale-blue fill and a
 * check badge in the top-right corner.
 */
export function Tile({ label, selected, onPress }: TileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        selected && styles.tileSelected,
        pressed && styles.pressed,
      ]}
    >
      {selected && <CheckBadge />}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.tile,
    borderWidth: 1.2,
    borderColor: 'rgba(49,86,184,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  tileSelected: {
    backgroundColor: colors.paleBlue,
    borderColor: colors.cobalt,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.cobalt,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.darkBlue,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
