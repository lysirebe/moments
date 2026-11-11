import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@moments/ui';
import { StepDots, PaperGrain } from '@moments/ui';

export interface StepLayoutProps {
  /** Omit step/total to hide the step dots (single-step editing). */
  step?: number;
  total?: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
  /** Omit to hide the top Save action. */
  onSave?: () => void;
  /** Omit to hide the footer button. */
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

/**
 * Shared layout for the enrich step forms (S8a–S8e): step dots, title, subtitle,
 * content, and Back / Save / Next controls.
 */
export function StepLayout({
  step,
  total,
  title,
  subtitle,
  children,
  onBack,
  onSave,
  onNext,
  nextLabel = 'Next',
  nextDisabled,
}: StepLayoutProps) {
  const insets = useSafeAreaInsets();
  const showDots = step !== undefined && total !== undefined;

  return (
    <View style={styles.container}>
      <PaperGrain opacity={0.35} />

      <View style={[styles.top, { paddingTop: insets.top + 20 }]}>
        {showDots && (
          <View style={styles.dotsRow}>
            <StepDots total={total} current={step} />
            <Text style={styles.count}>
              {step + 1} of {total}
            </Text>
          </View>
        )}

        <View style={[styles.topActions, !showDots && styles.topActionsFlush]}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.action}>
            <Text style={styles.actionText}>Back</Text>
          </Pressable>
          {onSave && (
            <Pressable accessibilityRole="button" onPress={onSave} style={styles.action}>
              <Text style={styles.actionText}>Save</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>

      {onNext && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: nextDisabled }}
            disabled={nextDisabled}
            onPress={onNext}
            style={[styles.next, nextDisabled && styles.nextDisabled]}
          >
            <Text style={styles.nextText}>{nextLabel}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  top: {
    paddingHorizontal: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.stepCount,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  topActionsFlush: {
    marginTop: 0,
  },
  action: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  actionText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.stepBack,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 120,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.stepTitle,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.stepSubtitle,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
  },
  next: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: colors.stepNext,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextDisabled: {
    opacity: 0.5,
  },
  nextText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.stepNextText,
  },
});
