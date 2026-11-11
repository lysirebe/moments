import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radii } from '@moments/ui';
import { BottomNav, PaperGrain } from '@moments/ui';
import { pickAudioFile, type SelectedAudioFile } from '../lib/audio';

export interface ImportScreenProps {
  onBack: () => void;
  onChooseFiles: (file: SelectedAudioFile) => void;
  onVoiceMemos: (file: SelectedAudioFile) => void;
  onRecord: () => void;
  onCollections: () => void;
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

function FilesIcon() {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6 L4 18 L20 18 L20 8 L12 8 L10 6 Z"
        stroke={colors.importIcon}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MicIcon() {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3 L12 15 M7 10 L12 15 L17 10 M5 19 L19 19"
        stroke={colors.importIcon}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Import (S11a.dc.html): "Choose from Files" and "Voice Memos" cards.
 */
export function ImportScreen({
  onBack,
  onChooseFiles,
  onVoiceMemos,
  onRecord,
  onCollections,
}: ImportScreenProps) {
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  const handlePick = async (onSelected: (file: SelectedAudioFile) => void) => {
    setError(null);
    try {
      const file = await pickAudioFile();
      if (file) onSelected(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that file.');
    }
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

      <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.title}>Import</Text>
        <Text style={styles.subtitle}>Bring a recording into Moments.</Text>
      </View>

      <View style={styles.cards}>
        <Pressable
          accessibilityRole="button"
          onPress={() => handlePick(onChooseFiles)}
          style={styles.card}
        >
          <View style={styles.iconCircle}>
            <FilesIcon />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Choose from Files</Text>
            <Text style={styles.cardSubtitle}>M4A, MP3, WAV</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handlePick(onVoiceMemos)}
          style={styles.card}
        >
          <View style={styles.iconCircle}>
            <MicIcon />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Voice Memos</Text>
            <Text style={styles.cardSubtitle}>From your device</Text>
          </View>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.handWrap}>
        <Text style={styles.hand}>imported Moments stay private until you share them.</Text>
      </View>

      <View style={[styles.nav, { paddingBottom: insets.bottom + 8 }]}>
        <BottomNav
          active="import"
          onPress={(tab) => {
            if (tab === 'record') onRecord();
            if (tab === 'collections') onCollections();
          }}
        />
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
  header: {
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 42,
    color: colors.importTitle,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.importSubtitle,
    marginTop: 4,
  },
  cards: {
    paddingHorizontal: 28,
    marginTop: 32,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.importCardBorder,
    backgroundColor: colors.importCardBg,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.importIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.importCardTitle,
  },
  cardSubtitle: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.importCardSubtitle,
  },
  handWrap: {
    paddingHorizontal: 28,
    marginTop: 28,
  },
  hand: {
    fontFamily: fonts.handwriting,
    fontSize: 28,
    color: colors.importHand,
  },
  errorWrap: {
    paddingHorizontal: 28,
    marginTop: 20,
  },
  errorText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.danger,
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
