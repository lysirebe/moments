# Product Brief — moments

## Problem

Worship encounters are fleeting. The sound is often captured, but the story
around it — the scripture that inspired it, the prayers prayed, the revelation
received — is lost. People want to preserve the _whole_ encounter, not just the
audio.

## Vision

Moments is an audio-first worship platform that captures and preserves the full
story of an encounter with God, from quiet time and prayer to living rooms,
conferences and spontaneous gatherings.

## The core object: a Moment

A **Moment** is the audio plus everything around it.

| Field           | Description                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| **Sound**       | Recorded in the app or uploaded. Stored privately, streamed via signed URLs. |
| **Context**     | Title, date, place, people, artwork and type.                                |
| **Scripture**   | The verses that inspired or were referenced during the Moment.               |
| **Prayers**     | What was prayed during or because of the Moment.                             |
| **Revelations** | What was learned or understood.                                              |
| **Highlights**  | Meaningful timestamps with a short note.                                     |

## Personas

- **The quiet-time keeper** — records personal devotionals and wants to revisit
  the scripture and prayers that shaped them.
- **The worship leader** — captures spontaneous and conference moments and
  wants to share highlights and revelations with a team.
- **The family** — preserves living-room worship and the prayers prayed together.

## Principles

1. **Audio-first.** The sound is the heart of a Moment; everything else is
   context around it.
2. **Private by default.** Audio is never publicly downloadable. Users stream
   via signed URLs.
3. **Capture is effortless.** Recording and adding context should take seconds.
4. **Meaning over volume.** Highlights, revelations and scripture make a Moment
   worth returning to.

## Scope

### P1 — Core capture

- Sign up / sign in (Supabase Auth)
- Record or upload audio
- Add context (title, date, place, people, type, artwork)
- Private storage with signed URLs
- Playback with waveform

### P2 — Meaning

- Transcription (Whisper) powering search
- Scripture attach (licensed Bible API)
- Highlights with timestamps
- Search across Moments

### P3 — Community

- Sharing a Moment
- Collections
- Collaborative Moments

## Success metrics

- Time-to-first-Moment (activation)
- Moments created per user per week
- Retention at 4 weeks
- % of Moments with a highlight or revelation attached

## Non-goals (for now)

- Social feed / public discovery
- Live streaming
- Web editor
