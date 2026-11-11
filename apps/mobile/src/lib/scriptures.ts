import type { MomentScripture } from '@moments/types';

import { toScripture } from './mappers';
import { supabase } from './supabase';

export interface CreateScriptureInput {
  momentId: string;
  reference: string;
  passageKey: string;
  bibleId: string;
  translation: string;
  text?: string;
  note?: string;
}

export async function createScripture(input: CreateScriptureInput): Promise<MomentScripture> {
  const { data, error } = await supabase
    .from('moment_scriptures')
    .insert({
      moment_id: input.momentId,
      reference: input.reference,
      passage_key: input.passageKey,
      bible_id: input.bibleId,
      translation: input.translation,
      text: input.text ?? null,
      note: input.note ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return toScripture(data);
}

export async function listScriptures(momentId: string): Promise<MomentScripture[]> {
  const { data, error } = await supabase
    .from('moment_scriptures')
    .select('*')
    .eq('moment_id', momentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(toScripture);
}
