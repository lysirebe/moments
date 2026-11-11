# Research: Audio libraries

## Options

### expo-audio

- **Pros:** Current Expo audio API, works in Expo Go, supports recording and
  playback. Replaces the deprecated `expo-av`.
- **Cons:** Limited background playback and lock-screen controls.
- **Use for:** P1 recording and in-app playback.

### react-native-track-player

- **Pros:** Full background playback, lock-screen controls, media session.
- **Cons:** Requires a dev build (not Expo Go), more complex setup.
- **Use for:** P2 background playback.

## Waveform rendering

- Generate a **peaks file** (array of normalized values) from the audio.
- Render with `react-native-svg` for performance on long audio.
- Store peaks in the `waveform` JSONB column on `moments`.

## Recommendation

Start with `expo-audio` for P1. Migrate to `react-native-track-player` for
background playback in P2. See `../decisions/0002-audio-playback.md`.
