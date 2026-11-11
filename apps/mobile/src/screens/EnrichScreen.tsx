import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '@moments/ui';
import { Tile, PaperGrain } from '@moments/ui';

import {
  ENRICHMENT_LABELS,
  ENRICHMENT_ORDER,
  orderSelection,
  type EnrichmentType,
} from '../features/enrich/steps';

export interface EnrichScreenProps {
  onBack: () => void;
  /** Called with the chosen enrichments, in wizard order. */
  onContinue: (selected: EnrichmentType[]) => void;
  onLater: () => void;
}

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

/**
 * Enrich (S7.dc.html): two-column grid of selectable tiles.
 */
export function EnrichScreen({ onBack, onContinue, onLater }: EnrichScreenProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<EnrichmentType[]>(['scripture', 'prayer', 'revelation']);

  const toggle = (type: EnrichmentType) => {
    setSelected((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

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

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.title}>Would you like to enrich your Moment?</Text>
        <Text style={styles.subtitle}>Add Scripture, a prayer, a revelation and more.</Text>

        <View style={styles.grid}>
          {ENRICHMENT_ORDER.map((type) => (
            <Tile
              key={type}
              label={ENRICHMENT_LABELS[type]}
              selected={selected.includes(type)}
              onPress={() => toggle(type)}
            />
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onContinue(orderSelection(selected))}
          disabled={selected.length === 0}
          style={[styles.continue, selected.length === 0 && styles.continueDisabled]}
        >
          <Text style={styles.continueText}>Continue with selected</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onLater} style={styles.later}>
          <Text style={styles.laterText}>Maybe later</Text>
        </Pressable>
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
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 34,
    lineHeight: 37,
    color: colors.enrichTitle,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.enrichSubtitle,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 36,
  },
  footer: {
    paddingHorizontal: 28,
    gap: 16,
  },
  continue: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: colors.enrichContinue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.white,
  },
  later: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  laterText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.enrichLater,
  },
  continueDisabled: {
    opacity: 0.5,
  },
});
