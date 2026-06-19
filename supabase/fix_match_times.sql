-- ============================================================
-- KallesVMTips2026 – Korrekta UTC-tider för alla gruppspelsmatcher
-- Källa: soccergraph.com + Google live data
-- Alla tider i UTC (Sverige CEST = UTC+2)
-- ============================================================

-- ── GRUPP A ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-11 21:00:00+00' WHERE home_team = 'Mexico'       AND away_team = 'South Africa';  -- 23:00 CEST
UPDATE matches SET match_date = '2026-06-12 04:00:00+00' WHERE home_team = 'South Korea'  AND away_team = 'Czechia';        -- 06:00 CEST
UPDATE matches SET match_date = '2026-06-18 17:00:00+00' WHERE home_team = 'Czechia'      AND away_team = 'South Africa';  -- 19:00 CEST
UPDATE matches SET match_date = '2026-06-19 03:00:00+00' WHERE home_team = 'Mexico'       AND away_team = 'South Korea';   -- 05:00 CEST
UPDATE matches SET match_date = '2026-06-25 03:00:00+00' WHERE home_team = 'Czechia'      AND away_team = 'Mexico';        -- 05:00 CEST
UPDATE matches SET match_date = '2026-06-25 03:00:00+00' WHERE home_team = 'South Africa' AND away_team = 'South Korea';  -- 05:00 CEST

-- ── GRUPP B ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-12 20:00:00+00' WHERE home_team = 'Canada'               AND away_team = 'Bosnia & Herzegovina'; -- 22:00 CEST
UPDATE matches SET match_date = '2026-06-13 23:00:00+00' WHERE home_team = 'Qatar'                AND away_team = 'Switzerland';          -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-18 23:00:00+00' WHERE home_team = 'Switzerland'          AND away_team = 'Bosnia & Herzegovina'; -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-19 02:00:00+00' WHERE home_team = 'Canada'               AND away_team = 'Qatar';                -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-24 23:00:00+00' WHERE home_team = 'Switzerland'          AND away_team = 'Canada';               -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-24 23:00:00+00' WHERE home_team = 'Bosnia & Herzegovina' AND away_team = 'Qatar';                -- 01:00 CEST

-- ── GRUPP C ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-13 23:00:00+00' WHERE home_team = 'Brazil'   AND away_team = 'Morocco';   -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-14 02:00:00+00' WHERE home_team = 'Haiti'    AND away_team = 'Scotland';  -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-19 23:00:00+00' WHERE home_team = 'Scotland' AND away_team = 'Morocco';   -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-20 02:00:00+00' WHERE home_team = 'Brazil'   AND away_team = 'Haiti';     -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-24 23:00:00+00' WHERE home_team = 'Scotland' AND away_team = 'Brazil';    -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-24 23:00:00+00' WHERE home_team = 'Morocco'  AND away_team = 'Haiti';     -- 01:00 CEST

-- ── GRUPP D ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-13 05:00:00+00' WHERE home_team = 'USA'       AND away_team = 'Paraguay';  -- 07:00 CEST
UPDATE matches SET match_date = '2026-06-13 08:00:00+00' WHERE home_team = 'Australia' AND away_team = 'Türkiye';   -- 10:00 CEST (morgon, sydostasiatisk sändningstid)
UPDATE matches SET match_date = '2026-06-20 03:00:00+00' WHERE home_team = 'Türkiye'   AND away_team = 'Paraguay';  -- 05:00 CEST (Google live: 20 jun)
UPDATE matches SET match_date = '2026-06-19 23:00:00+00' WHERE home_team = 'USA'       AND away_team = 'Australia'; -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-26 06:00:00+00' WHERE home_team = 'Türkiye'   AND away_team = 'USA';       -- 08:00 CEST
UPDATE matches SET match_date = '2026-06-26 06:00:00+00' WHERE home_team = 'Paraguay'  AND away_team = 'Australia'; -- 08:00 CEST

