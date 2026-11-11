import { createAudioPlayer, type AudioStatus } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import type { AudioFormat } from '@moments/types';

import { AUDIO_BUCKET } from './storage';
import { supabase } from './supabase';

/** Maps a file extension to the supported audio format. */
const AUDIO_EXTENSIONS: Record<string, AudioFormat> = {
  m4a: 'm4a',
  mp4: 'm4a',
  mp3: 'mp3',
  wav: 'wav',
  aac: 'aac',
  ogg: 'ogg',
};

/**
 * Detects the audio format of a file from its name and/or MIME type.
 * Returns `null` when the format is not supported.
 */
export function detectAudioFormat(
  fileName: string,
  mimeType?: string,
): AudioFormat | null {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext && AUDIO_EXTENSIONS[ext]) {
    return AUDIO_EXTENSIONS[ext];
  }

  if (mimeType) {
    const mime = mimeType.toLowerCase();
    if (mime.includes('mpeg')) return 'mp3';
    if (mime.includes('mp4')) return 'm4a';
    if (mime.includes('wav')) return 'wav';
    if (mime.includes('aac')) return 'aac';
    if (mime.includes('ogg')) return 'ogg';
  }

  return null;
}

/**
 * An audio file selected from the device, ready to be imported.
 */
export interface SelectedAudioFile {
  /** Local file URI (e.g. `file:///.../recording.m4a`). */
  uri: string;
  /** The original file name. */
  fileName: string;
  /** The file's MIME type, if known. */
  mimeType?: string;
  /** Size in bytes, if known. */
  size?: number;
  /** Duration in seconds. */
  duration: number;
  format: AudioFormat;
}

/**
 * Opens the system document picker and returns the selected audio file.
 * Returns `null` when the user cancels. Throws when the file is not a
 * supported audio format or its duration cannot be read.
 */
export async function pickAudioFile(): Promise<SelectedAudioFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['audio/*', 'audio/m4a', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) return null;

  const format = detectAudioFormat(asset.name, asset.mimeType);
  if (!format) {
    throw new Error(
      'This file type is not supported. Please choose an M4A, MP3, WAV, AAC or OGG file.',
    );
  }

  const duration = await getAudioDuration(asset.uri);

  return {
    uri: asset.uri,
    fileName: asset.name,
    mimeType: asset.mimeType,
    size: asset.size,
    duration,
    format,
  };
}

/**
 * Reads the duration (in seconds) of an existing audio file.
 */
export async function getAudioDuration(uri: string): Promise<number> {
  const player = createAudioPlayer(uri);

  // The `SharedObject` type alias in expo-modules-core resolves to the
  // constructor type, so `addListener` is not visible on `AudioPlayer`.
  const playerWithEvents = player as unknown as {
    addListener(
      event: 'playbackStatusUpdate',
      listener: (status: AudioStatus) => void,
    ): { remove: () => void };
    remove(): void;
  };

  return new Promise<number>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout>;
    let subscription: { remove: () => void } | null = null;
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      subscription?.remove();
      playerWithEvents.remove();
    };

    timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Could not read the audio duration.'));
    }, 10000);

    subscription = playerWithEvents.addListener('playbackStatusUpdate', (status) => {
      if (status.isLoaded && status.duration > 0) {
        cleanup();
        resolve(status.duration);
      }
    });
  });
}

/** How long a signed playback URL stays valid, in seconds. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Creates a short-lived signed URL for a private audio object so it can be
 * streamed by the audio player. Storage RLS only signs objects in the caller's
 * own `<user_id>/` folder, so the client never gets a permanent or foreign URL.
 */
export async function getSignedAudioUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to get a signed audio URL');
  }

  return data.signedUrl;
}
