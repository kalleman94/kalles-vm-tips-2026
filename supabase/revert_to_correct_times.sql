-- ============================================================
-- KallesVMTips2026 – REVERT till korrekta tider
-- Källa: fotbollskanalen.se (SVT/TV4 officiellt schema)
--
-- Återställer alla tider till ursprungsdatabasens korrekta värden.
-- Min tidigare fix_match_times.sql (baserad på soccergraph.com) var FEL.
-- Ursprungsdatabasen hade rätt CEST-tider lagrade som UTC (UTC = CEST - 2h).
--
-- ENDA RIKTIGA FELEN i originalet var:
--   1. Türkiye–Paraguay: datum var 19 juni → ska vara 20 juni
--   2. Tunisien–Japan:   datum var 20 juni → ska vara 21 juni
-- ============================================================

-- ── GRUPP A ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-11 19:00:00+00' WHERE home_team = 'Mexico'       AND away_team = 'South Africa';  -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-12 02:00:00+00' WHERE home_team = 'South Korea'  AND away_team = 'Czechia';        -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-18 16:00:00+00' WHERE home_team = 'Czechia'      AND away_team = 'South Africa';  -- 18:00 CEST
UPDATE matches SET match_date = '2026-06-19 01:00:00+00' WHERE home_team = 'Mexico'       AND away_team = 'South Korea';   -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-25 01:00:00+00' WHERE home_team = 'Czechia'      AND away_team = 'Mexico';        -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-25 01:00:00+00' WHERE home_team = 'South Africa' AND away_team = 'South Korea';  -- 03:00 CEST

-- ── GRUPP B ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-12 19:00:00+00' WHERE home_team = 'Canada'               AND away_team = 'Bosnia & Herzegovina'; -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-13 19:00:00+00' WHERE home_team = 'Qatar'                AND away_team = 'Switzerland';          -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-18 19:00:00+00' WHERE home_team = 'Switzerland'          AND away_team = 'Bosnia & Herzegovina'; -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-18 22:00:00+00' WHERE home_team = 'Canada'               AND away_team = 'Qatar';                -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-24 19:00:00+00' WHERE home_team = 'Switzerland'          AND away_team = 'Canada';               -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-24 19:00:00+00' WHERE home_team = 'Bosnia & Herzegovina' AND away_team = 'Qatar';                -- 21:00 CEST

-- ── GRUPP C ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-13 22:00:00+00' WHERE home_team = 'Brazil'   AND away_team = 'Morocco';   -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-14 01:00:00+00' WHERE home_team = 'Haiti'    AND away_team = 'Scotland';  -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-19 22:00:00+00' WHERE home_team = 'Scotland' AND away_team = 'Morocco';   -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-20 01:00:00+00' WHERE home_team = 'Brazil'   AND away_team = 'Haiti';     -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-24 22:00:00+00' WHERE home_team = 'Scotland' AND away_team = 'Brazil';    -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-24 22:00:00+00' WHERE home_team = 'Morocco'  AND away_team = 'Haiti';     -- 00:00 CEST

-- ── GRUPP D ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-13 01:00:00+00' WHERE home_team = 'USA'       AND away_team = 'Paraguay';  -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-13 04:00:00+00' WHERE home_team = 'Australia' AND away_team = 'Türkiye';   -- 06:00 CEST
UPDATE matches SET match_date = '2026-06-19 19:00:00+00' WHERE home_team = 'USA'       AND away_team = 'Australia'; -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-26 02:00:00+00' WHERE home_team = 'Türkiye'   AND away_team = 'USA';       -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-26 02:00:00+00' WHERE home_team = 'Paraguay'  AND away_team = 'Australia'; -- 04:00 CEST
-- *** FIX: Türkiye–Paraguay datum korrigerat 19 jun → 20 jun ***
UPDATE matches SET match_date = '2026-06-20 04:00:00+00' WHERE home_team = 'Türkiye'   AND away_team = 'Paraguay';  -- 06:00 CEST 20 jun

-- ── GRUPP E ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-14 17:00:00+00' WHERE home_team = 'Germany'     AND away_team = 'Curaçao';      -- 19:00 CEST
UPDATE matches SET match_date = '2026-06-14 23:00:00+00' WHERE home_team = 'Ivory Coast' AND away_team = 'Ecuador';      -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-20 20:00:00+00' WHERE home_team = 'Germany'     AND away_team = 'Ivory Coast';  -- 22:00 CEST
UPDATE matches SET match_date = '2026-06-21 00:00:00+00' WHERE home_team = 'Ecuador'     AND away_team = 'Curaçao';      -- 02:00 CEST
UPDATE matches SET match_date = '2026-06-25 20:00:00+00' WHERE home_team = 'Ecuador'     AND away_team = 'Germany';      -- 22:00 CEST
UPDATE matches SET match_date = '2026-06-25 20:00:00+00' WHERE home_team = 'Curaçao'     AND away_team = 'Ivory Coast';  -- 22:00 CEST

-- ── GRUPP F ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-14 20:00:00+00' WHERE home_team = 'Netherlands' AND away_team = 'Japan';        -- 22:00 CEST
UPDATE matches SET match_date = '2026-06-15 02:00:00+00' WHERE home_team = 'Sweden'      AND away_team = 'Tunisia';      -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-20 17:00:00+00' WHERE home_team = 'Netherlands' AND away_team = 'Sweden';       -- 19:00 CEST
UPDATE matches SET match_date = '2026-06-25 23:00:00+00' WHERE home_team = 'Japan'       AND away_team = 'Sweden';       -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-25 23:00:00+00' WHERE home_team = 'Tunisia'     AND away_team = 'Netherlands';  -- 01:00 CEST
-- *** FIX: Tunisien–Japan datum korrigerat 20 jun → 21 jun ***
UPDATE matches SET match_date = '2026-06-21 04:00:00+00' WHERE home_team = 'Tunisia'     AND away_team = 'Japan';        -- 06:00 CEST 21 jun

