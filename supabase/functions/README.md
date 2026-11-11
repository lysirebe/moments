# Edge functions

Supabase Edge Functions (Deno) for the Moments platform.

## Functions

| Function | Description |
| --- | --- |
| `bible` | Proxies api.bible so the API key never ships in the app. Validates every ID before building the upstream URL. |
| `transcribe` | Transcribes a moment's audio with Whisper and stores the transcript on `moments_audio`. Runs as the calling user, so row-level security decides what they can read and write. |

Shared helpers (CORS, JSON responses, required env vars) live in `_shared/`.

### Why there is no signed-URL function

Signed URLs for private audio are created directly by the client with
`supabase.storage.from('audio').createSignedUrl(...)`. Storage RLS already
restricts each user to their own `<user_id>/` folder, so a service-role
function would only add an attack surface. See
[ADR-0003](../../docs/decisions/0003-private-storage.md).

## Local development

```bash
supabase functions serve
```

## Deploy

```bash
supabase functions deploy bible
supabase functions deploy transcribe
```

## Secrets

```bash
supabase secrets set OPENAI_API_KEY=<your-key>
supabase secrets set API_BIBLE_KEY=<your-key>
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided automatically by the
Supabase runtime.
