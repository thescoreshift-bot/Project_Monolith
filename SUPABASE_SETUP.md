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
  score integer not null,
  region text,
  starter_name text,
  final_team jsonb,
  badges_earned integer default 0,
  highest_level integer default 1,
  evolutions_count integer default 0,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, daily_seed)
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

### Optional extras

```sql
-- Tutorial flag on profiles (cloud sync)
alter table public.player_profiles
add column if not exists tutorial_completed boolean default false;

-- Tester feedback (optional — form still works offline via copyable report)
create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  kind text not null,
  what_happened text not null,
  expected_behavior text,
  contact text,
  screen text,
  region text,
  save_slot text,
  app_version text,
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

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Login/Register disabled on title | Add `.env` keys and restart `npm run dev`. |
| "Invalid API key" | Use anon/publishable key from **Settings → API**, not service role. |
| Register works but login fails | Disable email confirmation for testing, or confirm email from inbox. |
| Saves not appearing | Run the SQL above; check **Table Editor** → `game_saves`. |
| RLS errors | Ensure user is logged in; policies must use `authenticated` role. |
