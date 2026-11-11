/**
 * Maps snake_case database rows to the camelCase domain types in
 * `@moments/types`. Every read in the data layer goes through one of these, so
 * the rest of the app never sees a raw row.
 */
import type {
  AudioAsset,
  Moment,
  MomentNote,
  MomentPerson,
  MomentScripture,
  Profile,
  TableRow,
  WaveformPeaks,
} from '@moments/types';

type MomentRow = TableRow<'moments'>;
type AudioRow = TableRow<'moments_audio'>;

/** Turns SQL `null` into `undefined` for optional domain fields. */
function opt<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

export function toAudioAsset(row: AudioRow): AudioAsset {
  return {
    path: row.storage_path,
    fileName: row.file_name ?? row.storage_path.split('/').pop() ?? 'audio',
    format: row.format,
    duration: Number(row.duration),
    size: Number(row.size),
    waveform: opt(row.waveform as WaveformPeaks | null),
    transcribed: row.transcribed,
    transcript: opt(row.transcript),
  };
}

/**
 * Maps a `moments` row, optionally joined with its `moments_audio` relation
 * (`select('*, moments_audio(*)')`). The relation is one-to-one but PostgREST
 * may return it as an object, an array or `null` depending on the query.
 */
export function toMoment(
  row: MomentRow & { moments_audio?: AudioRow | AudioRow[] | null },
): Moment {
  const audioRow = Array.isArray(row.moments_audio)
    ? row.moments_audio[0]
    : row.moments_audio;

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    date: row.date,
    place: opt(row.place),
    people: Array.isArray(row.people) ? (row.people as unknown as MomentPerson[]) : [],
    type: row.type,
    artworkPath: opt(row.artwork_path),
    audio: audioRow ? toAudioAsset(audioRow) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toNote(row: TableRow<'moment_notes'>): MomentNote {
  return {
    id: row.id,
    momentId: row.moment_id,
    kind: row.kind,
    isDuringRecording: row.is_during_recording,
    timestamp: row.timestamp === null ? undefined : Number(row.timestamp),
    isUpdated: row.is_updated,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function toScripture(row: TableRow<'moment_scriptures'>): MomentScripture {
  return {
    id: row.id,
    reference: row.reference,
    passageKey: opt(row.passage_key),
    bibleId: opt(row.bible_id),
    translation: row.translation,
    text: opt(row.text),
    note: opt(row.note),
  };
}

export function toProfile(row: TableRow<'profiles'>): Profile {
  return {
    id: row.id,
    username: opt(row.username),
    displayName: opt(row.display_name),
    avatarUrl: opt(row.avatar_url),
  };
}