-- ── GRUPP E ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-14 19:00:00+00' WHERE home_team = 'Germany'     AND away_team = 'Curaçao';      -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-15 00:00:00+00' WHERE home_team = 'Ivory Coast' AND away_team = 'Ecuador';      -- 02:00 CEST
UPDATE matches SET match_date = '2026-06-20 21:00:00+00' WHERE home_team = 'Germany'     AND away_team = 'Ivory Coast';  -- 23:00 CEST
UPDATE matches SET match_date = '2026-06-21 04:00:00+00' WHERE home_team = 'Ecuador'     AND away_team = 'Curaçao';      -- 06:00 CEST
UPDATE matches SET match_date = '2026-06-25 21:00:00+00' WHERE home_team = 'Ecuador'     AND away_team = 'Germany';      -- 23:00 CEST
UPDATE matches SET match_date = '2026-06-25 21:00:00+00' WHERE home_team = 'Curaçao'     AND away_team = 'Ivory Coast';  -- 23:00 CEST

-- ── GRUPP F ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-14 22:00:00+00' WHERE home_team = 'Netherlands' AND away_team = 'Japan';        -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-15 04:00:00+00' WHERE home_team = 'Sweden'      AND away_team = 'Tunisia';      -- 06:00 CEST
UPDATE matches SET match_date = '2026-06-20 19:00:00+00' WHERE home_team = 'Netherlands' AND away_team = 'Sweden';       -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-20 06:00:00+00' WHERE home_team = 'Tunisia'     AND away_team = 'Japan';        -- 08:00 CEST (morgon)
UPDATE matches SET match_date = '2026-06-26 01:00:00+00' WHERE home_team = 'Japan'       AND away_team = 'Sweden';       -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-26 01:00:00+00' WHERE home_team = 'Tunisia'     AND away_team = 'Netherlands';  -- 03:00 CEST

-- ── GRUPP G ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-15 23:00:00+00' WHERE home_team = 'Belgium'     AND away_team = 'Egypt';        -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-16 05:00:00+00' WHERE home_team = 'Iran'        AND away_team = 'New Zealand';  -- 07:00 CEST
UPDATE matches SET match_date = '2026-06-21 23:00:00+00' WHERE home_team = 'Belgium'     AND away_team = 'Iran';         -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-22 05:00:00+00' WHERE home_team = 'New Zealand' AND away_team = 'Egypt';        -- 07:00 CEST
UPDATE matches SET match_date = '2026-06-27 07:00:00+00' WHERE home_team = 'Egypt'       AND away_team = 'Iran';         -- 09:00 CEST
UPDATE matches SET match_date = '2026-06-27 07:00:00+00' WHERE home_team = 'New Zealand' AND away_team = 'Belgium';      -- 09:00 CEST

-- ── GRUPP H ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-15 17:00:00+00' WHERE home_team = 'Spain'        AND away_team = 'Cape Verde';    -- 19:00 CEST
UPDATE matches SET match_date = '2026-06-15 23:00:00+00' WHERE home_team = 'Saudi Arabia' AND away_team = 'Uruguay';       -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-21 17:00:00+00' WHERE home_team = 'Spain'        AND away_team = 'Saudi Arabia';  -- 19:00 CEST
UPDATE matches SET match_date = '2026-06-21 23:00:00+00' WHERE home_team = 'Uruguay'      AND away_team = 'Cape Verde';    -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-27 02:00:00+00' WHERE home_team = 'Cape Verde'   AND away_team = 'Saudi Arabia';  -- 04:00 CEST
UPDATE matches SET match_date = '2026-06-27 02:00:00+00' WHERE home_team = 'Uruguay'      AND away_team = 'Spain';         -- 04:00 CEST

