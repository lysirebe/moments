import { File } from 'expo-file-system';
import type { AudioFormat } from '@moments/types';

import { toAudioFileName } from './format';
import { AUDIO_BUCKET } from './storage';
import { requireUserId, supabase } from './supabase';

/** Maps an AudioFormat to a MIME type accepted by the audio bucket. */
const CONTENT_TYPES: Record<AudioFormat, string> = {
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
};

export interface UploadAudioInput {
  /** Local file URI (e.g. `file:///.../recording.m4a`). */
  uri: string;
  /** Duration in seconds. */
  duration: number;
  format: AudioFormat;
  /** Title for the new Moment. Defaults to "Untitled Moment". */
  title?: string;
  /** Original file name, kept for display. Defaults to one built from the title. */
  fileName?: string;
}

export interface UploadAudioResult {
  /** ID of the Moment created for this audio. */
  momentId: string;
  /** Storage path within the private audio bucket (`<user_id>/<moment_id>.<ext>`). */
  path: string;
  /** Size in bytes. */
  size: number;
}

/**
 * Creates a Moment from a local audio file.
 *
 * 1. Inserts the `moments` row, so the object can be keyed by its ID.
 * 2. Uploads the file to `<user_id>/<moment_id>.<ext>` in the private bucket.
 *    Keying by ID (not title) means two Moments can share a title.
 * 3. Inserts the `moments_audio` metadata row.
 *
 * If any step fails, the earlier steps are rolled back. Deleting the Moment
 * cascades to its audio row.
 */
export async function uploadAudio(input: UploadAudioInput): Promise<UploadAudioResult> {
  const userId = await requireUserId();
  const title = input.title?.trim() || 'Untitled Moment';

  const file = new File(input.uri);
  if (!file.exists) {
    throw new Error('The recording file could not be found. Please try again.');
  }
  const bytes = await file.bytes();

  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .insert({ user_id: userId, title })
    .select('id')
    .single();
  if (momentError) throw momentError;

  const path = `${userId}/${moment.id}.${input.format}`;
  let uploaded = false;

  try {
    const { error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(path, bytes, { contentType: CONTENT_TYPES[input.format], upsert: false });
    if (uploadError) throw uploadError;
    uploaded = true;

    const { error: audioError } = await supabase.from('moments_audio').insert({
      moment_id: moment.id,
      user_id: userId,
      storage_path: path,
      file_name: input.fileName ?? toAudioFileName(title, input.format),
      format: input.format,
      duration: input.duration,
      size: bytes.byteLength,
    });
    if (audioError) throw audioError;

    return { momentId: moment.id, path, size: bytes.byteLength };
  } catch (error) {
    await rollback(moment.id, uploaded ? path : null);
    throw error;
  }
}

/** Best-effort cleanup after a failed upload. Failures are reported, not thrown. */
async function rollback(momentId: string, path: string | null): Promise<void> {
  const results = await Promise.allSettled([
    supabase.from('moments').delete().eq('id', momentId),
    path ? supabase.storage.from(AUDIO_BUCKET).remove([path]) : Promise.resolve(null),
  ]);
  for (const result of results) {
    if (result.status === 'rejected' || result.value?.error) {
      console.warn('uploadAudio rollback was incomplete', result);
    }
  }
}
