import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@moments/ui';
import { MomentsLogo, PaperGrain } from '@moments/ui';

export interface CompleteScreenProps {
  onViewMoment: () => void;
  onHome: () => void;
}

/**
 * Complete (S8f.dc.html): confirmation with "View Moment".
 */
export function CompleteScreen({ onViewMoment, onHome }: CompleteScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <PaperGrain opacity={0.35} />

      <View style={styles.content}>
        <MomentsLogo color={colors.completeLogo} width={150} />
        <Text style={styles.title}>Your Moment has been enriched</Text>
        <Text style={styles.hand}>it&rsquo;s yours to come back to.</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={onViewMoment}
          style={styles.button}
        >
          <Text style={styles.buttonText}>View Moment</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onHome}
          style={styles.later}
        >
          <Text style={styles.laterText}>Back to home</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.completeTitle,
    textAlign: 'center',
    marginTop: 32,
  },
  hand: {
    fontFamily: fonts.handwriting,
    fontSize: 32,
    color: colors.completeHand,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 28,
    gap: 16,
  },
  button: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: colors.completeButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.completeButtonText,
  },
  later: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  laterText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.completeLater,
  },
});
