import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { Moment } from '@moments/types';

import { errorMessage } from '../../lib/errors';
import { listMoments } from '../../lib/moments';
import { useAuth } from '../auth/AuthProvider';

export interface MomentsState {
  moments: Moment[];
  loading: boolean;
  error: string | null;
}

/**
 * The signed-in user's Moments, newest first. Refetches whenever the screen
 * regains focus, so a Moment saved elsewhere shows up on return.
 */
export function useMoments(): MomentsState {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setMoments([]);
        setLoading(false);
        return;
      }

      let active = true;
      listMoments(userId)
        .then((data) => {
          if (!active) return;
          setMoments(data);
          setError(null);
        })
        .catch((err: unknown) => {
          if (active) setError(errorMessage(err, 'Could not load your Moments.'));
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [userId]),
  );

  return { moments, loading, error };
}
