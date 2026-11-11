import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@moments/ui';
import { PaperGrain } from '@moments/ui';

/** Everything needed to show one enrichment in full. */
export interface EnrichmentDetailData {
  /** Section label, e.g. "Scripture" or "Prayer". */
  label: string;
  /** Long-form text (a passage, prayer, revelation or reflection). */
  body?: string;
  /** Shown under the body, e.g. "Psalm 42:1 · NIV". */
  reference?: string;
  /** Timestamped notes captured during the recording. */
  entries?: { time?: string; text: string }[];
  /** Shown as a caption, e.g. when the note was added. */
  meta?: string;
  /** Scripture bodies get the opening quote mark. */
  quote?: boolean;
}

export interface EnrichmentDetailProps {
  detail: EnrichmentDetailData | null;
  onClose: () => void;
}

/**
 * Full view of a single enrichment opened from the Player sheet.
 */
export function EnrichmentDetail({ detail, onClose }: EnrichmentDetailProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={Boolean(detail)} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <PaperGrain opacity={0.35} />

        <View style={[styles.top, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.label}>{detail?.label.toUpperCase()}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        >
          {detail?.body ? (
            <View style={styles.card}>
              {detail.quote ? <Text style={styles.quote}>“</Text> : null}
              <Text style={styles.body}>{detail.body}</Text>
              {detail.reference ? <Text style={styles.reference}>{detail.reference}</Text> : null}
            </View>
          ) : null}

          {detail?.entries?.map((entry, index) => (
            <View key={index} style={styles.entry}>
              {entry.time ? (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{entry.time}</Text>
                </View>
              ) : null}
              <Text style={styles.entryText}>{entry.text}</Text>
            </View>
          ))}

          {detail?.meta ? <Text style={styles.meta}>{detail.meta}</Text> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  label: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    letterSpacing: 1.3,
    color: colors.playerSheetMeta,
  },
  close: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  closeText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.cobalt,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    gap: 10,
  },
  card: {
    padding: 22,
    borderRadius: 18,
    backgroundColor: colors.playerSheetCardBg,
    borderWidth: 1,
    borderColor: colors.playerSheetCardBorder,
  },
  quote: {
    fontFamily: fonts.heading,
    fontSize: 40,
    lineHeight: 30,
    color: colors.playerSheetIcon,
  },
  body: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 30,
    color: colors.playerSheetNoteText,
    marginTop: 4,
  },
  reference: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.playerSheetRef,
    marginTop: 14,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.playerSheetRowBorder,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.playerSheetNoteChip,
  },
  chipText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.playerSheetNoteChipText,
  },
  entryText: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 22,
    color: colors.playerSheetNoteText,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.playerSheetMeta,
    marginTop: 12,
  },
});
