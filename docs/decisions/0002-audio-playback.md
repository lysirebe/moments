# ADR-0002: Audio playback and recording

## Status

Proposed

## Context

The core of moments is audio. We need to record audio in the app, play it back,
and support background playback with lock-screen controls. We also want to
render a waveform from a peaks file.

## Decision

Use **`expo-audio`** for recording and basic playback in P1, and plan to migrate
to **`react-native-track-player`** for background playback and lock-screen
controls in P2.

- Recording: `expo-audio` `useAudioRecorder` / `AudioRecorder`.
- Playback: `expo-audio` `AudioPlayer` for in-app playback.
- Background playback + lock-screen: `react-native-track-player` (P2).
- Waveform: render from a peaks file (see `@moments/types` `WaveformPeaks`).

## Consequences

- `expo-audio` is the current Expo audio API (replaces the deprecated `expo-av`).
- Background playback requires a dev build and `react-native-track-player`.
- Waveform rendering needs a performant renderer (e.g. `react-native-svg`) for
  long audio.
