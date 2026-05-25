# Supabase setup for Project MONOLITH

Follow these steps in order. The game code is already wired for cloud saves; you mainly need the Supabase project, SQL, and `.env` file.

---

## Step 1 — Install the client (already done if you cloned recent code)

From `D:\Project Monolith`:

```bash
npm.cmd install @supabase/supabase-js
```

Check `package.json` — `@supabase/supabase-js` should appear under `dependencies`.

---

## Step 2 — Environment variables

1. Copy `.env.example` to `.env` in the project root (or edit the existing `.env`).
2. Paste your **Project URL** and **anon / publishable** key (not the service role key):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_or_publishable_key_here
```

3. `.env` is listed in `.gitignore` — do not commit it.
4. Restart the dev server after changing `.env` (`Ctrl+C`, then `npm.cmd run dev`).

---

## Step 3 — Supabase dashboard: Email auth

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **Authentication** → **Providers** → enable **Email**.
4. For testing, you can disable email confirmation: **Authentication** → **Settings** → turn off **Confirm email** (turn it back on for production).

---

## Step 4 — Run SQL (table + RLS + updated_at trigger)

1. In the dashboard, open **SQL Editor** → **New query**.
2. Paste and run **all** of the SQL below.

```sql
create table if not exists public.game_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot_id integer not null check (slot_id in (1, 2)),
  save_name text,
  save_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, slot_id)
);

alter table public.game_saves enable row level security;

create policy "Users can read their own saves"
on public.game_saves
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own saves"
on public.game_saves
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own saves"
on public.game_saves
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own saves"
on public.game_saves
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_game_saves_updated_at on public.game_saves;

create trigger update_game_saves_updated_at
before update on public.game_saves
for each row
execute function public.update_updated_at_column();
```

### Player profiles (trainer names for leaderboards)

Run this **after** the `game_saves` SQL. Required for Daily Run, leaderboards, and cloud play usernames.

```sql
create table if not exists public.player_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  display_name text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.player_profiles enable row level security;

create policy "Anyone can read player profiles"
on public.player_profiles
for select
to authenticated
using (true);

create policy "Users can create their own profile"
on public.player_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
on public.player_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_player_profiles_updated_at on public.player_profiles;

create trigger update_player_profiles_updated_at
before update on public.player_profiles
for each row
execute function public.update_updated_at_column();
```

**If you already created `player_profiles` without a unique `display_name`**, run once:

```sql
alter table public.player_profiles
add constraint player_profiles_display_name_key unique (display_name);
```

**Schema cache note:** After creating a new table in Supabase, refresh the app (restart `npm run dev` or redeploy). If you still see “Could not find the table … in the schema cache”, wait a minute and try again, or open **Supabase → Settings → API** and confirm the table appears under **Table Editor**.

### Daily leaderboards

```sql
create table if not exists public.daily_leaderboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  daily_seed text not null,
  slot_id integer,
  save_name text,
  trainer_name text,
  run_id text,
  score integer not null,
  region text,
  starter_name text,
  final_team jsonb,
  badges_earned integer default 0,
  highest_level integer default 1,
  evolutions_count integer default 0,
  nodes_cleared integer default 0,
  bosses_defeated integer default 0,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, daily_seed, slot_id)
);

alter table public.daily_leaderboards enable row level security;

create policy "Authenticated users can read daily leaderboards"
on public.daily_leaderboards
for select
to authenticated
using (true);

create policy "Users can insert their own leaderboard scores"
on public.daily_leaderboards
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own leaderboard scores"
on public.daily_leaderboards
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop trigger if exists update_daily_leaderboards_updated_at on public.daily_leaderboards;

create trigger update_daily_leaderboards_updated_at
before update on public.daily_leaderboards
for each row
execute function public.update_updated_at_column();
```

**If you already created `daily_leaderboards`**, run this migration once so each save slot can submit its own daily score and show save/trainer names:

```sql
alter table public.daily_leaderboards
add column if not exists slot_id integer;

alter table public.daily_leaderboards
add column if not exists save_name text;

alter table public.daily_leaderboards
add column if not exists trainer_name text;

