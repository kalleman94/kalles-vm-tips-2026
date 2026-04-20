-- ============================================================
-- KallesVMTips2026 – Fix knockout bracket team names
-- Kör detta i Supabase SQL Editor om slutspelsmatcherna
-- redan är inlagda med gamla felaktiga platshållarnamn.
--
-- Baserat på FIFA:s officiella bracket för VM 2026.
-- ============================================================

-- Round of 32 – rätt lag/platshållare per match
UPDATE matches SET home_team = 'Tvåa Grupp A',    away_team = 'Tvåa Grupp B'          WHERE match_number = 73;
UPDATE matches SET home_team = 'Vinnare Grupp E',  away_team = 'Bästa 3:a (A/B/C/D/F)' WHERE match_number = 74;
UPDATE matches SET home_team = 'Vinnare Grupp F',  away_team = 'Tvåa Grupp C'          WHERE match_number = 75;
UPDATE matches SET home_team = 'Vinnare Grupp C',  away_team = 'Tvåa Grupp F'          WHERE match_number = 76;
UPDATE matches SET home_team = 'Vinnare Grupp I',  away_team = 'Bästa 3:a (C/D/F/G/H)' WHERE match_number = 77;
UPDATE matches SET home_team = 'Tvåa Grupp E',     away_team = 'Tvåa Grupp I'          WHERE match_number = 78;
UPDATE matches SET home_team = 'Vinnare Grupp A',  away_team = 'Bästa 3:a (C/E/F/H/I)' WHERE match_number = 79;
UPDATE matches SET home_team = 'Vinnare Grupp L',  away_team = 'Bästa 3:a (E/H/I/J/K)' WHERE match_number = 80;
UPDATE matches SET home_team = 'Vinnare Grupp D',  away_team = 'Bästa 3:a (B/E/F/I/J)' WHERE match_number = 81;
UPDATE matches SET home_team = 'Vinnare Grupp G',  away_team = 'Bästa 3:a (A/E/H/I/J)' WHERE match_number = 82;
UPDATE matches SET home_team = 'Tvåa Grupp K',     away_team = 'Tvåa Grupp L'          WHERE match_number = 83;
UPDATE matches SET home_team = 'Vinnare Grupp H',  away_team = 'Tvåa Grupp J'          WHERE match_number = 84;
UPDATE matches SET home_team = 'Vinnare Grupp B',  away_team = 'Bästa 3:a (E/F/G/I/J)' WHERE match_number = 85;
UPDATE matches SET home_team = 'Vinnare Grupp J',  away_team = 'Tvåa Grupp H'          WHERE match_number = 86;
UPDATE matches SET home_team = 'Vinnare Grupp K',  away_team = 'Bästa 3:a (D/E/I/J/L)' WHERE match_number = 87;
UPDATE matches SET home_team = 'Tvåa Grupp D',     away_team = 'Tvåa Grupp G'          WHERE match_number = 88;

-- Round of 16 – platshållare med rätt matchreferenser
UPDATE matches SET home_team = 'Vinnare M74', away_team = 'Vinnare M77' WHERE match_number = 89;
UPDATE matches SET home_team = 'Vinnare M73', away_team = 'Vinnare M75' WHERE match_number = 90;
UPDATE matches SET home_team = 'Vinnare M83', away_team = 'Vinnare M84' WHERE match_number = 91;
UPDATE matches SET home_team = 'Vinnare M81', away_team = 'Vinnare M82' WHERE match_number = 92;
UPDATE matches SET home_team = 'Vinnare M76', away_team = 'Vinnare M78' WHERE match_number = 93;
UPDATE matches SET home_team = 'Vinnare M79', away_team = 'Vinnare M80' WHERE match_number = 94;
UPDATE matches SET home_team = 'Vinnare M86', away_team = 'Vinnare M88' WHERE match_number = 95;
UPDATE matches SET home_team = 'Vinnare M85', away_team = 'Vinnare M87' WHERE match_number = 96;

-- Kvartsfinaler
UPDATE matches SET home_team = 'Vinnare M89', away_team = 'Vinnare M90' WHERE match_number = 97;
UPDATE matches SET home_team = 'Vinnare M91', away_team = 'Vinnare M92' WHERE match_number = 98;
UPDATE matches SET home_team = 'Vinnare M93', away_team = 'Vinnare M94' WHERE match_number = 99;
UPDATE matches SET home_team = 'Vinnare M95', away_team = 'Vinnare M96' WHERE match_number = 100;

-- Semifinaler
UPDATE matches SET home_team = 'Vinnare M97',  away_team = 'Vinnare M98'  WHERE match_number = 101;
UPDATE matches SET home_team = 'Vinnare M99',  away_team = 'Vinnare M100' WHERE match_number = 102;

-- Bronsmatch
UPDATE matches SET home_team = 'Förlorare M101', away_team = 'Förlorare M102' WHERE match_number = 103;

-- Final
UPDATE matches SET home_team = 'Vinnare M101', away_team = 'Vinnare M102' WHERE match_number = 104;
