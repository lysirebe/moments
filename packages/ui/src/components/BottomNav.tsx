import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

export type BottomNavTab = 'import' | 'record' | 'collections';

export interface BottomNavProps {
  active: BottomNavTab;
  onPress: (tab: BottomNavTab) => void;
}

function ImportIcon({ active }: { active: boolean }) {
  const color = active ? colors.cobalt : colors.textSecondary;
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3 L12 15 M7 10 L12 15 L17 10 M5 19 L19 19"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CollectionsIcon({ active }: { active: boolean }) {
  const color = active ? colors.cobalt : colors.textSecondary;
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="8" r="3.4" stroke={color} strokeWidth="1.6" />
      <Circle cx="16" cy="8" r="3.4" stroke={color} strokeWidth="1.6" />
      <Circle cx="8" cy="16" r="3.4" stroke={color} strokeWidth="1.6" />
      <Circle cx="16" cy="16" r="3.4" stroke={color} strokeWidth="1.6" />
    </Svg>
  );
}

function RecordOrb({ active }: { active: boolean }) {
  return (
    <View style={[styles.orb, active && styles.orbActive]}>
      <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="5" stroke={colors.white} strokeWidth="1.8" />
        <Path
          d="M12 3 L12 5 M12 19 L12 21 M3 12 L5 12 M19 12 L21 12"
          stroke={colors.white}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

/**
 * The bottom navigation bar: Import (left), centre Record orb, Collections.
 */
export function BottomNav({ active, onPress }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Import"
        onPress={() => onPress('import')}
        style={styles.tab}
      >
        <ImportIcon active={active === 'import'} />
        <Text style={[styles.label, active === 'import' && styles.labelActive]}>Import</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Record"
        onPress={() => onPress('record')}
        style={styles.orbWrap}
      >
        <RecordOrb active={active === 'record'} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Collections"
        onPress={() => onPress('collections')}
        style={styles.tab}
      >
        <CollectionsIcon active={active === 'collections'} />
        <Text style={[styles.label, active === 'collections' && styles.labelActive]}>
          Collections
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.cobalt,
  },
  orbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbActive: {
    backgroundColor: colors.darkBlue,
  },
});
