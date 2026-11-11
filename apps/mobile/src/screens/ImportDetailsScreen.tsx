import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, makeMiniBars } from '@moments/ui';
import { Waveform, PaperGrain } from '@moments/ui';
import { pickAudioFile, type SelectedAudioFile } from '../lib/audio';
import { formatDuration, formatFileSize } from '../lib/format';

export interface ImportDetailsScreenProps {
  file: SelectedAudioFile;
  onBack: () => void;
  onImport: (file: SelectedAudioFile, title: string) => void;
}

function BackIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6 L9 12 L15 18"
        stroke={colors.cobalt}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Import-Details (S11b.dc.html): file card, editable title, recorded-on date,
 * and an Import Moment button.
 */
export function ImportDetailsScreen({ file, onBack, onImport }: ImportDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(file);
  const [title, setTitle] = useState(file.fileName.replace(/\.[^.]+$/, ''));
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bars = makeMiniBars(52, 40, 9, colors.importDetailsBar, {
    wave: 4,
    minHeight: 3,
  });

  const meta = [formatDuration(selected.duration), formatFileSize(selected.size)]
    .filter(Boolean)
    .join(' · ');

  const handleChange = async () => {
    setError(null);
    try {
      const next = await pickAudioFile();
      if (next) {
        setSelected(next);
        setTitle(next.fileName.replace(/\.[^.]+$/, ''));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that file.');
    }
  };

  const handleImport = async () => {
    setError(null);
    setImporting(true);
    try {
      await onImport(selected, title.trim() || selected.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import this file.');
      setImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <PaperGrain opacity={0.35} />

      <View style={[styles.top, { paddingTop: insets.top + 16 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={styles.iconBtn}
        >
          <BackIcon />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Add details</Text>

        <View style={styles.fileCard}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selected.fileName}
            </Text>
            <Text style={styles.fileMeta}>{meta}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={handleChange} style={styles.change}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
          <Waveform
            bars={bars}
            height={40}
            barWidth={2}
            gap={2}
            paddingHorizontal={0}
            style={styles.fileWave}
          />
        </View>

        <TextInput
          placeholder="Title"
          placeholderTextColor={colors.importDetailsTitleInput}
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />

        <Text style={styles.label}>RECORDED ON</Text>
        <Pressable accessibilityRole="button" style={styles.dateButton}>
          <Text style={styles.dateText}>10 October 2026</Text>
        </Pressable>

        <Text style={styles.hint}>You can add notes, Scripture and more after importing.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={handleImport}
          disabled={importing}
          style={[styles.importBtn, importing && styles.importBtnDisabled]}
        >
          <Text style={styles.importText}>{importing ? 'Importing…' : 'Import Moment'}</Text>
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
  top: {
    paddingHorizontal: 24,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 120,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 38,
    color: colors.importDetailsTitle,
  },
  fileCard: {
    marginTop: 28,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.importDetailsCardBorder,
    backgroundColor: colors.importDetailsCardBg,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileName: {
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: colors.importDetailsName,
  },
  fileMeta: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.importDetailsMeta,
    marginTop: 2,
  },
  change: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  changeText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.importDetailsChange,
  },
  fileWave: {
    marginTop: 16,
  },
  titleInput: {
    marginTop: 28,
    fontFamily: fonts.handwriting,
    fontSize: 32,
    color: colors.importDetailsTitleInput,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.importDetailsTitleUnderline,
    paddingBottom: 8,
  },
  label: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 11,
    letterSpacing: 1.3,
    color: colors.importDetailsLabel,
    marginTop: 28,
  },
  dateButton: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.importDetailsCardBorder,
    backgroundColor: colors.importDetailsCardBg,
  },
  dateText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.importDetailsName,
  },
  hint: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.importDetailsMeta,
    marginTop: 24,
  },
  errorText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.danger,
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
  },
  importBtn: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: colors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtnDisabled: {
    opacity: 0.6,
  },
  importText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.white,
  },
});
