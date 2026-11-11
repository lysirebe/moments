// Edge function: transcribe
// Transcribes a moment's audio with the OpenAI Whisper API and stores the
// transcript on its `moments_audio` row.
//
// Security: the Supabase client is created with the caller's JWT rather than
// the service-role key, so every read and write goes through row-level
// security. A caller can only transcribe audio they own, and the storage path
// is read from the database rather than trusted from the request body.

import { createClient } from 'npm:@supabase/supabase-js@2';

import { handlePreflight, json, requireEnv } from '../_shared/http.ts';

const OPENAI_API_KEY = requireEnv('OPENAI_API_KEY');
const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = requireEnv('SUPABASE_ANON_KEY');

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const authorization = req.headers.get('Authorization');
  if (!authorization) {
    return json({ error: 'Missing Authorization header' }, 401);
  }

  try {
    const { momentId } = await req.json();
    if (typeof momentId !== 'string' || momentId.length === 0) {
      return json({ error: 'momentId is required' }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authorization } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: 'Not authenticated' }, 401);
    }

    // RLS only returns the row when the caller owns the moment.
    const { data: audio, error: audioError } = await supabase
      .from('moments_audio')
      .select('id, storage_path, file_name')
      .eq('moment_id', momentId)
      .maybeSingle();

    if (audioError) return json({ error: 'Failed to load audio' }, 500);
    if (!audio) return json({ error: 'Moment audio not found' }, 404);

    const { data: file, error: downloadError } = await supabase.storage
      .from('audio')
      .download(audio.storage_path);

    if (downloadError || !file) {
      return json({ error: 'Failed to download audio' }, 404);
    }

    const form = new FormData();
    form.append('file', file, audio.file_name ?? 'audio.m4a');
    form.append('model', 'whisper-1');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (!whisperRes.ok) {
      return json({ error: `Transcription failed (${whisperRes.status})` }, 502);
    }

    const { text } = (await whisperRes.json()) as { text: string };

    const { error: updateError } = await supabase
      .from('moments_audio')
      .update({ transcript: text, transcribed: true })
      .eq('id', audio.id);

    if (updateError) return json({ error: 'Failed to save transcript' }, 500);

    return json({ transcript: text });
  } catch (err) {
    console.error('transcribe failed', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