-- ── GRUPP I ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-16 20:00:00+00' WHERE home_team = 'France'  AND away_team = 'Senegal'; -- 22:00 CEST
UPDATE matches SET match_date = '2026-06-16 23:00:00+00' WHERE home_team = 'Iraq'    AND away_team = 'Norway';  -- 01:00 CEST
UPDATE matches SET match_date = '2026-06-22 22:00:00+00' WHERE home_team = 'France'  AND away_team = 'Iraq';    -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-23 01:00:00+00' WHERE home_team = 'Norway'  AND away_team = 'Senegal'; -- 03:00 CEST
UPDATE matches SET match_date = '2026-06-26 20:00:00+00' WHERE home_team = 'Norway'  AND away_team = 'France';  -- 22:00 CEST
UPDATE matches SET match_date = '2026-06-26 20:00:00+00' WHERE home_team = 'Senegal' AND away_team = 'Iraq';    -- 22:00 CEST

-- ── GRUPP J ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-16 08:00:00+00' WHERE home_team = 'Austria'   AND away_team = 'Jordan';   -- 10:00 CEST (morgon)
UPDATE matches SET match_date = '2026-06-17 03:00:00+00' WHERE home_team = 'Argentina' AND away_team = 'Algeria';  -- 05:00 CEST
UPDATE matches SET match_date = '2026-06-22 19:00:00+00' WHERE home_team = 'Argentina' AND away_team = 'Austria';  -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-23 07:00:00+00' WHERE home_team = 'Jordan'    AND away_team = 'Algeria';  -- 09:00 CEST
UPDATE matches SET match_date = '2026-06-28 04:00:00+00' WHERE home_team = 'Algeria'   AND away_team = 'Austria';  -- 06:00 CEST
UPDATE matches SET match_date = '2026-06-28 04:00:00+00' WHERE home_team = 'Jordan'    AND away_team = 'Argentina'; -- 06:00 CEST

-- ── GRUPP K ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-17 19:00:00+00' WHERE home_team = 'Portugal'   AND away_team = 'DR Congo';    -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-18 04:00:00+00' WHERE home_team = 'Uzbekistan' AND away_team = 'Colombia';    -- 06:00 CEST
UPDATE matches SET match_date = '2026-06-23 19:00:00+00' WHERE home_team = 'Portugal'   AND away_team = 'Uzbekistan';  -- 21:00 CEST
UPDATE matches SET match_date = '2026-06-24 04:00:00+00' WHERE home_team = 'Colombia'   AND away_team = 'DR Congo';    -- 06:00 CEST
UPDATE matches SET match_date = '2026-06-28 02:30:00+00' WHERE home_team = 'Colombia'   AND away_team = 'Portugal';    -- 04:30 CEST
UPDATE matches SET match_date = '2026-06-28 02:30:00+00' WHERE home_team = 'DR Congo'   AND away_team = 'Uzbekistan';  -- 04:30 CEST

-- ── GRUPP L ──────────────────────────────────────────────────
UPDATE matches SET match_date = '2026-06-17 22:00:00+00' WHERE home_team = 'England' AND away_team = 'Croatia';  -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-18 00:00:00+00' WHERE home_team = 'Ghana'   AND away_team = 'Panama';   -- 02:00 CEST
UPDATE matches SET match_date = '2026-06-23 21:00:00+00' WHERE home_team = 'England' AND away_team = 'Ghana';    -- 23:00 CEST
UPDATE matches SET match_date = '2026-06-24 00:00:00+00' WHERE home_team = 'Panama'  AND away_team = 'Croatia';  -- 02:00 CEST
UPDATE matches SET match_date = '2026-06-27 22:00:00+00' WHERE home_team = 'Panama'  AND away_team = 'England';  -- 00:00 CEST
UPDATE matches SET match_date = '2026-06-27 22:00:00+00' WHERE home_team = 'Croatia' AND away_team = 'Ghana';    -- 00:00 CEST

-- ============================================================
-- OBS: Slutspelsmatcher (match_number 73-104) behöver verifieras
-- separat mot FIFA:s officiella schema då källorna är osäkra.
-- Kör fix_knockout_dates.sql som referens men verifiera tiderna!
-- ============================================================
