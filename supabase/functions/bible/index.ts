// Edge function: bible
// Proxies the api.bible REST API so the API key never lives in the client.
//
// Actions:
//   books    -> GET /bibles/{bibleId}/books
//   chapters -> GET /bibles/{bibleId}/books/{bookId}/chapters
//   verses   -> GET /bibles/{bibleId}/chapters/{chapterId}/verses
//   passage  -> GET /bibles/{bibleId}/passages/{passageId}

import { handlePreflight, json, requireEnv } from '../_shared/http.ts';

const API_BIBLE_KEY = requireEnv('API_BIBLE_KEY');
const API_BIBLE_BASE = 'https://rest.api.bible/v1';

type Action = 'books' | 'chapters' | 'verses' | 'passage';

interface BibleRequest {
  action: Action;
  bibleId: string;
  bookId?: string;
  chapterId?: string;
  passageId?: string;
}

/** IDs from api.bible are alphanumeric with `.` and `-` separators. */
const SAFE_ID = /^[A-Za-z0-9.\-]+$/;

function isSafeId(value: unknown): value is string {
  return typeof value === 'string' && SAFE_ID.test(value);
}

/** Builds the upstream URL, or returns `null` if the request is invalid. */
function buildUrl(req: BibleRequest): string | null {
  const { action, bibleId, bookId, chapterId, passageId } = req;
  if (!isSafeId(bibleId)) return null;
  const bible = `${API_BIBLE_BASE}/bibles/${bibleId}`;

  switch (action) {
    case 'books':
      return `${bible}/books`;
    case 'chapters':
      return isSafeId(bookId) ? `${bible}/books/${bookId}/chapters` : null;
    case 'verses':
      return isSafeId(chapterId) ? `${bible}/chapters/${chapterId}/verses` : null;
    case 'passage':
      return isSafeId(passageId) ? `${bible}/passages/${passageId}` : null;
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const url = buildUrl((await req.json()) as BibleRequest);
    if (!url) return json({ error: 'Invalid action or parameters' }, 400);

    const apiRes = await fetch(url, { headers: { 'api-key': API_BIBLE_KEY } });
    if (!apiRes.ok) {
      return json({ error: `api.bible request failed (${apiRes.status})` }, 502);
    }

    return json(await apiRes.json());
  } catch (err) {
    console.error('bible proxy failed', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
