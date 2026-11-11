# Research: Transcription

## Requirements

- Transcribe recorded audio to text.
- Power search across Moments.
- Suggest scripture references from the transcript.

## Options

### OpenAI Whisper API

- **Pros:** High accuracy, simple API, good for audio.
- **Cons:** Cost per minute, requires API key, audio leaves the device.

### Local Whisper (whisper.cpp / faster-whisper)

- **Pros:** Private, no per-minute cost.
- **Cons:** Heavy on-device compute; not ideal for mobile.

### Supabase Edge Function + Whisper

- **Pros:** Keeps the mobile app light; centralizes the API key.
- **Cons:** Audio is uploaded to the edge function.

## Recommendation

Use the **OpenAI Whisper API** via a Supabase Edge Function
(`supabase/functions/transcribe`). Store the transcript on the `moments` row and
enable full-text search for P2.

## Open questions

- What is the cost per minute at expected volume?
- Should transcription be opt-in for privacy?
