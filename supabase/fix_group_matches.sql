-- ============================================================
-- Korrigerade gruppspelsmatcher – VM 2026
-- Källa: worldcupwiki.com (officiellt schema)
-- Alla tider lagras i UTC (Sverige = UTC+2 / CEST under sommaren)
-- ET-tider från källa omräknade: UTC = ET + 4h
-- ============================================================

-- Radera befintliga gruppspelsmatcher (predictions raderas automatiskt via CASCADE)
DELETE FROM matches WHERE phase = 'group';

INSERT INTO matches (phase, group_name, match_number, home_team, away_team, match_date) VALUES

-- ── GRUPP A: Mexico, South Africa, South Korea, Czechia ──────────────
-- Omgång 1
('group','A',1,  'Mexico',       'South Africa', '2026-06-11 19:00+00'), -- 21:00 CEST
('group','A',2,  'South Korea',  'Czechia',      '2026-06-12 02:00+00'), -- 04:00 CEST (natt)
-- Omgång 2
('group','A',25, 'Czechia',      'South Africa', '2026-06-18 16:00+00'), -- 18:00 CEST
('group','A',28, 'Mexico',       'South Korea',  '2026-06-19 01:00+00'), -- 03:00 CEST (natt)
-- Omgång 3 (simultana)
('group','A',53, 'Czechia',      'Mexico',       '2026-06-25 01:00+00'), -- 03:00 CEST (natt)
('group','A',54, 'South Africa', 'South Korea',  '2026-06-25 01:00+00'), -- 03:00 CEST (natt)

-- ── GRUPP B: Canada, Bosnia & Herzegovina, Qatar, Switzerland ─────────
('group','B',3,  'Canada',               'Bosnia & Herzegovina', '2026-06-12 19:00+00'), -- 21:00 CEST
('group','B',6,  'Qatar',                'Switzerland',          '2026-06-13 19:00+00'), -- 21:00 CEST
('group','B',26, 'Switzerland',          'Bosnia & Herzegovina', '2026-06-18 19:00+00'), -- 21:00 CEST
('group','B',27, 'Canada',               'Qatar',                '2026-06-18 22:00+00'), -- 00:00 CEST (natt)
('group','B',49, 'Switzerland',          'Canada',               '2026-06-24 19:00+00'), -- 21:00 CEST
('group','B',50, 'Bosnia & Herzegovina', 'Qatar',                '2026-06-24 19:00+00'), -- 21:00 CEST

-- ── GRUPP C: Brazil, Morocco, Haiti, Scotland ────────────────────────
('group','C',7,  'Brazil',   'Morocco',  '2026-06-13 22:00+00'), -- 00:00 CEST (natt)
('group','C',8,  'Haiti',    'Scotland', '2026-06-14 01:00+00'), -- 03:00 CEST (natt)
('group','C',31, 'Scotland', 'Morocco',  '2026-06-19 22:00+00'), -- 00:00 CEST (natt)
('group','C',32, 'Brazil',   'Haiti',    '2026-06-20 01:00+00'), -- 03:00 CEST (natt)
('group','C',51, 'Scotland', 'Brazil',   '2026-06-24 22:00+00'), -- 00:00 CEST (natt)
('group','C',52, 'Morocco',  'Haiti',    '2026-06-24 22:00+00'), -- 00:00 CEST (natt)

-- ── GRUPP D: USA, Paraguay, Australia, Türkiye ───────────────────────
('group','D',4,  'USA',       'Paraguay',  '2026-06-13 01:00+00'), -- 03:00 CEST (natt)
('group','D',5,  'Australia', 'Türkiye',   '2026-06-13 04:00+00'), -- 06:00 CEST
('group','D',30, 'USA',       'Australia', '2026-06-19 19:00+00'), -- 21:00 CEST
('group','D',29, 'Türkiye',   'Paraguay',  '2026-06-19 04:00+00'), -- 06:00 CEST
('group','D',59, 'Türkiye',   'USA',       '2026-06-26 02:00+00'), -- 04:00 CEST (natt)
('group','D',60, 'Paraguay',  'Australia', '2026-06-26 02:00+00'), -- 04:00 CEST (natt)

-- ── GRUPP E: Germany, Curaçao, Ivory Coast, Ecuador ─────────────────
('group','E',9,  'Germany',     'Curaçao',     '2026-06-14 17:00+00'), -- 19:00 CEST
('group','E',11, 'Ivory Coast', 'Ecuador',     '2026-06-14 23:00+00'), -- 01:00 CEST (natt)
('group','E',35, 'Germany',     'Ivory Coast', '2026-06-20 20:00+00'), -- 22:00 CEST
('group','E',36, 'Ecuador',     'Curaçao',     '2026-06-21 00:00+00'), -- 02:00 CEST (natt)
('group','E',55, 'Curaçao',     'Ivory Coast', '2026-06-25 20:00+00'), -- 22:00 CEST
('group','E',56, 'Ecuador',     'Germany',     '2026-06-25 20:00+00'), -- 22:00 CEST

-- ── GRUPP F: Netherlands, Japan, Sweden, Tunisia ─────────────────────
('group','F',10, 'Netherlands', 'Japan',       '2026-06-14 20:00+00'), -- 22:00 CEST
('group','F',12, 'Sweden',      'Tunisia',     '2026-06-15 02:00+00'), -- 04:00 CEST (natt)
('group','F',34, 'Netherlands', 'Sweden',      '2026-06-20 17:00+00'), -- 19:00 CEST
('group','F',33, 'Tunisia',     'Japan',       '2026-06-20 04:00+00'), -- 06:00 CEST
('group','F',57, 'Japan',       'Sweden',      '2026-06-25 23:00+00'), -- 01:00 CEST (natt)
('group','F',58, 'Tunisia',     'Netherlands', '2026-06-25 23:00+00'), -- 01:00 CEST (natt)

