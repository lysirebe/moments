import { describe, expect, it } from 'vitest';

import { detectAudioFormat } from './audioFormat';

describe('detectAudioFormat', () => {
  it.each([
    ['memo.m4a', 'm4a'],
    ['memo.MP4', 'm4a'],
    ['song.mp3', 'mp3'],
    ['take.wav', 'wav'],
    ['clip.aac', 'aac'],
    ['clip.ogg', 'ogg'],
  ])('detects %s from its extension', (fileName, expected) => {
    expect(detectAudioFormat(fileName)).toBe(expected);
  });

  it.each([
    ['audio/mpeg', 'mp3'],
    ['audio/mp4', 'm4a'],
    ['audio/x-m4a', 'm4a'],
    ['audio/wav', 'wav'],
  ])('falls back to the MIME type %s', (mimeType, expected) => {
    expect(detectAudioFormat('recording', mimeType)).toBe(expected);
  });

  it('returns null for unsupported files', () => {
    expect(detectAudioFormat('notes.txt', 'text/plain')).toBeNull();
    expect(detectAudioFormat('recording')).toBeNull();
  });
});
