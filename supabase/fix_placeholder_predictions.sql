-- ============================================================
-- KallesVMTips2026 – Fix predictions with stale placeholder winner names
-- Kör i Supabase SQL Editor när R32-matcher har uppdaterats
-- från platshållarnamn till riktiga lagnamn.
--
-- För varje R32-match: om match_number X nu har riktiga lag
-- men predictions fortfarande refererar till det gamla
-- platshållarnamnet, uppdatera predicted_winner till rätt lagnamn.
-- ============================================================

-- Match 73 (home: Tvåa Grupp A → nuvarande hemmalag)
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 73
  AND p.predicted_winner = 'Tvåa Grupp A' AND m.home_team <> 'Tvåa Grupp A';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 73
  AND p.predicted_winner = 'Tvåa Grupp B' AND m.away_team <> 'Tvåa Grupp B';

-- Match 74
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 74
  AND p.predicted_winner = 'Vinnare Grupp E' AND m.home_team <> 'Vinnare Grupp E';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 74
  AND p.predicted_winner = 'Bästa 3:a (A/B/C/D/F)' AND m.away_team <> 'Bästa 3:a (A/B/C/D/F)';

-- Match 75
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 75
  AND p.predicted_winner = 'Vinnare Grupp F' AND m.home_team <> 'Vinnare Grupp F';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 75
  AND p.predicted_winner = 'Tvåa Grupp C' AND m.away_team <> 'Tvåa Grupp C';

-- Match 76
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 76
  AND p.predicted_winner = 'Vinnare Grupp C' AND m.home_team <> 'Vinnare Grupp C';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 76
  AND p.predicted_winner = 'Tvåa Grupp F' AND m.away_team <> 'Tvåa Grupp F';

-- Match 77
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 77
  AND p.predicted_winner = 'Vinnare Grupp I' AND m.home_team <> 'Vinnare Grupp I';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 77
  AND p.predicted_winner = 'Bästa 3:a (C/D/F/G/H)' AND m.away_team <> 'Bästa 3:a (C/D/F/G/H)';

-- Match 78
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 78
  AND p.predicted_winner = 'Tvåa Grupp E' AND m.home_team <> 'Tvåa Grupp E';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 78
  AND p.predicted_winner = 'Tvåa Grupp I' AND m.away_team <> 'Tvåa Grupp I';

-- Match 79
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 79
  AND p.predicted_winner = 'Vinnare Grupp A' AND m.home_team <> 'Vinnare Grupp A';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 79
  AND p.predicted_winner = 'Bästa 3:a (C/E/F/H/I)' AND m.away_team <> 'Bästa 3:a (C/E/F/H/I)';

-- Match 80 (England vs DR Kongo i skärmbilden)
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 80
  AND p.predicted_winner = 'Vinnare Grupp L' AND m.home_team <> 'Vinnare Grupp L';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 80
  AND p.predicted_winner = 'Bästa 3:a (E/H/I/J/K)' AND m.away_team <> 'Bästa 3:a (E/H/I/J/K)';

-- Match 81
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 81
  AND p.predicted_winner = 'Vinnare Grupp D' AND m.home_team <> 'Vinnare Grupp D';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 81
  AND p.predicted_winner = 'Bästa 3:a (B/E/F/I/J)' AND m.away_team <> 'Bästa 3:a (B/E/F/I/J)';

-- Match 82 (Belgien vs Senegal i skärmbilden)
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 82
  AND p.predicted_winner = 'Vinnare Grupp G' AND m.home_team <> 'Vinnare Grupp G';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 82
  AND p.predicted_winner = 'Bästa 3:a (A/E/H/I/J)' AND m.away_team <> 'Bästa 3:a (A/E/H/I/J)';

-- Match 83
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 83
  AND p.predicted_winner = 'Tvåa Grupp K' AND m.home_team <> 'Tvåa Grupp K';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 83
  AND p.predicted_winner = 'Tvåa Grupp L' AND m.away_team <> 'Tvåa Grupp L';

-- Match 84
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 84
  AND p.predicted_winner = 'Vinnare Grupp H' AND m.home_team <> 'Vinnare Grupp H';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 84
  AND p.predicted_winner = 'Tvåa Grupp J' AND m.away_team <> 'Tvåa Grupp J';

-- Match 85
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 85
  AND p.predicted_winner = 'Vinnare Grupp B' AND m.home_team <> 'Vinnare Grupp B';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 85
  AND p.predicted_winner = 'Bästa 3:a (E/F/G/I/J)' AND m.away_team <> 'Bästa 3:a (E/F/G/I/J)';

-- Match 86
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 86
  AND p.predicted_winner = 'Vinnare Grupp J' AND m.home_team <> 'Vinnare Grupp J';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 86
  AND p.predicted_winner = 'Tvåa Grupp H' AND m.away_team <> 'Tvåa Grupp H';

-- Match 87
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 87
  AND p.predicted_winner = 'Vinnare Grupp K' AND m.home_team <> 'Vinnare Grupp K';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 87
  AND p.predicted_winner = 'Bästa 3:a (D/E/I/J/L)' AND m.away_team <> 'Bästa 3:a (D/E/I/J/L)';

-- Match 88
UPDATE predictions p SET predicted_winner = m.home_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 88
  AND p.predicted_winner = 'Tvåa Grupp D' AND m.home_team <> 'Tvåa Grupp D';

UPDATE predictions p SET predicted_winner = m.away_team
FROM matches m WHERE p.match_id = m.id AND m.match_number = 88
  AND p.predicted_winner = 'Tvåa Grupp G' AND m.away_team <> 'Tvåa Grupp G';