-- ── GRUPP G ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-15 19:00:00+00' WHERE home_team = 'Belgium'     AND away_team = 'Egypt';        -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-16 01:00:00+00' WHERE home_team = 'Iran'        AND away_team = 'New Zealand';  -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-21 19:00:00+00' WHERE home_team = 'Belgium'     AND away_team = 'Iran';         -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-22 01:00:00+00' WHERE home_team = 'New Zealand' AND away_team = 'Egypt';        -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-27 03:00:00+00' WHERE home_team = 'Egypt'       AND away_team = 'Iran';         -- 05:00 CEST
UPDATE matches SET match_date = '2026-06-27 03:00:00+00' WHERE home_team = 'New Zealand' AND away_team = 'Belgium';      -- 05:00 CEST

-- ── GRUPP H ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-15 16:00:00+00' WHERE home_team = 'Spain'        AND away_team = 'Cape Verde';    -- 18:00 CEST
UPDATE matches SET match_date = '2026-06-15 22:00:00+00' WHERE home_team = 'Saudi Arabia' AND away_team = 'Uruguay';       -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-21 16:00:00+00' WHERE home_team = 'Spain'        AND away_team = 'Saudi Arabia';  -- 18:00 CEST
UPDATE matches SET match_date = '2026-06-21 22:00:00+00' WHERE home_team = 'Uruguay'      AND away_team = 'Cape Verde';    -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-27 00:00:00+00' WHERE home_team = 'Cape Verde'   AND away_team = 'Saudi Arabia';  -- 02:00 CEST
UPDATE matches SET match_date = '2026-06-27 00:00:00+00' WHERE home_team = 'Uruguay'      AND away_team = 'Spain';         -- 02:00 CEST

-- ── GRUPP I ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-16 19:00:00+00' WHERE home_team = 'France'  AND away_team = 'Senegal'; -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-16 22:00:00+00' WHERE home_team = 'Iraq'    AND away_team = 'Norway';  -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-22 21:00:00+00' WHERE home_team = 'France'  AND away_team = 'Iraq';    -- 23:00 CEST
UPDATE matches SET match_date = '2026-06-23 00:00:00+00' WHERE home_team = 'Norway'  AND away_team = 'Senegal'; -- 02:00 CEST
UPDATE matches SET match_date = '2026-06-26 19:00:00+00' WHERE home_team = 'Norway'  AND away_team = 'France';  -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-26 19:00:00+00' WHERE home_team = 'Senegal' AND away_team = 'Iraq';    -- 21:00 CEST

-- ── GRUPP J ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-16 04:00:00+00' WHERE home_team = 'Austria'   AND away_team = 'Jordan';    -- 06:00 CEST
UPDATE matches SET match_date = '2026-06-17 01:00:00+00' WHERE home_team = 'Argentina' AND away_team = 'Algeria';   -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-22 17:00:00+00' WHERE home_team = 'Argentina' AND away_team = 'Austria';   -- 19:00 CEST
UPDATE matches SET match_date = '2026-06-23 03:00:00+00' WHERE home_team = 'Jordan'    AND away_team = 'Algeria';   -- 05:00 CEST
UPDATE matches SET match_date = '2026-06-28 02:00:00+00' WHERE home_team = 'Algeria'   AND away_team = 'Austria';   -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-28 02:00:00+00' WHERE home_team = 'Jordan'    AND away_team = 'Argentina'; -- 04:00 CEST

-- ── GRUPP K ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-17 17:00:00+00' WHERE home_team = 'Portugal'   AND away_team = 'DR Congo';    -- 19:00 CEST
UPDATE matches SET match_date = '2026-06-18 02:00:00+00' WHERE home_team = 'Uzbekistan' AND away_team = 'Colombia';    -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-23 17:00:00+00' WHERE home_team = 'Portugal'   AND away_team = 'Uzbekistan';  -- 19:00 CEST
UPDATE matches SET match_date = '2026-06-24 02:00:00+00' WHERE home_team = 'Colombia'   AND away_team = 'DR Congo';    -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-27 23:30:00+00' WHERE home_team = 'Colombia'   AND away_team = 'Portugal';    -- 01:30 CEST
UPDATE matches SET match_date = '2026-06-27 23:30:00+00' WHERE home_team = 'DR Congo'   AND away_team = 'Uzbekistan';  -- 01:30 CEST

-- ── GRUPP L ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-17 20:00:00+00' WHERE home_team = 'England' AND away_team = 'Croatia';  -- 22:00 CEST
UPDATE matches SET match_date = '2026-06-17 23:00:00+00' WHERE home_team = 'Ghana'   AND away_team = 'Panama';   -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-23 20:00:00+00' WHERE home_team = 'England' AND away_team = 'Ghana';    -- 22:00 CEST
UPDATE matches SET match_date = '2026-06-23 23:00:00+00' WHERE home_team = 'Panama'  AND away_team = 'Croatia';  -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-27 21:00:00+00' WHERE home_team = 'Panama'  AND away_team = 'England';  -- 23:00 CEST
UPDATE matches SET match_date = '2026-06-27 21:00:00+00' WHERE home_team = 'Croatia' AND away_team = 'Ghana';    -- 23:00 CEST
