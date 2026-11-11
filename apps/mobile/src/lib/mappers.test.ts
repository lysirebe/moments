import { describe, expect, it } from 'vitest';
import type { TableRow } from '@moments/types';

import { toMoment, toNote, toProfile, toScripture } from './mappers';

const momentRow: TableRow<'moments'> = {
  id: 'm1',
  user_id: 'u1',
  title: 'Kitchen worship',
  date: '2026-10-10',
  place: null,
  people: [{ id: 'p1', name: 'Ama' }],
  type: 'living_room',
  artwork_path: null,
  created_at: '2026-10-10T20:00:00Z',
  updated_at: '2026-10-10T20:00:00Z',
};

const audioRow: TableRow<'moments_audio'> = {
  id: 'a1',
  moment_id: 'm1',
  user_id: 'u1',
  storage_path: 'u1/m1.m4a',
  file_name: null,
  format: 'm4a',
  duration: 125.5,
  size: 2048,
  waveform: null,
  transcribed: false,
  transcript: null,
  created_at: '2026-10-10T20:00:00Z',
};

describe('toMoment', () => {
  it('maps snake_case columns to the camelCase domain type', () => {
    const moment = toMoment({ ...momentRow, moments_audio: audioRow });
    expect(moment).toMatchObject({
      id: 'm1',
      userId: 'u1',
      title: 'Kitchen worship',
      type: 'living_room',
      createdAt: '2026-10-10T20:00:00Z',
      people: [{ id: 'p1', name: 'Ama' }],
    });
  });

  it('turns SQL nulls into undefined optional fields', () => {
    const moment = toMoment(momentRow);
    expect(moment.place).toBeUndefined();
    expect(moment.artworkPath).toBeUndefined();
  });

  it('accepts the audio relation as an object or an array', () => {
    const fromObject = toMoment({ ...momentRow, moments_audio: audioRow });
    const fromArray = toMoment({ ...momentRow, moments_audio: [audioRow] });
    expect(fromObject.audio).toEqual(fromArray.audio);
    expect(fromObject.audio).toMatchObject({
      path: 'u1/m1.m4a',
      fileName: 'm1.m4a',
      duration: 125.5,
      transcribed: false,
    });
  });

  it('sets audio to null when the Moment has no recording', () => {
    expect(toMoment({ ...momentRow, moments_audio: null }).audio).toBeNull();
    expect(toMoment({ ...momentRow, moments_audio: [] }).audio).toBeNull();
  });

  it('defaults people to an empty list when the column is malformed', () => {
    expect(toMoment({ ...momentRow, people: {} }).people).toEqual([]);
  });
});

describe('toNote', () => {
  it('maps a recording note with its timestamp', () => {
    const note = toNote({
      id: 'n1',
      moment_id: 'm1',
      user_id: 'u1',
      kind: 'note',
      is_during_recording: true,
      timestamp: 42,
      is_updated: false,
      content: 'Peace over the exam',
      created_at: '2026-10-10T20:00:00Z',
    });
    expect(note).toEqual({
      id: 'n1',
      momentId: 'm1',
      kind: 'note',
      isDuringRecording: true,
      timestamp: 42,
      isUpdated: false,
      content: 'Peace over the exam',
      createdAt: '2026-10-10T20:00:00Z',
    });
  });

  it('leaves timestamp undefined for notes added later', () => {
    const note = toNote({
      id: 'n2',
      moment_id: 'm1',
      user_id: 'u1',
      kind: 'prayer',
      is_during_recording: false,
      timestamp: null,
      is_updated: true,
      content: 'Lord, thank you',
      created_at: '2026-10-11T08:00:00Z',
    });
    expect(note.timestamp).toBeUndefined();
  });
});

describe('toScripture', () => {
  it('maps passage metadata', () => {
    const scripture = toScripture({
      id: 's1',
      moment_id: 'm1',
      reference: 'Psalm 42:1',
      translation: 'NIV',
      text: null,
      note: null,
      passage_key: 'PSA.42.1',
      bible_id: 'abc123',
      created_at: '2026-10-10T20:00:00Z',
    });
    expect(scripture).toEqual({
      id: 's1',
      reference: 'Psalm 42:1',
      passageKey: 'PSA.42.1',
      bibleId: 'abc123',
      translation: 'NIV',
      text: undefined,
      note: undefined,
    });
  });
});

describe('toProfile', () => {
  it('maps the display name', () => {
    const profile = toProfile({
      id: 'u1',
      username: null,
      display_name: 'Lys',
      avatar_url: null,
      created_at: '2026-10-10T20:00:00Z',
      updated_at: '2026-10-10T20:00:00Z',
    });
    expect(profile).toEqual({
      id: 'u1',
      username: undefined,
      displayName: 'Lys',
      avatarUrl: undefined,
    });
  });
});
