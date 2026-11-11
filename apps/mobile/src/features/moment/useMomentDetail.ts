import { useEffect, useState } from 'react';
import type { Moment, MomentNote, MomentScripture } from '@moments/types';

import { errorMessage } from '../../lib/errors';
import { getMoment } from '../../lib/moments';
import { listNotes } from '../../lib/notes';
import { listScriptures } from '../../lib/scriptures';

export interface MomentDetail {
  moment: Moment | null;
  notes: MomentNote[];
  scriptures: MomentScripture[];
  loading: boolean;
  error: string | null;
}

/**
 * Loads a Moment with its notes and scriptures. Pass a new `reloadKey` to
 * refetch, e.g. after an enrichment has been saved on another screen.
 */
export function useMomentDetail(momentId: string, reloadKey?: number): MomentDetail {
  const [moment, setMoment] = useState<Moment | null>(null);
  const [notes, setNotes] = useState<MomentNote[]>([]);
  const [scriptures, setScriptures] = useState<MomentScripture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([getMoment(momentId), listNotes(momentId), listScriptures(momentId)])
      .then(([m, n, s]) => {
        if (!active) return;
        setMoment(m);
        setNotes(n);
        setScriptures(s);
        setError(m ? null : 'This Moment could not be found.');
      })
      .catch((err: unknown) => {
        if (active) setError(errorMessage(err, 'Could not load this Moment.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [momentId, reloadKey]);

  return { moment, notes, scriptures, loading, error };
}
