# moments

> An audio-first worship platform that captures and preserves the full story of an encounter with God.

Moments is built around a single idea: **a Moment is the audio plus everything around it.** From quiet time and prayer to living rooms, conferences and spontaneous gatherings, moments records the sound and the context that makes it meaningful — the scripture that inspired it, the prayers prayed, the revelations received, and the highlights worth returning to.

## What is a Moment?

A **Moment** is the core object of the platform. It is the audio recording plus the story that surrounds it:

| Field           | Description                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| **Sound**       | Recorded in the app or uploaded. Stored privately, streamed via signed URLs. |
| **Context**     | Title, date, place, people, artwork and type.                                |
| **Scripture**   | The verses that inspired or were referenced during the Moment.               |
| **Prayers**     | What was prayed during or because of the Moment.                             |
| **Revelations** | What was learned or understood.                                              |
| **Highlights**  | Meaningful timestamps with a short note.                                     |

## Tech Stack

| Layer               | Choice                                                                | Why                                                    |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| Mobile app          | React Native with Expo                                                | One codebase for iOS and Android; good audio libraries |
| Backend             | Supabase (Postgres, Auth, Storage, row-level security)                | Auth, database and private file storage in one place   |
| Audio storage       | Supabase Storage, private buckets, signed URLs                        | Supports "no downloads" by default                     |
| Audio               | `expo-audio` / `react-native-track-player`; waveform via a peaks file | Background playback and lock-screen controls           |
| Transcription (P2)  | Whisper API or similar                                                | Powers search and Scripture suggestions                |
| Scripture data (P2) | Licensed Bible API (check licences for translations)                  | Built-in Bible and verse attach                        |
| Analytics           | PostHog                                                               | Privacy-friendly funnels and retention                 |
| Errors              | Sentry                                                                | Crash reports                                          |
| Build / CI          | EAS Build (mobile), GitHub Actions                                    | Standard                                               |

## Repository Structure

```
moments/
  apps/
    mobile/                 Expo app (iOS + Android)
  packages/
    ui/                     Shared design tokens and components
    types/                  Shared TypeScript types
    config/                 Shared eslint and tsconfig presets
  supabase/
    migrations/             SQL schema (Postgres)
    functions/              Edge functions
  docs/
    brief.md                Product brief
    decisions/              Architecture decision records (ADRs)
    research/               Research notes
```

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+ (or pnpm)
- Expo CLI (`npx expo`)
- A Supabase project (local or hosted)

### Install

```bash
npm install
```

### Run the mobile app

```bash
npm run dev:mobile
```

This starts the Expo dev server. Scan the QR code with the Expo Go app, or press `a` / `i` to open the Android emulator / iOS simulator.

### Local Supabase

```bash
npm run supabase:start
npm run supabase:migrate
```

This starts the local Supabase stack and applies the migrations in `supabase/migrations/`.

### Environment variables

Copy the example env files and fill in your values:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Never commit real secrets. See `.gitignore`.

## Scripts

| Command                    | Description               |
| -------------------------- | ------------------------- |
| `npm run dev:mobile`       | Start the Expo dev server |
| `npm run typecheck`        | Type-check all packages   |
| `npm run lint`             | Lint all packages         |
| `npm run supabase:start`   | Start local Supabase      |
| `npm run supabase:migrate` | Apply migrations          |
| `npm run supabase:stop`    | Stop local Supabase       |

## License

[MIT](./LICENSE)
