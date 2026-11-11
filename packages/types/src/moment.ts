/**
 * The core domain model for the moments platform.
 *
 * A Moment is the audio plus everything around it: the sound, the context,
 * the scripture that inspired it, the prayers prayed, the revelations received,
 * and the highlights worth returning to.
 */

import type { AudioAsset } from './audio';

/** The type of gathering or setting a Moment was captured in. */
export type MomentType =
  'quiet_time' | 'prayer' | 'living_room' | 'conference' | 'spontaneous' | 'worship' | 'other';

/** A person who was present during a Moment. */
export interface MomentPerson {
  id: string;
  name: string;
  role?: string;
}

/** A scripture reference attached to a Moment. */
export interface MomentScripture {
  id: string;
  /** e.g. "John 3:16" */
  reference: string;
  /** The api.bible passage key, e.g. "JHN.3.1-JHN.3.16". */
  passageKey?: string;
  /** The api.bible bibleId for the translation, e.g. "de4e12af7f28f599". */
  bibleId?: string;
  /** The translation code, e.g. "NIV", "ESV", "KJV". */
  translation: string;
  /** The verse text, if captured. */
  text?: string;
  /** Optional note about why this verse was referenced. */
  note?: string;
}

/** The kind of note attached to a Moment. */
export type MomentNoteKind =
  /** A timestamped note typed while recording. */
  'note' | 'prayer' | 'revelation' | 'reflection';

/** A note attached to a Moment. */
export interface MomentNote {
  id: string;
  /** The owning Moment. */
  momentId: string;
  kind: MomentNoteKind;
  /** Whether the note was captured during the recording. */
  isDuringRecording: boolean;
  /** Position in the audio, in seconds. Only set when isDuringRecording. */
  timestamp?: number;
  /** Whether the note was added/edited after the fact, some time later. */
  isUpdated: boolean;
  content: string;
  /** ISO timestamp of when the note was created. */
  createdAt: string;
}

/** The core object of the platform. */
export interface Moment {
  id: string;
  /** The owner of the Moment. */
  userId: string;
  title: string;
  /** ISO date of when the Moment happened. */
  date: string;
  place?: string;
  people: MomentPerson[];
  type: MomentType;
  /** Storage path to the artwork image. */
  artworkPath?: string;
  /**
   * The recording for this Moment, or `null` if none has been attached yet.
   * Scriptures and notes are loaded separately (see `listNotes`).
   */
  audio: AudioAsset | null;
  createdAt: string;
  updatedAt: string;
}
