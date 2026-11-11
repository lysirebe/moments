/**
 * Client for the `bible` edge function, which proxies api.bible.
 *
 * The api.bible API key lives server-side; the mobile app only ever talks to
 * our own edge function.
 */

import { supabase } from '../../lib/supabase';

const EDGE_FUNCTION = 'bible';

async function invoke<T>(body: Record<string, string>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(EDGE_FUNCTION, {
    body,
  });

  if (error) {
    throw new Error(error.message || 'Failed to reach the bible service');
  }

  return data as T;
}

export interface BibleBook {
  id: string;
  name: string;
}

export interface BibleChapter {
  id: string;
  number: string;
  reference: string;
}

export interface BibleVerse {
  id: string;
  /** api.bible doesn't return this; derived from the verse id. */
  number?: string;
  reference: string;
}

export interface BiblePassage {
  id: string;
  reference: string;
  content: string;
  verseCount: number;
}

export async function fetchBooks(bibleId: string): Promise<BibleBook[]> {
  const result = await invoke<{ data: BibleBook[] }>({ action: 'books', bibleId });
  return result.data;
}

export async function fetchChapters(bibleId: string, bookId: string): Promise<BibleChapter[]> {
  const result = await invoke<{ data: BibleChapter[] }>({
    action: 'chapters',
    bibleId,
    bookId,
  });
  return result.data;
}

export async function fetchVerses(bibleId: string, chapterId: string): Promise<BibleVerse[]> {
  const result = await invoke<{ data: BibleVerse[] }>({
    action: 'verses',
    bibleId,
    chapterId,
  });
  // api.bible's verses endpoint doesn't return a `number` field, so derive it
  // from the verse id (e.g. "JHN.3.1" -> "1").
  return result.data.map((verse) => ({
    ...verse,
    number: verse.number ?? verse.id.split('.').pop() ?? '',
  }));
}

export async function fetchPassage(bibleId: string, passageId: string): Promise<BiblePassage> {
  const result = await invoke<{ data: BiblePassage }>({
    action: 'passage',
    bibleId,
    passageId,
  });
  return result.data;
}
