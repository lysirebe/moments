import type { Moment } from '@moments/types';

import { toMoment } from './mappers';
import { supabase } from './supabase';

const MOMENT_WITH_AUDIO = '*, moments_audio(*)';

/** Lists a user's Moments, newest first, with their audio metadata. */
export async function listMoments(userId: string): Promise<Moment[]> {
  const { data, error } = await supabase
    .from('moments')
    .select(MOMENT_WITH_AUDIO)
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(toMoment);
}

/** Fetches a single Moment with its audio, or `null` if it doesn't exist. */
export async function getMoment(id: string): Promise<Moment | null> {
  const { data, error } = await supabase
    .from('moments')
    .select(MOMENT_WITH_AUDIO)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? toMoment(data) : null;
}
