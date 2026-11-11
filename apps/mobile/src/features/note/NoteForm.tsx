import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, Button, colors, spacing, radii } from '@moments/ui';
import type { MomentNoteKind } from '@moments/types';

import { Select } from '../scripture/Select';

export interface NoteFormInput {
  kind: MomentNoteKind;
  content: string;
}

interface NoteFormProps {
  onSave: (input: NoteFormInput) => void;
  onCancel: () => void;
  saving?: boolean;
  initialKind?: MomentNoteKind;
}

const KIND_OPTIONS: { label: string; value: MomentNoteKind }[] = [
  { label: 'Prayer', value: 'prayer' },
  { label: 'Revelation', value: 'revelation' },
  { label: 'Reflection', value: 'reflection' },
];

export function NoteForm({ onSave, onCancel, saving, initialKind = 'reflection' }: NoteFormProps) {
  const [kind, setKind] = useState<MomentNoteKind>(initialKind);
  const [content, setContent] = useState('');

  const canSave = content.trim().length > 0 && !saving;

  function handleSave() {
    if (!canSave) return;
    onSave({ kind, content: content.trim() });
  }

  return (
    <View style={styles.container}>
      <Text variant="title">Add note</Text>

      <Select
        label="Kind"
        placeholder="Select a kind"
        value={kind}
        options={KIND_OPTIONS}
        onSelect={(value) => setKind(value as MomentNoteKind)}
      />

      <TextInput
        style={styles.input}
        placeholder="Write your note…"
        placeholderTextColor={colors.textMuted}
        multiline
        value={content}
        onChangeText={setContent}
      />

      <View style={styles.actions}>
        <Button label="Save" onPress={handleSave} disabled={!canSave} />
        <Button label="Cancel" variant="ghost" onPress={onCancel} disabled={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    color: colors.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
