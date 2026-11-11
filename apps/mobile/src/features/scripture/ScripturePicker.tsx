import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, colors, spacing } from '@moments/ui';
import {
  BIBLE_BOOKS,
  BIBLE_TRANSLATIONS,
  buildPassageKey,
  buildReference,
  getBook,
} from '@moments/types';

import { Select, type SelectOption } from './Select';
import {
  fetchChapters,
  fetchPassage,
  fetchVerses,
  type BibleChapter,
  type BibleVerse,
} from './bible';

export interface ScriptureSelection {
  passageKey: string;
  reference: string;
  bibleId: string;
  translation: string;
  text?: string;
}

interface ScripturePickerProps {
  onSelect: (selection: ScriptureSelection) => void;
  /** Omit to hide the Cancel button (e.g. when the host screen has Back). */
  onCancel?: () => void;
  saving?: boolean;
  /** Hide the built-in heading when the host screen provides its own. */
  showHeader?: boolean;
}

export function ScripturePicker({
  onSelect,
  onCancel,
  saving,
  showHeader = true,
}: ScripturePickerProps) {
  const [bibleId, setBibleId] = useState<string>(BIBLE_TRANSLATIONS[0]?.id ?? '');
  const [bookId, setBookId] = useState<string>();
  const [chapterId, setChapterId] = useState<string>();
  const [startVerseId, setStartVerseId] = useState<string>();
  const [endVerseId, setEndVerseId] = useState<string>();

  const [chapters, setChapters] = useState<BibleChapter[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const translation = BIBLE_TRANSLATIONS.find((t) => t.id === bibleId);
  const book = getBook(bookId ?? '');

  // Reset dependent selections when an upstream value changes.
  useEffect(() => {
    setBookId(undefined);
    setChapterId(undefined);
    setStartVerseId(undefined);
    setEndVerseId(undefined);
    setChapters([]);
    setVerses([]);
  }, [bibleId]);

  useEffect(() => {
    setChapterId(undefined);
    setStartVerseId(undefined);
    setEndVerseId(undefined);
    setVerses([]);
  }, [bookId]);

  useEffect(() => {
    setStartVerseId(undefined);
    setEndVerseId(undefined);
  }, [chapterId]);

  // Fetch chapters when a book is selected.
  useEffect(() => {
    if (!bibleId || !bookId) return;
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    fetchChapters(bibleId, bookId)
      .then((data) => {
        if (!cancelled) setChapters(data);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bibleId, bookId]);

  // Fetch verses when a chapter is selected.
  useEffect(() => {
    if (!bibleId || !chapterId) return;
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    fetchVerses(bibleId, chapterId)
      .then((data) => {
        if (!cancelled) setVerses(data);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bibleId, chapterId]);

  const bookOptions: SelectOption[] = useMemo(
    () => BIBLE_BOOKS.map((b) => ({ label: b.name, value: b.id })),
    [],
  );

  const translationOptions: SelectOption[] = useMemo(
    () =>
      BIBLE_TRANSLATIONS.map((t) => ({
        label: `${t.name} (${t.abbreviation})`,
        value: t.id,
      })),
    [],
  );

  const chapterOptions: SelectOption[] = useMemo(
    () =>
      chapters.map((c) => ({
        label: `${book?.name ?? ''} ${c.number}`,
        value: c.id,
      })),
    [chapters, book],
  );

  const verseOptions: SelectOption[] = useMemo(
    () =>
      verses.map((v) => ({
        label: `${book?.name ?? ''} ${chapterNumber(chapterId, chapters)}:${v.number}`,
        value: v.id,
      })),
    [verses, book, chapterId, chapters],
  );

  // End-verse options are limited to the same chapter and >= the start verse.
  const endVerseOptions: SelectOption[] = useMemo(() => {
    const startIndex = verses.findIndex((v) => v.id === startVerseId);
    if (startIndex < 0) return verseOptions;
    return verseOptions.slice(startIndex);
  }, [verseOptions, verses, startVerseId]);

  const startVerse = verses.find((v) => v.id === startVerseId);
  const endVerse = verses.find((v) => v.id === endVerseId);

  const canSubmit = Boolean(bibleId && bookId && chapterId && startVerseId && endVerseId);

  async function handleSubmit() {
    if (!bibleId || !bookId || !chapterId || !startVerse || !endVerse) return;
    setLoading(true);
    setError(undefined);
    try {
      const chapter = Number(chapterNumber(chapterId, chapters));
      const start = Number(startVerse.number);
      const end = Number(endVerse.number);
      const passageKey = buildPassageKey(bookId, chapter, start, end);
      const reference = buildReference(book?.name ?? '', chapter, start, end);
      const passage = await fetchPassage(bibleId, passageKey);
      onSelect({
        passageKey,
        reference,
        bibleId,
        translation: translation?.abbreviation ?? '',
        text: passage.content,
      });
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {showHeader ? (
        <>
          <Text variant="heading">Add Scripture</Text>
          <Text variant="body" color={colors.textSecondary}>
            Choose a passage to attach to this Moment.
          </Text>
        </>
      ) : null}

      <Select
        label="Translation"
        placeholder="Select a translation"
        value={bibleId}
        options={translationOptions}
        onSelect={setBibleId}
      />

      <Select
        label="Book"
        placeholder="Select a book"
        value={bookId}
        options={bookOptions}
        onSelect={setBookId}
      />

      <Select
        label="Chapter"
        placeholder="Select a chapter"
        value={chapterId}
        options={chapterOptions}
        onSelect={setChapterId}
        disabled={!bookId}
      />

      <Select
        label="Start verse"
        placeholder="Select a start verse"
        value={startVerseId}
        options={verseOptions}
        onSelect={setStartVerseId}
        disabled={!chapterId}
      />

      <Select
        label="End verse"
        placeholder="Select an end verse"
        value={endVerseId}
        options={endVerseOptions}
        onSelect={setEndVerseId}
        disabled={!startVerseId}
      />

      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={saving ? 'Saving…' : 'Add passage'}
          onPress={handleSubmit}
          disabled={!canSubmit || loading || saving}
        />
        {onCancel ? <Button label="Cancel" variant="ghost" onPress={onCancel} /> : null}
      </View>
    </View>
  );
}

function chapterNumber(chapterId: string | undefined, chapters: BibleChapter[]): string {
  return chapters.find((c) => c.id === chapterId)?.number ?? '';
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
