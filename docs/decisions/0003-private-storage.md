# ADR-0003: Private storage with signed URLs

## Status
Accepted

## Context

Moments audio is personal and should not be publicly downloadable. We need to
store files privately and stream them to the owner on demand.

## Decision

Use **Supabase Storage** with **private buckets** and **signed URLs**.

- Audio and artwork are stored in private buckets (`audio`, `artwork`).
- Objects are stored under the path `<user_id>/<object>`.
- Row-level security policies restrict access to the owner.
- The client requests a short-lived signed URL to stream a file.

## Consequences

- Files are private by default — no public URLs.
- Signed URLs expire, so they are not shareable indefinitely.
- Streaming requires a round-trip to generate a signed URL.
- Signed URLs are created by the client with the user's own session, so
  storage RLS decides what can be signed. An earlier `signed-url` edge function
  used the service-role key without an ownership check and was removed.
