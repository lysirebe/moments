import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecorderState,
} from 'expo-audio';

import { createNotes } from '../../lib/notes';
import { uploadAudio } from '../../lib/upload';

/** A note typed while recording, pinned to a position in the audio. */
export interface DraftNote {
  id: string;
  /** Position in the recording, in seconds. */
  timestamp: number;
  content: string;
}

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

interface RecordingSessionValue {
  status: RecordingStatus;
  /** Live recorder state: elapsed time, metering, etc. */
  recorderState: RecorderState;
  /** Elapsed recording time in seconds (frozen once stopped). */
  elapsed: number;
  notes: DraftNote[];
  /** Changes each time a note is added, so screens can show a confirmation. */
  lastNoteAddedAt: number | null;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  addNote: (content: string, timestamp: number) => void;
  /** Uploads the recording and its notes as a new Moment. Returns its ID. */
  save: (title: string) => Promise<string>;
  /** Discards the current recording and notes. */
  reset: () => Promise<void>;
}

const RecordingSessionContext = createContext<RecordingSessionValue | undefined>(
  undefined,
);

/** How often the recorder reports elapsed time, in milliseconds. */
const STATUS_INTERVAL_MS = 100;

/**
 * Owns the single audio recorder for the app. It sits above the navigator so a
 * recording keeps running while the Add Note sheet is open, and so the Review
 * and Saving screens can read the finished file and notes.
 */
export function RecordingSessionProvider({ children }: { children: React.ReactNode }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, STATUS_INTERVAL_MS);

  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [notes, setNotes] = useState<DraftNote[]>([]);
  const [lastNoteAddedAt, setLastNoteAddedAt] = useState<number | null>(null);
  const [stoppedDuration, setStoppedDuration] = useState(0);
  const nextNoteId = useRef(0);
  // Set once the audio is uploaded, so a retry after a failed notes insert
  // doesn't create a second Moment.
  const uploadedMomentId = useRef<string | null>(null);

  const start = useCallback(async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Moments needs microphone access to record. You can turn it on in Settings.');
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setNotes([]);
    setStoppedDuration(0);
    setStatus('recording');
  }, [recorder]);

  const pause = useCallback(() => {
    recorder.pause();
    setStatus('paused');
  }, [recorder]);

  const resume = useCallback(() => {
    recorder.record();
    setStatus('recording');
  }, [recorder]);

  const stop = useCallback(async () => {
    const duration = recorder.currentTime;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    setStoppedDuration(duration);
    setStatus('stopped');
  }, [recorder]);

  const addNote = useCallback((content: string, timestamp: number) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    nextNoteId.current += 1;
    const note: DraftNote = { id: String(nextNoteId.current), timestamp, content: trimmed };
    setNotes((prev) => [...prev, note].sort((a, b) => a.timestamp - b.timestamp));
    setLastNoteAddedAt(Date.now());
  }, []);

  const reset = useCallback(async () => {
    if (recorder.isRecording) await recorder.stop();
    uploadedMomentId.current = null;
    setNotes([]);
    setStoppedDuration(0);
    setLastNoteAddedAt(null);
    setStatus('idle');
  }, [recorder]);

  const save = useCallback(
    async (title: string) => {
      const uri = recorder.uri;
      if (status !== 'stopped' || !uri) {
        throw new Error('There is no finished recording to save.');
      }

      if (!uploadedMomentId.current) {
        const { momentId } = await uploadAudio({
          uri,
          duration: stoppedDuration,
          format: 'm4a',
          title,
        });
        uploadedMomentId.current = momentId;
      }
      const momentId = uploadedMomentId.current;

      await createNotes(
        notes.map((note) => ({
          momentId,
          kind: 'note' as const,
          content: note.content,
          timestamp: note.timestamp,
          isDuringRecording: true,
        })),
      );

      uploadedMomentId.current = null;
      setNotes([]);
      setStatus('idle');
      return momentId;
    },
    [recorder, status, stoppedDuration, notes],
  );

  const elapsed =
    status === 'stopped' ? stoppedDuration : recorderState.durationMillis / 1000;

  const value = useMemo<RecordingSessionValue>(
    () => ({
      status,
      recorderState,
      elapsed,
      notes,
      lastNoteAddedAt,
      start,
      pause,
      resume,
      stop,
      addNote,
      save,
      reset,
    }),
    [status, recorderState, elapsed, notes, lastNoteAddedAt, start, pause, resume, stop, addNote, save, reset],
  );

  return (
    <RecordingSessionContext.Provider value={value}>{children}</RecordingSessionContext.Provider>
  );
}

export function useRecordingSession(): RecordingSessionValue {
  const ctx = useContext(RecordingSessionContext);
  if (!ctx) {
    throw new Error('useRecordingSession must be used within a RecordingSessionProvider');
  }
  return ctx;
}
