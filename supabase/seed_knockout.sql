-- ============================================================
-- KallesVMTips2026 – Slutspelsmatcher VM 2026
-- Kör detta i Supabase SQL Editor
-- Datum baserade på FIFA:s preliminära schema
-- Lagnamn är platshållare tills gruppspelet är klart
-- ============================================================

INSERT INTO matches (phase, group_name, match_number, home_team, away_team, match_date) VALUES

-- Round of 32 (Omgång 32) – 16 matcher, ~4–7 juli 2026
('r32', NULL, 73,  'Vinnare Grupp A',  'Bästa 3:a (1)',  '2026-07-04 18:00:00+00'),
('r32', NULL, 74,  'Vinnare Grupp C',  'Bästa 3:a (2)',  '2026-07-04 21:00:00+00'),
('r32', NULL, 75,  'Vinnare Grupp E',  'Bästa 3:a (3)',  '2026-07-05 18:00:00+00'),
('r32', NULL, 76,  'Vinnare Grupp G',  'Bästa 3:a (4)',  '2026-07-05 21:00:00+00'),
('r32', NULL, 77,  'Vinnare Grupp I',  'Bästa 3:a (5)',  '2026-07-06 18:00:00+00'),
('r32', NULL, 78,  'Vinnare Grupp K',  'Bästa 3:a (6)',  '2026-07-06 21:00:00+00'),
('r32', NULL, 79,  'Vinnare Grupp B',  'Bästa 3:a (7)',  '2026-07-07 18:00:00+00'),
('r32', NULL, 80,  'Vinnare Grupp D',  'Bästa 3:a (8)',  '2026-07-07 21:00:00+00'),
('r32', NULL, 81,  'Tvåa Grupp A',     'Tvåa Grupp B',   '2026-07-04 15:00:00+00'),
('r32', NULL, 82,  'Tvåa Grupp C',     'Tvåa Grupp D',   '2026-07-05 15:00:00+00'),
('r32', NULL, 83,  'Tvåa Grupp E',     'Tvåa Grupp F',   '2026-07-06 15:00:00+00'),
('r32', NULL, 84,  'Tvåa Grupp G',     'Tvåa Grupp H',   '2026-07-07 15:00:00+00'),
('r32', NULL, 85,  'Vinnare Grupp F',  'Tvåa Grupp E',   '2026-07-04 12:00:00+00'),
('r32', NULL, 86,  'Vinnare Grupp H',  'Tvåa Grupp G',   '2026-07-05 12:00:00+00'),
('r32', NULL, 87,  'Vinnare Grupp J',  'Tvåa Grupp I',   '2026-07-06 12:00:00+00'),
('r32', NULL, 88,  'Vinnare Grupp L',  'Tvåa Grupp K',   '2026-07-07 12:00:00+00'),

-- Round of 16 (Omgång 16) – 8 matcher, ~11–14 juli 2026
('r16', NULL, 89,  'Vinnare R32 M1',   'Vinnare R32 M2',  '2026-07-11 18:00:00+00'),
('r16', NULL, 90,  'Vinnare R32 M3',   'Vinnare R32 M4',  '2026-07-11 21:00:00+00'),
('r16', NULL, 91,  'Vinnare R32 M5',   'Vinnare R32 M6',  '2026-07-12 18:00:00+00'),
('r16', NULL, 92,  'Vinnare R32 M7',   'Vinnare R32 M8',  '2026-07-12 21:00:00+00'),
('r16', NULL, 93,  'Vinnare R32 M9',   'Vinnare R32 M10', '2026-07-13 18:00:00+00'),
('r16', NULL, 94,  'Vinnare R32 M11',  'Vinnare R32 M12', '2026-07-13 21:00:00+00'),
('r16', NULL, 95,  'Vinnare R32 M13',  'Vinnare R32 M14', '2026-07-14 18:00:00+00'),
('r16', NULL, 96,  'Vinnare R32 M15',  'Vinnare R32 M16', '2026-07-14 21:00:00+00'),

-- Kvartsfinaler (QF) – 4 matcher, ~17–19 juli 2026
('qf', NULL, 97,  'Vinnare R16 M1',   'Vinnare R16 M2',  '2026-07-17 18:00:00+00'),
('qf', NULL, 98,  'Vinnare R16 M3',   'Vinnare R16 M4',  '2026-07-17 21:00:00+00'),
('qf', NULL, 99,  'Vinnare R16 M5',   'Vinnare R16 M6',  '2026-07-18 18:00:00+00'),
('qf', NULL, 100, 'Vinnare R16 M7',   'Vinnare R16 M8',  '2026-07-19 18:00:00+00'),

-- Semifinaler (SF) – 2 matcher, ~22–23 juli 2026
('sf', NULL, 101, 'Vinnare QF M1',    'Vinnare QF M2',   '2026-07-22 21:00:00+00'),
('sf', NULL, 102, 'Vinnare QF M3',    'Vinnare QF M4',   '2026-07-23 21:00:00+00'),

-- Bronsmatch – 1 match, 26 juli 2026
('bronze', NULL, 103, 'Förlorare SF M1', 'Förlorare SF M2', '2026-07-26 18:00:00+00'),

-- Final – 1 match, 27 juli 2026
('final', NULL, 104, 'Vinnare SF M1',  'Vinnare SF M2',   '2026-07-27 21:00:00+00');
