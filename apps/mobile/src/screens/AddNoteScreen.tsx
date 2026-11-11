import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii } from '@moments/ui';

import { useRecordingSession } from '../features/recording/RecordingSessionProvider';
import { formatDuration } from '../lib/format';

export interface AddNoteScreenProps {
  /** Position in the recording the note is pinned to, in seconds. */
  timestamp: number;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Add-Note (S4.dc.html): a note sheet over the recorder with a live timer, the
 * captured timestamp, and a ruled journal textarea. The recording keeps running
 * underneath while the sheet is open.
 */
export function AddNoteScreen({ timestamp, onClose, onSave }: AddNoteScreenProps) {
  const insets = useSafeAreaInsets();
  const { elapsed, status, addNote } = useRecordingSession();
  const [content, setContent] = useState('');
  const canSave = content.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addNote(content, timestamp);
    onSave();
  };

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.grabber} />

      <View style={styles.header}>
        <Text style={styles.recording}>
          {status === 'paused' ? 'Paused' : 'Recording'} {formatDuration(elapsed)}
        </Text>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.atRow}>
        <Text style={styles.at}>at {formatDuration(timestamp)}</Text>
      </View>

      <TextInput
        multiline
        autoFocus
        value={content}
        onChangeText={setContent}
        placeholder="Type what's on your heart..."
        placeholderTextColor={colors.noteSheetPlaceholder}
        style={styles.input}
        textAlignVertical="top"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        disabled={!canSave}
        onPress={handleSave}
        style={[styles.save, !canSave && styles.saveDisabled]}
      >
        <Text style={styles.saveText}>Save note</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.noteSheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.noteSheetGrabber,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  recording: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.noteSheetLabel,
  },
  close: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  closeText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.noteSheetClose,
  },
  atRow: {
    marginTop: 8,
  },
  at: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.noteSheetLabel,
  },
  input: {
    flex: 1,
    marginTop: 16,
    fontFamily: fonts.handwriting,
    fontSize: 32,
    lineHeight: 44,
    color: colors.noteSheetText,
    padding: 0,
  },
  save: {
    height: 52,
    borderRadius: radii.button,
    backgroundColor: colors.noteSheetSave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.white,
  },
  saveDisabled: {
    opacity: 0.5,
  },
});
