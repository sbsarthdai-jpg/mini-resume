-- ============================================================
-- MINI Design Resume — Supabase DB 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요
-- ============================================================

-- 1. users 테이블 (Supabase Auth 기반이므로 auth.users 활용)
-- 별도 users 테이블 없이 Supabase Auth 내장 기능 사용

-- 2. comments 테이블
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references public.comments(id) on delete cascade,
  author_name text not null default '익명',
  content     text not null,
  image_url   text,
  is_private  boolean not null default false,
  is_deleted  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 3. pagecontents 테이블 (관리자 텍스트/이미지 수정용)
create table if not exists public.pagecontents (
  id            serial primary key,
  page_name     text not null,
  section_key   text not null unique,
  content_type  text not null check (content_type in ('text', 'image')),
  content_value text,
  image_url     text,
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- Row Level Security 설정
-- ============================================================

alter table public.comments enable row level security;
alter table public.pagecontents enable row level security;

-- 기존 정책 삭제 (재실행 시 중복 오류 방지)
drop policy if exists "Public read comments" on public.comments;
drop policy if exists "Public insert comments" on public.comments;
drop policy if exists "Auth read all comments" on public.comments;
drop policy if exists "Auth update comments" on public.comments;
drop policy if exists "Auth delete comments" on public.comments;
drop policy if exists "Auth insert reply" on public.comments;
drop policy if exists "Public read pagecontents" on public.pagecontents;
drop policy if exists "Auth manage pagecontents" on public.pagecontents;
drop policy if exists "Public upload comment images" on storage.objects;
drop policy if exists "Public read comment images" on storage.objects;

-- comments: 누구나 비삭제·비공개 댓글 조회 가능
create policy "Public read comments" on public.comments
  for select using (is_deleted = false and is_private = false);

-- comments: 누구나 최상위 댓글(parent_id is null) 등록 가능
create policy "Public insert comments" on public.comments
  for insert with check (parent_id is null);

-- comments: 로그인된 사용자(관리자)는 모든 댓글 조회 가능
create policy "Auth read all comments" on public.comments
  for select using (auth.role() = 'authenticated');

-- comments: 로그인된 사용자(관리자)는 댓글 수정·삭제 가능
create policy "Auth update comments" on public.comments
  for update using (auth.role() = 'authenticated');

create policy "Auth delete comments" on public.comments
  for delete using (auth.role() = 'authenticated');

-- comments: 로그인된 사용자(관리자)는 답변 삽입 가능
create policy "Auth insert reply" on public.comments
  for insert with check (auth.role() = 'authenticated');

-- pagecontents: 누구나 조회 가능
create policy "Public read pagecontents" on public.pagecontents
  for select using (true);

-- pagecontents: 로그인된 사용자(관리자)만 수정 가능
create policy "Auth manage pagecontents" on public.pagecontents
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- Storage Bucket 생성 (comment 이미지용)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('comment-images', 'comment-images', true)
on conflict (id) do nothing;

-- storage: 누구나 이미지 업로드 가능
create policy "Public upload comment images" on storage.objects
  for insert with check (bucket_id = 'comment-images');

-- storage: 누구나 이미지 조회 가능
create policy "Public read comment images" on storage.objects
  for select using (bucket_id = 'comment-images');

-- ============================================================
-- pagecontents 초기 데이터
-- ============================================================
insert into public.pagecontents (page_name, section_key, content_type, content_value) values
  ('hero', 'display_name', 'text', 'MINI'),
  ('hero', 'full_name', 'text', '김미니 (MINI)'),
  ('hero', 'role', 'text', 'Motion Graphic Designer'),
  ('hero', 'tagline', 'text', '통통 튀는 모션과 5년의 손맛으로 이야기를 움직이게 합니다.'),
  ('profile', 'subtitle', 'text', '통통 튀고 상큼한 아이디어 생성기'),
  ('contact', 'footer_text', 'text', '© 2025 MINI · MOTION GRAPHIC DESIGNER')
on conflict (section_key) do nothing;