alter table public.daily_leaderboards
add column if not exists run_id text;

alter table public.daily_leaderboards
add column if not exists nodes_cleared integer default 0;

alter table public.daily_leaderboards
add column if not exists bosses_defeated integer default 0;

-- Allow separate leaderboard rows per save slot (Slot 1 and Slot 2).
alter table public.daily_leaderboards
drop constraint if exists daily_leaderboards_user_id_daily_seed_key;

alter table public.daily_leaderboards
drop constraint if exists daily_leaderboards_user_id_daily_seed_slot_id_key;

alter table public.daily_leaderboards
add constraint daily_leaderboards_user_id_daily_seed_slot_id_key
unique (user_id, daily_seed, slot_id);
```

Old rows without `slot_id` or `save_name` still load; the UI shows **Unnamed Save** when names are missing.

### PvP friend challenges

Run this after `daily_leaderboards` if you want Friend Battle codes to sync via Supabase.

```sql
create table if not exists public.pvp_challenges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  creator_display_name text not null,
  team_snapshot jsonb not null,
  team_power integer default 0,
  region text,
  highest_level integer default 1,
  badges_count integer default 0,
  wins integer default 0,
  losses integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz
);

alter table public.pvp_challenges enable row level security;

create policy "Authenticated users can read pvp challenges"
on public.pvp_challenges
for select
to authenticated
using (true);

create policy "Users can insert their own pvp challenges"
on public.pvp_challenges
for insert
to authenticated
with check ((select auth.uid()) = creator_user_id);

create policy "Users can update their own pvp challenges"
on public.pvp_challenges
for update
to authenticated
using ((select auth.uid()) = creator_user_id)
with check ((select auth.uid()) = creator_user_id);

drop trigger if exists update_pvp_challenges_updated_at on public.pvp_challenges;

create trigger update_pvp_challenges_updated_at
before update on public.pvp_challenges
for each row
execute function public.update_updated_at_column();
```

### Optional extras

```sql
-- Tutorial flag on profiles (cloud sync)
alter table public.player_profiles
add column if not exists tutorial_completed boolean default false;

-- Tester feedback (optional — form still works offline via copyable report)
-- Stable columns only; extra fields (kind alias, contact, user_agent, save slot label, etc.) live in report_data jsonb.
-- save_slot: integer 1 or 2 when in a character slot; null on title / daily run / no active save.
-- Full label (e.g. "Cloud 1", "Daily run", "None") is stored in report_data.save_slot_label.
create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text,
  report_type text not null,
  message text not null,
  expected_behavior text,
  current_screen text,
  current_region text,
  save_slot integer,
  app_version text,
  browser_info text,
  report_data jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz default now()
);

alter table public.feedback_reports enable row level security;

create policy "Users can insert feedback"
on public.feedback_reports
for insert
to authenticated
with check (user_id is null or (select auth.uid()) = user_id);

create policy "Users can read own feedback"
on public.feedback_reports
for select
to authenticated
using (user_id is null or (select auth.uid()) = user_id);

-- Offline / logged-out players use the anon key — allow anonymous feedback rows only.
create policy "Anonymous feedback insert"
on public.feedback_reports
for insert
to anon
with check (user_id is null);
```

If you created an older `feedback_reports` table with columns like `kind`, `what_happened`, or `contact`, either drop and recreate it with the SQL above, or migrate:

```sql
-- Optional migration from legacy feedback_reports shape
alter table public.feedback_reports
  add column if not exists display_name text,
  add column if not exists report_type text,
  add column if not exists message text,
  add column if not exists current_screen text,
  add column if not exists current_region text,
  add column if not exists browser_info text,
  add column if not exists report_data jsonb default '{}'::jsonb,
  add column if not exists status text default 'open';

update public.feedback_reports
set
  report_type = coalesce(report_type, kind, 'feedback'),
  message = coalesce(message, what_happened, ''),
  current_screen = coalesce(current_screen, screen),
  current_region = coalesce(current_region, region),
  display_name = coalesce(display_name, contact),
  report_data = coalesce(report_data, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
    'kind', kind,
    'contact', contact,
    'legacy_what_happened', what_happened
  )),
  status = coalesce(status, 'open')
