import type { Profile } from '@moments/types';

import { toProfile } from './mappers';
import { supabase } from './supabase';

/** Fetches a user's profile, or `null` if no profile row exists yet. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? toProfile(data) : null;
}
