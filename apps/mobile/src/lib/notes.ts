import type { MomentNote, MomentNoteKind } from '@moments/types';

import { toNote } from './mappers';
import { requireUserId, supabase } from './supabase';

export interface CreateNoteInput {
  momentId: string;
  kind: MomentNoteKind;
  content: string;
  /** Set when the note was written while recording. */
  isDuringRecording?: boolean;
  /** Position in the audio, in seconds. */
  timestamp?: number;
  /** Set when the note was added some time after the Moment. */
  isUpdated?: boolean;
}

function toInsert(userId: string, input: CreateNoteInput) {
  return {
    moment_id: input.momentId,
    user_id: userId,
    kind: input.kind,
    content: input.content,
    is_during_recording: input.isDuringRecording ?? false,
    timestamp: input.timestamp ?? null,
    is_updated: input.isUpdated ?? false,
  };
}

export async function createNote(input: CreateNoteInput): Promise<MomentNote> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('moment_notes')
    .insert(toInsert(userId, input))
    .select()
    .single();

  if (error) throw error;
  return toNote(data);
}

/** Inserts several notes in one round-trip (e.g. notes taken while recording). */
export async function createNotes(inputs: CreateNoteInput[]): Promise<MomentNote[]> {
  if (inputs.length === 0) return [];
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('moment_notes')
    .insert(inputs.map((input) => toInsert(userId, input)))
    .select();

  if (error) throw error;
  return data.map(toNote);
}

export async function listNotes(momentId: string): Promise<MomentNote[]> {
  const { data, error } = await supabase
    .from('moment_notes')
    .select('*')
    .eq('moment_id', momentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(toNote);
}
