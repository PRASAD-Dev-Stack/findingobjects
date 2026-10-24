-- Versus multiplayer (2P / 3P / 4P): invites, turn timer, shared found-objects, scores.
-- All access goes through the SECURITY DEFINER functions below. Tables are locked
-- (RLS on, no policies), so phones can only do what the functions allow.
 
create table if not exists public.versus_profiles (
  player_id text primary key check (player_id ~ '^OF-[A-HJ-NP-Z2-9]{6}$'),
  name text not null default 'Player',
  avatar text not null default '🦊',
  last_seen timestamptz not null default now()
);
 
create table if not exists public.versus_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id text not null,
  level_id int not null,
  size int not null check (size between 2 and 4),
  total int not null check (total > 0),
  status text not null default 'waiting'
    check (status in ('waiting', 'playing', 'finished', 'cancelled')),
  turn_index int not null default 0,
  turn_seq int not null default 0,
  turn_started_at timestamptz,
  found jsonb not null default '{}'::jsonb, -- { "<objectId>": <seat of finder> }
  created_at timestamptz not null default now()
);
 
create table if not exists public.versus_members (
  room_id uuid not null references public.versus_rooms(id) on delete cascade,
  player_id text not null,
  seat int not null,
  status text not null default 'invited' check (status in ('invited', 'accepted', 'declined')),
  primary key (room_id, player_id),
  unique (room_id, seat)
);
create index if not exists versus_members_player_idx on public.versus_members(player_id, status);
 
alter table public.versus_profiles enable row level security;
alter table public.versus_rooms enable row level security;
alter table public.versus_members enable row level security;
revoke all on public.versus_profiles, public.versus_rooms, public.versus_members from anon, authenticated;
 
-- 1) Register this phone's Player ID so friends can invite it.
create or replace function public.versus_register(p_id text, p_name text, p_avatar text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_id !~ '^OF-[A-HJ-NP-Z2-9]{6}$' then raise exception 'Invalid Player ID'; end if;
  insert into versus_profiles(player_id, name, avatar, last_seen)
  values (p_id, left(coalesce(nullif(trim(p_name), ''), 'Player'), 20), left(coalesce(p_avatar, '🦊'), 8), now())
  on conflict (player_id) do update
    set name = excluded.name, avatar = excluded.avatar, last_seen = now();
end $$;
 
-- 2) Host creates a room and invites 1-3 friends.
create or replace function public.versus_create_room(p_host text, p_invitees text[], p_level int, p_total int)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  rid uuid; n int; i int := 1; pid text; ids text[];
begin
  select array_agg(upper(trim(x))) into ids from unnest(p_invitees) x;
  n := coalesce(array_length(ids, 1), 0);
  if n < 1 or n > 3 then raise exception 'Choose 1 to 3 friends'; end if;
  if not exists (select 1 from versus_profiles where player_id = p_host) then
    raise exception 'Your Player ID is not registered yet. Reopen the Versus screen and try again.';
  end if;
  if (select count(distinct x) from unnest(ids) x) <> n then raise exception 'Duplicate Player ID'; end if;
  if p_host = any(ids) then raise exception 'You cannot invite yourself'; end if;
  foreach pid in array ids loop
    if not exists (select 1 from versus_profiles where player_id = pid) then
      raise exception 'Player ID % not found. Ask your friend to open the Versus screen once on their phone.', pid;
    end if;
  end loop;
 
  update versus_rooms set status = 'cancelled' where host_id = p_host and status = 'waiting';
 
  insert into versus_rooms(host_id, level_id, size, total)
  values (p_host, p_level, n + 1, p_total) returning id into rid;
  insert into versus_members(room_id, player_id, seat, status) values (rid, p_host, 0, 'accepted');
  foreach pid in array ids loop
    insert into versus_members(room_id, player_id, seat, status) values (rid, pid, i, 'invited');
    i := i + 1;
  end loop;
  return rid;
end $$;
 
-- 3) Invites waiting for this player (shown on their Versus screen).
create or replace function public.versus_invites(p_player text)
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'room_id', r.id, 'size', r.size,
    'host_name', coalesce(h.name, 'A friend'), 'host_avatar', coalesce(h.avatar, '🦊')
  ) order by r.created_at desc), '[]'::jsonb)
  from versus_members m
  join versus_rooms r on r.id = m.room_id
  left join versus_profiles h on h.player_id = r.host_id
  where m.player_id = p_player and m.status = 'invited'
    and r.status = 'waiting' and r.created_at > now() - interval '5 minutes';
$$;
 
