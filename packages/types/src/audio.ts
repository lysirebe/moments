/** Audio-related types for the moments platform. */

/** The format of the stored audio file. */
export type AudioFormat = 'm4a' | 'mp3' | 'wav' | 'aac' | 'ogg';

/** A waveform peaks file used to render the audio waveform. */
export interface WaveformPeaks {
  /** Number of peaks. */
  length: number;
  /** Peak values, normalized to 0..1. */
  peaks: number[];
  /** The number of samples per peak. */
  samplesPerPeak: number;
  /** The audio duration in seconds. */
  duration: number;
}

/** An audio asset stored in Supabase Storage. */
export interface AudioAsset {
  /** Storage path within the private audio bucket. */
  path: string;
  /** The original file name. */
  fileName: string;
  format: AudioFormat;
  /** Duration in seconds. */
  duration: number;
  /** Size in bytes. */
  size: number;
  /** Optional waveform peaks for rendering. */
  waveform?: WaveformPeaks;
  /** Whether the audio has been transcribed. */
  transcribed: boolean;
  /** The transcription text, if available. */
  transcript?: string;
}
