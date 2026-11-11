import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { colors, fonts } from '@moments/ui';

import type { EnrichFlow, NoteStepCopy } from '../features/enrich/steps';
import { errorMessage } from '../lib/errors';
import { createNote } from '../lib/notes';
import { StepLayout } from './StepLayout';

export interface NoteStepProps {
  momentId: string;
  copy: NoteStepCopy;
  /** Set during the post-recording wizard; absent when editing a saved Moment. */
  flow?: EnrichFlow;
  onBack: () => void;
  /** Continue to the next step (wizard) or return to the Moment (editing). */
  onNext: () => void;
  /** Wizard only: save this step and skip the rest. */
  onFinish?: () => void;
}

/**
 * Shared free-text step for Prayer, Revelation and Reflection (S8a/c/e).
 *
 * In the wizard, the text is optional: Next saves it if present, otherwise
 * skips. When editing a saved Moment, Save is required and adds the note.
 */
export function NoteStep({ momentId, copy, flow, onBack, onNext, onFinish }: NoteStepProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const trimmed = content.trim();
  const isLastStep = flow ? flow.remaining.length === 0 : true;

  async function saveThen(next: () => void) {
    if (saving) return;
    if (!trimmed) {
      next();
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await createNote({
        momentId,
        kind: copy.kind,
        content: trimmed,
        // Notes added from a saved Moment's player are later additions.
        isUpdated: !flow,
      });
      next();
    } catch (err) {
      setError(errorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  const nextLabel = saving
    ? 'Saving…'
    : !flow
      ? 'Save'
      : !trimmed
        ? 'Skip'
        : isLastStep
          ? 'Finish'
          : 'Next';

  return (
    <StepLayout
      step={flow?.step}
      total={flow?.total}
      title={copy.title}
      subtitle={copy.subtitle}
      onBack={onBack}
      onSave={flow && onFinish ? () => void saveThen(onFinish) : undefined}
      onNext={() => void saveThen(onNext)}
      nextLabel={nextLabel}
      nextDisabled={saving || (!flow && !trimmed)}
    >
      <TextInput
        multiline
        placeholder={copy.placeholder}
        placeholderTextColor={colors.placeholderHand}
        style={styles.input}
        textAlignVertical="top"
        value={content}
        onChangeText={setContent}
        editable={!saving}
        accessibilityLabel={copy.title}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 28,
    fontFamily: fonts.handwriting,
    fontSize: 32,
    lineHeight: 44,
    color: colors.stepFieldText,
    padding: 0,
    minHeight: 200,
  },
  error: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.danger,
    marginTop: 12,
  },
});