-- 4) Accept / decline. When everyone has accepted the match starts (3s get-ready).
create or replace function public.versus_respond(p_room uuid, p_player text, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare r versus_rooms;
begin
  select * into r from versus_rooms where id = p_room for update;
  if not found or r.status <> 'waiting' then raise exception 'This invite is no longer available'; end if;
  if not exists (select 1 from versus_members where room_id = p_room and player_id = p_player and status = 'invited') then
    raise exception 'No invite for you in this room';
  end if;
  if not p_accept then
    update versus_members set status = 'declined' where room_id = p_room and player_id = p_player;
    update versus_rooms set status = 'cancelled' where id = p_room;
    return;
  end if;
  update versus_members set status = 'accepted' where room_id = p_room and player_id = p_player;
  if not exists (select 1 from versus_members where room_id = p_room and status <> 'accepted') then
    update versus_rooms
      set status = 'playing', turn_index = 0, turn_seq = 0,
          turn_started_at = now() + interval '3 seconds'
      where id = p_room;
  end if;
end $$;
 
-- 5) Full room state for polling. "now" is the server clock in ms (for timer sync).
create or replace function public.versus_state(p_room uuid)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'now', (extract(epoch from clock_timestamp()) * 1000)::bigint,
    'room', jsonb_build_object(
      'id', r.id, 'host_id', r.host_id, 'level_id', r.level_id, 'size', r.size, 'total', r.total,
      'status', r.status, 'turn_index', r.turn_index, 'turn_seq', r.turn_seq,
      'turn_started_ms', (extract(epoch from r.turn_started_at) * 1000)::bigint,
      'found', r.found),
    'members', (
      select jsonb_agg(jsonb_build_object(
        'player_id', m.player_id, 'seat', m.seat, 'status', m.status,
        'name', coalesce(p.name, 'Player'), 'avatar', coalesce(p.avatar, '🦊')) order by m.seat)
      from versus_members m left join versus_profiles p on p.player_id = m.player_id
      where m.room_id = r.id)
  )
  from versus_rooms r where r.id = p_room;
$$;
 
-- 6) A tap on an object. Only the player whose turn it is can score.
create or replace function public.versus_tap(p_room uuid, p_player text, p_obj text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r versus_rooms; s int; nf jsonb;
begin
  select * into r from versus_rooms where id = p_room for update;
  if not found or r.status <> 'playing' then return jsonb_build_object('ok', false, 'reason', 'not_playing'); end if;
  select seat into s from versus_members where room_id = p_room and player_id = p_player;
  if s is null or s <> r.turn_index then return jsonb_build_object('ok', false, 'reason', 'not_your_turn'); end if;
  if now() < r.turn_started_at or now() > r.turn_started_at + interval '21 seconds' then
    return jsonb_build_object('ok', false, 'reason', 'time');
  end if;
  if r.found ? p_obj then return jsonb_build_object('ok', false, 'reason', 'taken'); end if;
  nf := r.found || jsonb_build_object(p_obj, s);
  update versus_rooms
    set found = nf,
        status = case when (select count(*) from jsonb_object_keys(nf)) >= r.total then 'finished' else status end
    where id = p_room;
  return jsonb_build_object('ok', true);
end $$;
 
-- 7) Pass the turn to the next player once 20 seconds are really over (server clock).
create or replace function public.versus_advance(p_room uuid, p_seq int, p_player text)
returns boolean language plpgsql security definer set search_path = public as $$
declare r versus_rooms;
begin
  select * into r from versus_rooms where id = p_room for update;
  if not found or r.status <> 'playing' or r.turn_seq <> p_seq then return false; end if;
  if not exists (select 1 from versus_members where room_id = p_room and player_id = p_player) then return false; end if;
  if now() < r.turn_started_at + interval '20 seconds' then return false; end if;
  update versus_rooms
    set turn_index = (r.turn_index + 1) % r.size, turn_seq = r.turn_seq + 1, turn_started_at = now()
    where id = p_room;
  return true;
end $$;
 
-- 8) Cancel / leave. Ends a waiting or running match for everybody.
create or replace function public.versus_leave(p_room uuid, p_player text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from versus_members where room_id = p_room and player_id = p_player) then
    update versus_rooms set status = 'cancelled' where id = p_room and status in ('waiting', 'playing');
  end if;
end $$;
 
revoke execute on function
  public.versus_register(text, text, text),
  public.versus_create_room(text, text[], int, int),
  public.versus_invites(text),
  public.versus_respond(uuid, text, boolean),
  public.versus_state(uuid),
  public.versus_tap(uuid, text, text),
  public.versus_advance(uuid, int, text),
  public.versus_leave(uuid, text)
from public;
grant execute on function
  public.versus_register(text, text, text),
  public.versus_create_room(text, text[], int, int),
  public.versus_invites(text),
  public.versus_respond(uuid, text, boolean),
  public.versus_state(uuid),
  public.versus_tap(uuid, text, text),
  public.versus_advance(uuid, int, text),
  public.versus_leave(uuid, text)
to anon, authenticated;