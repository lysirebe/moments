import type { AudioFormat } from '@moments/types';

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
    // iOS Voice Memos reports `audio/x-m4a`.
    if (mime.includes('mp4') || mime.includes('m4a')) return 'm4a';
    if (mime.includes('wav')) return 'wav';
    if (mime.includes('aac')) return 'aac';
    if (mime.includes('ogg')) return 'ogg';
  }

  return null;
}
