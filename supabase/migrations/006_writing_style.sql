-- 006_writing_style.sql
--
-- Tier 2: writing-style calibration for anti-AI-detection cover letters.
-- Ported from career-ops commit 9ae201d (writing-samples user-layer folder
-- + Writing Style Calibration in modes/_shared.md). Goal: capture abstract
-- style descriptors (tone, sentence-length distribution, punctuation
-- habits, vocabulary, voice signatures) so generated cover letters mimic
-- the user's actual writing instead of GPT-default. Recruiters in 2026
-- increasingly use AI-detection tools; generic LLM output is a hit-rate
-- killer.
--
-- Strategy: additive only. Two parts:
--   1. Two new columns on the existing resume_profiles row (one row/user)
--   2. New writing_samples table (raw user uploads, RLS-gated)
--
-- Privacy: `writing_style` jsonb stores only ABSTRACT descriptors — never
-- verbatim sample text. PII (name/email/phone) is stripped pre-LLM via
-- sanitizePII.ts. Raw samples in writing_samples are RLS-gated; user can
-- delete at any time.
--
-- Rollback:
--   alter table resume_profiles
--     drop column if exists writing_style,
--     drop column if exists writing_style_calibrated_at;
--   drop table if exists writing_samples;

alter table resume_profiles
  add column if not exists writing_style jsonb,
  add column if not exists writing_style_calibrated_at timestamptz;

create table if not exists writing_samples (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  filename    text not null,
  content     text not null,
  byte_size   integer not null,
  created_at  timestamptz not null default now()
);

alter table writing_samples enable row level security;

-- Each user reads/writes ONLY their own writing samples. Pattern matches
-- `jobs` and `evaluations` from migration 001.
create policy "users_own_writing_samples"
  on writing_samples for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists writing_samples_user_idx
  on writing_samples(user_id, created_at desc);

comment on column resume_profiles.writing_style is
  'Abstract style descriptors extracted from writing_samples. JSON shape: {tone, avgSentenceLength, openingPattern, punctuationHabits, vocabularyPrefs, structurePatterns, voiceSignatures, avoidList}. Used by /api/ai/cover-letter to bias LLM output toward the user voice. NEVER stores verbatim sample text.';

comment on column resume_profiles.writing_style_calibrated_at is
  'Timestamp of the most recent successful style extraction. NULL until first calibration.';

comment on table writing_samples is
  'User-uploaded writing samples (emails, blog posts, slack messages, etc) used as input to writing_style extraction. RLS-gated; user-owned.';
