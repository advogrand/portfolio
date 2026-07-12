create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  position integer not null check (position > 0),
  title text not null,
  category text not null,
  href text not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_contacts (
  id boolean primary key default true check (id),
  telegram_url text not null,
  behance_url text not null,
  updated_at timestamptz not null default now()
);

create table public.portfolio_about (
  id boolean primary key default true check (id),
  title text not null,
  paragraphs jsonb not null,
  facts jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.portfolio_admins where user_id = auth.uid());
$$;

create or replace function public.claim_portfolio_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or exists (select 1 from public.portfolio_admins) then
    return false;
  end if;

  insert into public.portfolio_admins (user_id) values (auth.uid());
  return true;
end;
$$;

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_contacts enable row level security;
alter table public.portfolio_about enable row level security;
alter table public.portfolio_admins enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.portfolio_projects, public.portfolio_contacts, public.portfolio_about to anon, authenticated;
grant insert, update, delete on public.portfolio_projects, public.portfolio_contacts, public.portfolio_about to authenticated;
grant execute on function public.is_portfolio_admin() to authenticated;
grant execute on function public.claim_portfolio_admin() to authenticated;

create policy "Public can read projects" on public.portfolio_projects for select using (true);
create policy "Admins manage projects" on public.portfolio_projects for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "Public can read contacts" on public.portfolio_contacts for select using (true);
create policy "Admins manage contacts" on public.portfolio_contacts for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "Public can read about" on public.portfolio_about for select using (true);
create policy "Admins manage about" on public.portfolio_about for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

insert into storage.buckets (id, name, public)
values ('case-covers', 'case-covers', true)
on conflict (id) do update set public = true;

create policy "Public can read case covers" on storage.objects for select using (bucket_id = 'case-covers');
create policy "Admins manage case covers" on storage.objects for all to authenticated using (bucket_id = 'case-covers' and public.is_portfolio_admin()) with check (bucket_id = 'case-covers' and public.is_portfolio_admin());

insert into public.portfolio_projects (position, title, category, href, image_url)
values
  (1, 'Рекламные креативы', 'Баннеры / SMM-дизайн', 'https://www.behance.net/gallery/209009189/reklamnye-kreativy', 'https://advogrand.github.io/portfolio/images/cases/01-ad-creatives.jpg'),
  (2, 'VERSO Grooming', 'Promo Landing', 'https://advogrand.github.io/verso/', 'https://advogrand.github.io/portfolio/images/cases/02-verso-grooming.webp'),
  (3, 'Pet Grooming Franchise', 'Pitch Deck', 'https://www.behance.net/gallery/250345027/Pet-grooming-franchise-Pitch-Deck', 'https://advogrand.github.io/portfolio/images/cases/03-pet-grooming-pitch-deck.jpg'),
  (4, 'ORBIT House', 'Immersive Landing', 'https://advogrand.github.io/orbit/', 'https://advogrand.github.io/portfolio/images/cases/04-orbit-house.webp'),
  (5, 'Digital-система для поставщика ЖД-материалов', 'Digital-дизайн', 'https://www.behance.net/gallery/236105371/Digital-dizajn-dlja-postavschika-zhd-materialov', 'https://advogrand.github.io/portfolio/images/cases/05-railway-supplier.jpg'),
  (6, 'Lumen Anvil', 'Game Studio Landing', 'https://advogrand.github.io/Lumen-Anvil/', 'https://advogrand.github.io/portfolio/images/cases/06-lumen-anvil.webp'),
  (7, 'PHASE Lighting', 'Product Landing', 'https://advogrand.github.io/Phase/', 'https://advogrand.github.io/portfolio/images/cases/07-phase-lighting.webp'),
  (8, 'Crypto Education', 'Taplink', 'https://www.behance.net/gallery/187450063/taplink-kurs-po-kriptovaljute', 'https://advogrand.github.io/portfolio/images/cases/08-crypto-taplink.jpg');

insert into public.portfolio_contacts (id, telegram_url, behance_url)
values (true, 'https://t.me/kirillbv1', 'https://www.behance.net/kirillbv1');

insert into public.portfolio_about (id, title, paragraphs, facts)
values (
  true,
  'Работаю с дизайном как с системой',
  jsonb_build_array(
    'Я Кирилл Алексеевец, digital-дизайнер с 3+ годами коммерческого опыта.',
    'Работал в веб-студии, на фрилансе и в креативном агентстве. Основной фокус — рекламные креативы, презентации, лендинги и дизайн-поддержка.',
    'Особенно хорошо работаю с уже существующими визуальными системами: развиваю их, адаптирую под новые задачи и сохраняю единый стиль во всех материалах.',
    'В работе ценю понятную коммуникацию, соблюдение договорённостей и внимание к задаче, а не только к внешнему виду.'
  ),
  jsonb_build_array(
    '3+ года коммерческого опыта',
    'Веб-студия · фриланс · агентство',
    'Баннеры · презентации · сайты · дизайн-поддержка'
  )
);
