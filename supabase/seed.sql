-- ============================================================================
-- moments — seed data
-- ============================================================================
-- Optional sample data for local development. Run with `supabase db reset`.
-- ============================================================================

-- A sample user (password: password123)
insert into
    auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
values (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000001',
        'authenticated',
        'authenticated',
        'demo@moments.app',
        crypt (
            'password123',
            gen_salt ('bf')
        ),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    )
on conflict (id) do nothing;

insert into
    auth.identities (
        id,
        user_id,
        provider,
        provider_id,
        identity_data,
        last_sign_in_at,
        created_at,
        updated_at
    )
values (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'email',
        '00000000-0000-0000-0000-000000000001',
        jsonb_build_object(
            'sub',
            '00000000-0000-0000-0000-000000000001',
            'email',
            'demo@moments.app'
        ),
        now(),
        now(),
        now()
    )
on conflict (id) do nothing;

-- A sample Moment. It has no audio row: upload or record one in the app to
-- hear playback, since storage objects can't be seeded with SQL.
insert into
    public.moments (id, user_id, title, date, place, people, type)
values (
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'Morning quiet time',
        current_date,
        'Living room',
        '[{"id": "p1", "name": "Isobel"}]'::jsonb,
        'quiet_time'
    )
on conflict (id) do nothing;

insert into
    public.moment_scriptures (moment_id, reference, translation, text)
values (
        '10000000-0000-0000-0000-000000000001',
        'Psalm 46:10',
        'NIV',
        'Be still, and know that I am God.'
    )
on conflict do nothing;

insert into
    public.moment_notes (moment_id, user_id, kind, content)
values
    (
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'prayer',
        'Lord, help me to be still and know that you are God.'
    ),
    (
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'revelation',
        'Stillness is not emptiness. It is presence.'
    ),
    (
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'reflection',
        'The moment of stillness.'
    )
on conflict do nothing;