-- ── GRUPP G: Belgium, Egypt, Iran, New Zealand ───────────────────────
('group','G',14, 'Belgium',     'Egypt',       '2026-06-15 19:00+00'), -- 21:00 CEST
('group','G',16, 'Iran',        'New Zealand', '2026-06-16 01:00+00'), -- 03:00 CEST (natt)
('group','G',38, 'Belgium',     'Iran',        '2026-06-21 19:00+00'), -- 21:00 CEST
('group','G',40, 'New Zealand', 'Egypt',       '2026-06-22 01:00+00'), -- 03:00 CEST (natt)
('group','G',65, 'Egypt',       'Iran',        '2026-06-27 03:00+00'), -- 05:00 CEST (natt)
('group','G',66, 'New Zealand', 'Belgium',     '2026-06-27 03:00+00'), -- 05:00 CEST (natt)

-- ── GRUPP H: Spain, Cape Verde, Saudi Arabia, Uruguay ────────────────
('group','H',13, 'Spain',         'Cape Verde',   '2026-06-15 16:00+00'), -- 18:00 CEST
('group','H',15, 'Saudi Arabia',  'Uruguay',      '2026-06-15 22:00+00'), -- 00:00 CEST (natt)
('group','H',37, 'Spain',         'Saudi Arabia', '2026-06-21 16:00+00'), -- 18:00 CEST
('group','H',39, 'Uruguay',       'Cape Verde',   '2026-06-21 22:00+00'), -- 00:00 CEST (natt)
('group','H',63, 'Cape Verde',    'Saudi Arabia', '2026-06-27 00:00+00'), -- 02:00 CEST (natt)
('group','H',64, 'Uruguay',       'Spain',        '2026-06-27 00:00+00'), -- 02:00 CEST (natt)

-- ── GRUPP I: France, Senegal, Iraq, Norway ───────────────────────────
('group','I',17, 'France',  'Senegal', '2026-06-16 19:00+00'), -- 21:00 CEST
('group','I',18, 'Iraq',    'Norway',  '2026-06-16 22:00+00'), -- 00:00 CEST (natt)
('group','I',42, 'France',  'Iraq',    '2026-06-22 21:00+00'), -- 23:00 CEST
('group','I',43, 'Norway',  'Senegal', '2026-06-23 00:00+00'), -- 02:00 CEST (natt)
('group','I',61, 'Norway',  'France',  '2026-06-26 19:00+00'), -- 21:00 CEST
('group','I',62, 'Senegal', 'Iraq',    '2026-06-26 19:00+00'), -- 21:00 CEST

-- ── GRUPP J: Argentina, Algeria, Austria, Jordan ─────────────────────
('group','J',20, 'Austria',   'Jordan',   '2026-06-16 04:00+00'), -- 06:00 CEST
('group','J',19, 'Argentina', 'Algeria',  '2026-06-17 01:00+00'), -- 03:00 CEST (natt)
('group','J',41, 'Argentina', 'Austria',  '2026-06-22 17:00+00'), -- 19:00 CEST
('group','J',44, 'Jordan',    'Algeria',  '2026-06-23 03:00+00'), -- 05:00 CEST (natt)
('group','J',71, 'Algeria',   'Austria',  '2026-06-28 02:00+00'), -- 04:00 CEST (natt)
('group','J',72, 'Jordan',    'Argentina','2026-06-28 02:00+00'), -- 04:00 CEST (natt)

-- ── GRUPP K: Portugal, DR Congo, Uzbekistan, Colombia ────────────────
('group','K',21, 'Portugal',   'DR Congo',   '2026-06-17 17:00+00'), -- 19:00 CEST
('group','K',24, 'Uzbekistan', 'Colombia',   '2026-06-18 02:00+00'), -- 04:00 CEST (natt)
('group','K',45, 'Portugal',   'Uzbekistan', '2026-06-23 17:00+00'), -- 19:00 CEST
('group','K',48, 'Colombia',   'DR Congo',   '2026-06-24 02:00+00'), -- 04:00 CEST (natt)
('group','K',69, 'Colombia',   'Portugal',   '2026-06-27 23:30+00'), -- 01:30 CEST (natt)
('group','K',70, 'DR Congo',   'Uzbekistan', '2026-06-27 23:30+00'), -- 01:30 CEST (natt)

-- ── GRUPP L: England, Croatia, Ghana, Panama ─────────────────────────
('group','L',22, 'England', 'Croatia',  '2026-06-17 20:00+00'), -- 22:00 CEST
('group','L',23, 'Ghana',   'Panama',   '2026-06-17 23:00+00'), -- 01:00 CEST (natt)
('group','L',46, 'England', 'Ghana',    '2026-06-23 20:00+00'), -- 22:00 CEST
('group','L',47, 'Panama',  'Croatia',  '2026-06-23 23:00+00'), -- 01:00 CEST (natt)
('group','L',67, 'Panama',  'England',  '2026-06-27 21:00+00'), -- 23:00 CEST
('group','L',68, 'Croatia', 'Ghana',    '2026-06-27 21:00+00'); -- 23:00 CEST
