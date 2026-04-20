-- ============================================================
-- KallesVMTips2026 – Rätta datum och tider för slutspelet
-- Kör detta i Supabase SQL Editor
-- Alla tider i UTC (svensk tid = UTC+2 under sommaren)
--
-- R32: 28 juni – 3 juli 2026
-- R16: 4–7 juli 2026
-- QF:  9–11 juli 2026
-- SF:  14–15 juli 2026
-- Brons: 18 juli 2026
-- Final: 19 juli 2026
-- ============================================================

-- Round of 32
UPDATE matches SET match_date = '2026-06-28 19:00:00+00' WHERE match_number = 73;
UPDATE matches SET match_date = '2026-06-28 22:00:00+00' WHERE match_number = 74;
UPDATE matches SET match_date = '2026-06-29 19:00:00+00' WHERE match_number = 75;
UPDATE matches SET match_date = '2026-06-29 22:00:00+00' WHERE match_number = 76;
UPDATE matches SET match_date = '2026-06-30 19:00:00+00' WHERE match_number = 77;
UPDATE matches SET match_date = '2026-06-30 22:00:00+00' WHERE match_number = 78;
UPDATE matches SET match_date = '2026-07-01 19:00:00+00' WHERE match_number = 79;
UPDATE matches SET match_date = '2026-07-01 22:00:00+00' WHERE match_number = 80;
UPDATE matches SET match_date = '2026-07-02 19:00:00+00' WHERE match_number = 81;
UPDATE matches SET match_date = '2026-07-02 22:00:00+00' WHERE match_number = 82;
UPDATE matches SET match_date = '2026-07-03 01:00:00+00' WHERE match_number = 83;
UPDATE matches SET match_date = '2026-07-03 19:00:00+00' WHERE match_number = 84;
UPDATE matches SET match_date = '2026-07-03 22:00:00+00' WHERE match_number = 85;
UPDATE matches SET match_date = '2026-07-04 01:00:00+00' WHERE match_number = 86;
UPDATE matches SET match_date = '2026-07-04 04:00:00+00' WHERE match_number = 87;
UPDATE matches SET match_date = '2026-07-04 07:00:00+00' WHERE match_number = 88;

-- Round of 16
UPDATE matches SET match_date = '2026-07-04 19:00:00+00' WHERE match_number = 89;
UPDATE matches SET match_date = '2026-07-04 22:00:00+00' WHERE match_number = 90;
UPDATE matches SET match_date = '2026-07-05 19:00:00+00' WHERE match_number = 91;
UPDATE matches SET match_date = '2026-07-05 22:00:00+00' WHERE match_number = 92;
UPDATE matches SET match_date = '2026-07-06 19:00:00+00' WHERE match_number = 93;
UPDATE matches SET match_date = '2026-07-06 22:00:00+00' WHERE match_number = 94;
UPDATE matches SET match_date = '2026-07-07 19:00:00+00' WHERE match_number = 95;
UPDATE matches SET match_date = '2026-07-07 22:00:00+00' WHERE match_number = 96;

-- Kvartsfinaler
UPDATE matches SET match_date = '2026-07-09 20:00:00+00' WHERE match_number = 97;
UPDATE matches SET match_date = '2026-07-10 19:00:00+00' WHERE match_number = 98;
UPDATE matches SET match_date = '2026-07-11 21:00:00+00' WHERE match_number = 99;
UPDATE matches SET match_date = '2026-07-12 01:00:00+00' WHERE match_number = 100;

-- Semifinaler
UPDATE matches SET match_date = '2026-07-14 19:00:00+00' WHERE match_number = 101;
UPDATE matches SET match_date = '2026-07-15 19:00:00+00' WHERE match_number = 102;

-- Bronsmatch
UPDATE matches SET match_date = '2026-07-18 19:00:00+00' WHERE match_number = 103;

-- Final
UPDATE matches SET match_date = '2026-07-19 19:00:00+00' WHERE match_number = 104;
