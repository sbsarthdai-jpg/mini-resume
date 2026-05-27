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
  ('contact', 'footer_text', 'text', '© 2025 MINI · MOTION GRAPHIC DESIGNER'),
  ('about', 'about_01_lead', 'text', '"마감 앞에서 흔들리지 않아요."'),
  ('about', 'about_01_body', 'text', '5년간 한 번도 마감을 놓친 적이 없어요. 풀리지 않는 컷이 생기면 새벽 두 시까지 붙들고 있는 편입니다.'),
  ('about', 'about_02_lead', 'text', '"노션엔 이미 60장의 레퍼런스."'),
  ('about', 'about_02_body', 'text', '클라이언트가 "이건 좀 다른 방향이…" 라고 운을 떼면, 다음 카드는 이미 준비되어 있습니다.'),
  ('about', 'about_03_lead', 'text', '"현장에서 가장 먼저 말 걸어요."'),
  ('about', 'about_03_body', 'text', '처음 보는 클라이언트와도 30분이면 농담을 주고받는 편입니다.'),
  ('about', 'about_04_lead', 'text', '"매일 1컷씩 5년째 만들어요."'),
  ('about', 'about_04_body', 'text', '인스타그램에 매일 1컷의 모션 작업을 올린 지 1,827일째.'),
  ('qna', 'qna_01_q', 'text', '어떤 작업을 가장 좋아하나요?'),
  ('qna', 'qna_01_a', 'text', '처음 시작할 때 아무것도 정해지지 않은 프로젝트요.'),
  ('qna', 'qna_02_q', 'text', '가장 기억에 남는 프로젝트는?'),
  ('qna', 'qna_02_a', 'text', 'tvN 드라마 <불 켜진 방> 오프닝 시퀀스.'),
  ('qna', 'qna_03_q', 'text', '작업할 때 가장 중요하게 생각하는 것은?'),
  ('qna', 'qna_03_a', 'text', '"이게 왜 움직여야 하는가."'),
  ('qna', 'qna_04_q', 'text', '함께 일하기 좋은 클라이언트 유형은?'),
  ('qna', 'qna_04_a', 'text', '"그냥 멋있게 해주세요" 보다 고민을 같이 나눠주시는 분.'),
  ('qna', 'qna_05_q', 'text', '5년 뒤 어떤 디자이너가 되어 있을까요?'),
  ('qna', 'qna_05_a', 'text', '지금처럼 매일 1컷씩은 만들고 있을 거예요.'),
  ('qna', 'qna_06_q', 'text', '취미는 무엇인가요?'),
  ('qna', 'qna_06_a', 'text', '필름카메라로 찍는 일요일 산책, 그리고 새벽에 베이킹.')
on conflict (section_key) do nothing;

-- profile_photo (이미지, 초기값 없음)
insert into public.pagecontents (page_name, section_key, content_type, image_url) values
  ('profile', 'profile_photo', 'image', null),
  ('about', 'about_01_img', 'image', null),
  ('about', 'about_02_img', 'image', null),
  ('about', 'about_03_img', 'image', null),
  ('about', 'about_04_img', 'image', null)
on conflict (section_key) do nothing;
