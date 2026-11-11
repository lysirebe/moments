import type { MomentNoteKind } from '@moments/types';

/** The kinds of enrichment that can be added to a Moment. */
export type EnrichmentType = 'scripture' | 'prayer' | 'revelation' | 'reflection';

/** Wizard steps always run in this order, whatever order they were picked in. */
export const ENRICHMENT_ORDER: readonly EnrichmentType[] = [
  'scripture',
  'prayer',
  'revelation',
  'reflection',
];

export const ENRICHMENT_LABELS: Record<EnrichmentType, string> = {
  scripture: 'Scripture',
  prayer: 'Prayer',
  revelation: 'Revelation',
  reflection: 'Reflection',
};

/** Where the user is in the post-recording wizard. Absent when editing one item. */
export interface EnrichFlow {
  /** Steps still to come after the current one. */
  remaining: EnrichmentType[];
  /** Zero-based index of the current step. */
  step: number;
  total: number;
}

/** Sorts a selection into wizard order and drops duplicates. */
export function orderSelection(selected: readonly EnrichmentType[]): EnrichmentType[] {
  return ENRICHMENT_ORDER.filter((type) => selected.includes(type));
}

export interface NoteStepCopy {
  kind: Extract<MomentNoteKind, 'prayer' | 'revelation' | 'reflection'>;
  title: string;
  subtitle: string;
  placeholder: string;
}

/** Copy for the free-text steps (S8a, S8c, S8e). */
export const NOTE_STEPS: Record<Exclude<EnrichmentType, 'scripture'>, NoteStepCopy> = {
  prayer: {
    kind: 'prayer',
    title: 'Prayer',
    subtitle: 'Write the words you prayed.',
    placeholder: 'Lord, thank you for your presence today…',
  },
  revelation: {
    kind: 'revelation',
    title: 'Revelation',
    subtitle: 'What did God show you?',
    placeholder: 'Rest is not passive. It is an act of trust.',
  },
  reflection: {
    kind: 'reflection',
    title: 'Reflection',
    subtitle: 'What do you want to remember about this Moment?',
    placeholder: 'I came in anxious. By the end I was just glad to be with Him.',
  },
};
