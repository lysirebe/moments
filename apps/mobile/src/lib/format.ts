/** Display formatters shared across screens. */

import type { AudioFormat } from '@moments/types';

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses an ISO date or timestamp. Date-only values (`YYYY-MM-DD`, as stored in
 * `moments.date`) are read as a local calendar date, not UTC midnight, so they
 * never shift to the previous day in western time zones.
 */
export function parseDate(value: string): Date | null {
  const match = DATE_ONLY.exec(value);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `125.7` → `"02:05"`. Negative or non-finite input reads as zero. */
export function formatDuration(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** `"2026-10-10"` → `"10 October 2026"`. */
export function formatLongDate(value: string): string {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : value;
}

/** `"Today"`, `"Yesterday"`, or a short weekday date such as `"Saturday, 10 Oct"`. */
export function formatRelativeDate(value: string, now: Date = new Date()): string {
  const date = parseDate(value);
  if (!date) return value;

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';

  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

/** `1_572_864` → `"1.5 MB"`, `20_480` → `"20 KB"`. Empty for unknown sizes. */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * Builds a human-readable file name from a title, stripping characters that
 * are illegal in file names and avoiding a doubled extension.
 */
export function toAudioFileName(title: string, format: AudioFormat): string {
  const ext = `.${format}`;
  let base = title.trim();
  if (base.toLowerCase().endsWith(ext)) {
    base = base.slice(0, -ext.length);
  }
  base = base
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return `${base || 'audio'}${ext}`;
}
