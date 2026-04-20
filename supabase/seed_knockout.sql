-- ============================================================
-- KallesVMTips2026 – Slutspelsmatcher VM 2026
-- Kör detta i Supabase SQL Editor
-- Datum baserade på FIFA:s preliminära schema
-- Lagnamn är platshållare tills gruppspelet är klart
-- ============================================================

INSERT INTO matches (phase, group_name, match_number, home_team, away_team, match_date) VALUES

-- Round of 32 (Omgång 32) – 16 matcher, 28 juni – 3 juli 2026 (UTC; svensk tid = UTC+2)
('r32', NULL, 73,  'Tvåa Grupp A',     'Tvåa Grupp B',              '2026-06-28 19:00:00+00'),
('r32', NULL, 74,  'Vinnare Grupp E',  'Bästa 3:a (A/B/C/D/F)',     '2026-06-28 22:00:00+00'),
('r32', NULL, 75,  'Vinnare Grupp F',  'Tvåa Grupp C',              '2026-06-29 19:00:00+00'),
('r32', NULL, 76,  'Vinnare Grupp C',  'Tvåa Grupp F',              '2026-06-29 22:00:00+00'),
('r32', NULL, 77,  'Vinnare Grupp I',  'Bästa 3:a (C/D/F/G/H)',     '2026-06-30 19:00:00+00'),
('r32', NULL, 78,  'Tvåa Grupp E',     'Tvåa Grupp I',              '2026-06-30 22:00:00+00'),
('r32', NULL, 79,  'Vinnare Grupp A',  'Bästa 3:a (C/E/F/H/I)',     '2026-07-01 19:00:00+00'),
('r32', NULL, 80,  'Vinnare Grupp L',  'Bästa 3:a (E/H/I/J/K)',     '2026-07-01 22:00:00+00'),
('r32', NULL, 81,  'Vinnare Grupp D',  'Bästa 3:a (B/E/F/I/J)',     '2026-07-02 19:00:00+00'),
('r32', NULL, 82,  'Vinnare Grupp G',  'Bästa 3:a (A/E/H/I/J)',     '2026-07-02 22:00:00+00'),
('r32', NULL, 83,  'Tvåa Grupp K',     'Tvåa Grupp L',              '2026-07-03 01:00:00+00'),
('r32', NULL, 84,  'Vinnare Grupp H',  'Tvåa Grupp J',              '2026-07-03 19:00:00+00'),
('r32', NULL, 85,  'Vinnare Grupp B',  'Bästa 3:a (E/F/G/I/J)',     '2026-07-03 22:00:00+00'),
('r32', NULL, 86,  'Vinnare Grupp J',  'Tvåa Grupp H',              '2026-07-04 01:00:00+00'),
('r32', NULL, 87,  'Vinnare Grupp K',  'Bästa 3:a (D/E/I/J/L)',     '2026-07-04 04:00:00+00'),
('r32', NULL, 88,  'Tvåa Grupp D',     'Tvåa Grupp G',              '2026-07-04 07:00:00+00'),

-- Round of 16 (Omgång 16) – 8 matcher, 4–7 juli 2026
-- R16 M89 = Vinnare M74 vs Vinnare M77
-- R16 M90 = Vinnare M73 vs Vinnare M75
-- R16 M91 = Vinnare M83 vs Vinnare M84
-- R16 M92 = Vinnare M81 vs Vinnare M82
-- R16 M93 = Vinnare M76 vs Vinnare M78
-- R16 M94 = Vinnare M79 vs Vinnare M80
-- R16 M95 = Vinnare M86 vs Vinnare M88
-- R16 M96 = Vinnare M85 vs Vinnare M87
('r16', NULL, 89,  'Vinnare M74',  'Vinnare M77',  '2026-07-04 19:00:00+00'),
('r16', NULL, 90,  'Vinnare M73',  'Vinnare M75',  '2026-07-04 22:00:00+00'),
('r16', NULL, 91,  'Vinnare M83',  'Vinnare M84',  '2026-07-05 19:00:00+00'),
('r16', NULL, 92,  'Vinnare M81',  'Vinnare M82',  '2026-07-05 22:00:00+00'),
('r16', NULL, 93,  'Vinnare M76',  'Vinnare M78',  '2026-07-06 19:00:00+00'),
('r16', NULL, 94,  'Vinnare M79',  'Vinnare M80',  '2026-07-06 22:00:00+00'),
('r16', NULL, 95,  'Vinnare M86',  'Vinnare M88',  '2026-07-07 19:00:00+00'),
('r16', NULL, 96,  'Vinnare M85',  'Vinnare M87',  '2026-07-07 22:00:00+00'),

-- Kvartsfinaler (QF) – 4 matcher, 9–11 juli 2026
('qf', NULL, 97,  'Vinnare M89',  'Vinnare M90',  '2026-07-09 20:00:00+00'),
('qf', NULL, 98,  'Vinnare M91',  'Vinnare M92',  '2026-07-10 19:00:00+00'),
('qf', NULL, 99,  'Vinnare M93',  'Vinnare M94',  '2026-07-11 21:00:00+00'),
('qf', NULL, 100, 'Vinnare M95',  'Vinnare M96',  '2026-07-12 01:00:00+00'),

-- Semifinaler (SF) – 2 matcher, 14–15 juli 2026
('sf', NULL, 101, 'Vinnare M97',   'Vinnare M98',   '2026-07-14 19:00:00+00'),
('sf', NULL, 102, 'Vinnare M99',   'Vinnare M100',  '2026-07-15 19:00:00+00'),

-- Bronsmatch – 1 match, 18 juli 2026
('bronze', NULL, 103, 'Förlorare M101', 'Förlorare M102', '2026-07-18 19:00:00+00'),

-- Final – 1 match, 19 juli 2026
('final', NULL, 104, 'Vinnare M101',  'Vinnare M102',   '2026-07-19 19:00:00+00');
