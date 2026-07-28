-- ============================================================================
--  Panel rezerwacji — Plaża Kownatki
--  Wspólna baza grafiku 2026. Uruchom całość w Supabase → SQL Editor → Run.
--  Można uruchamiać wielokrotnie — nic nie zepsuje istniejących danych.
-- ============================================================================

-- Jedna komórka grafiku = jeden wiersz.
-- id ma postać "2026-07-27|d1"  (data | kolumna).
create table if not exists public.kownatki_rezerwacje (
  id          text primary key,
  s           text,                       -- 'z' zarezerwowane | 'p' wyjazd/przyjazd | 'c' kolor własny
  c           text,                       -- id koloru z palety (gdy s = 'c')
  n           text default '',            -- notatka / imię gościa
  updated_at  timestamptz default now()
);

-- Dostęp dla klucza publicznego (strona jest statyczna, bez logowania po stronie serwera)
alter table public.kownatki_rezerwacje enable row level security;

drop policy if exists "panel_select" on public.kownatki_rezerwacje;
create policy "panel_select" on public.kownatki_rezerwacje
  for select using (true);

drop policy if exists "panel_insert" on public.kownatki_rezerwacje;
create policy "panel_insert" on public.kownatki_rezerwacje
  for insert with check (true);

drop policy if exists "panel_update" on public.kownatki_rezerwacje;
create policy "panel_update" on public.kownatki_rezerwacje
  for update using (true) with check (true);

drop policy if exists "panel_delete" on public.kownatki_rezerwacje;
create policy "panel_delete" on public.kownatki_rezerwacje
  for delete using (true);

-- Synchronizacja na żywo między otwartymi panelami
do $$
begin
  alter publication supabase_realtime add table public.kownatki_rezerwacje;
exception
  when duplicate_object then null;
end $$;
