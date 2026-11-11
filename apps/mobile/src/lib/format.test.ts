import { describe, expect, it } from 'vitest';

import {
  formatDuration,
  formatFileSize,
  formatLongDate,
  formatRelativeDate,
  parseDate,
  toAudioFileName,
} from './format';

describe('parseDate', () => {
  it('reads date-only values as a local calendar date', () => {
    const date = parseDate('2026-10-10');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(9);
    expect(date?.getDate()).toBe(10);
    expect(date?.getHours()).toBe(0);
  });

  it('parses full ISO timestamps', () => {
    expect(parseDate('2026-10-10T12:30:00Z')?.toISOString()).toBe('2026-10-10T12:30:00.000Z');
  });

  it('returns null for invalid input', () => {
    expect(parseDate('not a date')).toBeNull();
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '00:00'],
    [5.9, '00:05'],
    [65, '01:05'],
    [3600, '60:00'],
  ])('formats %s seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it('treats negative and non-finite values as zero', () => {
    expect(formatDuration(-3)).toBe('00:00');
    expect(formatDuration(Number.NaN)).toBe('00:00');
  });
});

describe('formatLongDate', () => {
  it('formats dates in British long form', () => {
    expect(formatLongDate('2026-10-10')).toBe('10 October 2026');
  });

  it('returns the input unchanged when it cannot be parsed', () => {
    expect(formatLongDate('someday')).toBe('someday');
  });
});

describe('formatRelativeDate', () => {
  const now = new Date(2026, 9, 10, 15, 0);

  it('labels today and yesterday', () => {
    expect(formatRelativeDate('2026-10-10', now)).toBe('Today');
    expect(formatRelativeDate('2026-10-09', now)).toBe('Yesterday');
  });

  it('uses a short weekday date for older Moments', () => {
    expect(formatRelativeDate('2026-10-03', now)).toBe('Saturday 3 Oct');
  });
});

describe('formatFileSize', () => {
  it('uses MB from one megabyte up, KB below', () => {
    expect(formatFileSize(1_572_864)).toBe('1.5 MB');
    expect(formatFileSize(20_480)).toBe('20 KB');
  });

  it('is empty for unknown sizes', () => {
    expect(formatFileSize(undefined)).toBe('');
    expect(formatFileSize(0)).toBe('');
  });
});

describe('toAudioFileName', () => {
  it('appends the format extension', () => {
    expect(toAudioFileName('Sunday worship', 'm4a')).toBe('Sunday worship.m4a');
  });

  it('does not double an existing matching extension', () => {
    expect(toAudioFileName('Sunday worship.M4A', 'm4a')).toBe('Sunday worship.m4a');
  });

  it('replaces characters that are illegal in file names', () => {
    expect(toAudioFileName('Psalm 23: a/b?', 'mp3')).toBe('Psalm 23- a-b-.mp3');
  });

  it('falls back to "audio" for an empty title', () => {
    expect(toAudioFileName('   ', 'wav')).toBe('audio.wav');
  });
});