where report_type is null or message is null;

-- save_slot must be integer (1 or 2) or null — not text labels like "None"
alter table public.feedback_reports
  alter column save_slot type integer using (
    case
      when save_slot is null then null
      when save_slot::text ~ '^\d+$' then save_slot::integer
      when save_slot::text ~ '1' then 1
      when save_slot::text ~ '2' then 2
      else null
    end
  );

alter table public.feedback_reports
  drop column if exists kind,
  drop column if exists what_happened,
  drop column if exists contact,
  drop column if exists screen,
  drop column if exists region;
```

3. If policies already exist from an older run, drop them first or skip duplicate-policy errors.

---

## Step 5 — Run player_profiles and daily_leaderboards SQL

**Open `SUPABASE_SETUP.md` and run the new `player_profiles` and `daily_leaderboards` SQL blocks in the Supabase SQL Editor** (sections above). Cursor cannot create tables in your project unless you use Supabase CLI locally.

After running the SQL, restart `npm run dev` if the app still reports a stale schema cache.

---

## Step 6 — Run the game

```bash
npm.cmd install
npm.cmd run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## How saves work in the app

| Mode | Slots | Storage |
|------|--------|---------|
| **Play Offline** | Local Slot 1 & 2 | `localStorage` only |
| **Logged in → Play** | Cloud Slot 1 & 2 | Supabase `game_saves` + local mirror backup |

- Autosave writes to the active slot after map/combat/perks/etc.
- If cloud save fails: **"Cloud save failed. Local backup saved."** — game keeps running.
- **Upload Local Save to Cloud** appears when logged in and local slots have data.
- Logout does **not** delete local saves.

---

## Security

- Only the **anon / publishable** key belongs in the Vite app (`VITE_SUPABASE_ANON_KEY`).
- **Never** put the **service role** key in frontend code.
- RLS ensures each user only reads/writes rows where `user_id = auth.uid()`.

---

## Quick test checklist

1. `npm.cmd run dev` — no errors.
2. `npm.cmd run build` — passes.
3. Register → Login → **Play** → see Cloud Slot 1 & 2.
4. New game in Cloud Slot 1 → play → refresh → Login → **Continue** Cloud Slot 1.
5. **Play Offline** → Local Slot 1 & 2 still work without login.
6. Delete / overwrite cloud slot asks for confirmation.

---

## Fix game_saves RLS (run if you see “violates row-level security policy”)

Paste in **SQL Editor** if cloud upload/save fails with an RLS error (safe to re-run):

```sql
alter table public.game_saves enable row level security;

grant select, insert, update, delete on table public.game_saves to authenticated;

drop policy if exists "Users can read their own saves" on public.game_saves;
drop policy if exists "Users can insert their own saves" on public.game_saves;
drop policy if exists "Users can update their own saves" on public.game_saves;
drop policy if exists "Users can delete their own saves" on public.game_saves;

create policy "Users can read their own saves"
on public.game_saves for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own saves"
on public.game_saves for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own saves"
on public.game_saves for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own saves"
on public.game_saves for delete to authenticated
using (auth.uid() = user_id);
```

Then sign out in the game, sign in again, and retry **Continue** or **Upload Local Save to Cloud**.

In **Table Editor → game_saves**, confirm rows exist for your account (`user_id` matches **Authentication → Users**).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Login/Register disabled on title | Add `.env` keys and restart `npm run dev`. |
| "Invalid API key" | Use anon/publishable key from **Settings → API**, not service role. |
| Register works but login fails | Disable email confirmation for testing, or confirm email from inbox. |
| Saves not appearing | Run the SQL above; check **Table Editor** → `game_saves`. |
| RLS errors on `game_saves` | Sign out and sign in again. Run the **Fix game_saves RLS** SQL below. Never use the service role key in the app. |
| Local saves “gone” but cloud should have data | `localStorage` is per browser + origin (`localhost` ≠ Vercel URL). Cloud saves need the **same login account** (new sign-up = new `user_id`). |
