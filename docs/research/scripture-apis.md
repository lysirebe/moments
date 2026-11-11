# Research: Scripture APIs

## Requirements

- Look up a verse by reference (e.g. "John 3:16").
- Fetch verse text for a given translation.
- **Licensing:** must permit use in a commercial app.

## Options

### Bible API (bible-api.com)

- **Pros:** Free, no key required, simple JSON.
- **Cons:** Limited translations, licensing unclear for commercial use.

### Scripture API (scripture.api.bible)

- **Pros:** Many translations, official API, good docs.
- **Cons:** Requires an API key; check licensing per translation.

### YouVersion / Bible.com API

- **Pros:** Large translation set.
- **Cons:** Restricted access; requires partnership.

### Local dataset (e.g. open-source Bible JSON)

- **Pros:** Full control, offline, no API dependency.
- **Cons:** Licensing varies by translation; large data.

## Recommendation

Evaluate **scripture.api.bible** for P2. **Verify the licence for each
translation** before shipping. Keep the translation code on `moment_scriptures`
so the app can render the correct text.

## Open questions

- Which translations are licensed for commercial use?
- Do we store verse text, or fetch it on demand?
