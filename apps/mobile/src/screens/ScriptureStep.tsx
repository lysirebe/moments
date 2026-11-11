import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@moments/ui';

import type { EnrichFlow } from '../features/enrich/steps';
import { ScripturePicker, type ScriptureSelection } from '../features/scripture';
import { errorMessage } from '../lib/errors';
import { createScripture } from '../lib/scriptures';
import { StepLayout } from './StepLayout';

export interface ScriptureStepProps {
  momentId: string;
  /** Set during the post-recording wizard; absent when editing a saved Moment. */
  flow?: EnrichFlow;
  onBack: () => void;
  /** Continue to the next step (wizard) or return to the Moment (editing). */
  onNext: () => void;
  /** Wizard only: stop adding enrichments. */
  onFinish?: () => void;
}

/**
 * Scripture step (S8b.dc.html): pick a translation, book, chapter and verses
 * from api.bible. Choosing a passage saves it to the Moment.
 */
export function ScriptureStep({ momentId, flow, onBack, onNext, onFinish }: ScriptureStepProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const handleSelect = async (selection: ScriptureSelection) => {
    setSaving(true);
    setError(undefined);
    try {
      await createScripture({ momentId, ...selection });
      onNext();
    } catch (err) {
      setError(errorMessage(err, 'Could not save this passage. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepLayout
      step={flow?.step}
      total={flow?.total}
      title="Scripture"
      subtitle="Add a verse that spoke to you."
      onBack={onBack}
      onSave={flow ? onFinish : undefined}
      onNext={flow ? onNext : undefined}
      nextLabel="Skip"
    >
      <View style={styles.picker}>
        <ScripturePicker onSelect={handleSelect} saving={saving} showHeader={false} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  picker: {
    marginTop: 28,
  },
  error: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.danger,
    marginTop: 12,
  },
});
