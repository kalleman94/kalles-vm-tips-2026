-- ============================================================
-- KallesVMTips2026 – Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Participants (tipsters)
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matches (seeded with VM 2026 schedule)
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  phase TEXT NOT NULL CHECK (phase IN ('group','r32','r16','qf','sf','bronze','final')),
  group_name TEXT,
  match_number INT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL
);

-- Official match results (admin only)
CREATE TABLE match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id INT UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  home_goals INT NOT NULL,
  away_goals INT NOT NULL,
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Participant predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  match_id INT REFERENCES matches(id) ON DELETE CASCADE,
  home_goals INT,
  away_goals INT,
  predicted_winner TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (participant_id, match_id)
);

-- Bonus answers
CREATE TABLE bonus_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  top_scorer TEXT DEFAULT '',
  champion TEXT DEFAULT '',
  third_place TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cached scores (updated by recalculate API)
CREATE TABLE scores (
  participant_id UUID PRIMARY KEY REFERENCES participants(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  group_points INT DEFAULT 0,
  knockout_points INT DEFAULT 0,
  bonus_points INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Settings / config
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default point settings
INSERT INTO settings (key, value) VALUES
  ('correct_home_goals', '2'),
  ('correct_away_goals', '2'),
  ('correct_sign', '3'),
  ('r32_team', '1'),
  ('r16_team', '2'),
  ('qf_team', '4'),
  ('sf_team', '6'),
  ('bronze_team', '8'),
  ('final_team', '8'),
  ('bonus_top_scorer', '20'),
  ('bonus_champion', '20'),
  ('bonus_third_place', '10'),
  ('actual_champion', ''),
  ('actual_top_scorer', ''),
  ('actual_third_place', '');

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Participants: readable by all, writable only by authenticated (admin)
CREATE POLICY "participants_select" ON participants FOR SELECT USING (true);
CREATE POLICY "participants_insert" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "participants_update" ON participants FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "participants_delete" ON participants FOR DELETE USING (auth.role() = 'authenticated');

-- Matches: readable by all, writable by authenticated (admin)
CREATE POLICY "matches_select" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_write" ON matches FOR ALL USING (auth.role() = 'authenticated');

-- Match results: readable by all, writable by authenticated
CREATE POLICY "match_results_select" ON match_results FOR SELECT USING (true);
CREATE POLICY "match_results_write" ON match_results FOR ALL USING (auth.role() = 'authenticated');

-- Predictions: readable by all, writable by anyone (participant identified by participant_id)
CREATE POLICY "predictions_select" ON predictions FOR SELECT USING (true);
CREATE POLICY "predictions_write" ON predictions FOR ALL USING (true);

-- Bonus answers: readable by all, writable by anyone
CREATE POLICY "bonus_select" ON bonus_answers FOR SELECT USING (true);
CREATE POLICY "bonus_write" ON bonus_answers FOR ALL USING (true);

-- Scores: readable by all, writable by service role (API)
CREATE POLICY "scores_select" ON scores FOR SELECT USING (true);
CREATE POLICY "scores_write" ON scores FOR ALL USING (true);

-- Settings: readable by all, writable by authenticated
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_write" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Realtime: enable on scores table
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE scores;

-- ============================================================
-- VM 2026 Group Stage Seed Data (12 groups, 48 teams)
-- Official schedule TBD – dates approximate
-- ============================================================

INSERT INTO matches (phase, group_name, match_number, home_team, away_team, match_date) VALUES
-- Grupp A: Mexico, South Africa, South Korea, Czech Republic
('group','A',1,'Mexico','South Africa','2026-06-11 19:00+00'),
('group','A',2,'South Korea','Czech Republic','2026-06-11 22:00+00'),
('group','A',17,'Mexico','South Korea','2026-06-15 16:00+00'),
('group','A',18,'Czech Republic','South Africa','2026-06-15 22:00+00'),
('group','A',33,'Mexico','Czech Republic','2026-06-19 19:00+00'),
('group','A',34,'South Africa','South Korea','2026-06-19 19:00+00'),
-- Grupp B: Canada, Bosnia and Herzegovina, Qatar, Switzerland
('group','B',3,'Canada','Bosnia and Herzegovina','2026-06-12 19:00+00'),
('group','B',4,'Qatar','Switzerland','2026-06-12 22:00+00'),
('group','B',19,'Canada','Qatar','2026-06-16 16:00+00'),
('group','B',20,'Switzerland','Bosnia and Herzegovina','2026-06-16 22:00+00'),
('group','B',35,'Canada','Switzerland','2026-06-20 19:00+00'),
('group','B',36,'Bosnia and Herzegovina','Qatar','2026-06-20 19:00+00'),
-- Grupp C: Brazil, Morocco, Haiti, Scotland
('group','C',5,'Brazil','Morocco','2026-06-12 19:00+00'),
('group','C',6,'Haiti','Scotland','2026-06-12 22:00+00'),
('group','C',21,'Brazil','Haiti','2026-06-16 16:00+00'),
('group','C',22,'Scotland','Morocco','2026-06-16 22:00+00'),
('group','C',37,'Brazil','Scotland','2026-06-20 19:00+00'),
('group','C',38,'Morocco','Haiti','2026-06-20 19:00+00'),
-- Grupp D: United States, Paraguay, Australia, Turkey
('group','D',7,'United States','Paraguay','2026-06-13 16:00+00'),
('group','D',8,'Australia','Turkey','2026-06-13 19:00+00'),
('group','D',23,'United States','Australia','2026-06-17 16:00+00'),
('group','D',24,'Turkey','Paraguay','2026-06-17 22:00+00'),
('group','D',39,'United States','Turkey','2026-06-21 19:00+00'),
('group','D',40,'Paraguay','Australia','2026-06-21 19:00+00'),
-- Grupp E: Germany, Curaçao, Ivory Coast, Ecuador
('group','E',9,'Germany','Curaçao','2026-06-13 19:00+00'),
('group','E',10,'Ivory Coast','Ecuador','2026-06-13 22:00+00'),
('group','E',25,'Germany','Ivory Coast','2026-06-17 16:00+00'),
('group','E',26,'Ecuador','Curaçao','2026-06-17 19:00+00'),
('group','E',41,'Germany','Ecuador','2026-06-21 19:00+00'),
('group','E',42,'Curaçao','Ivory Coast','2026-06-21 19:00+00'),
-- Grupp F: Netherlands, Japan, Sweden, Tunisia
('group','F',11,'Netherlands','Japan','2026-06-14 16:00+00'),
('group','F',12,'Sweden','Tunisia','2026-06-14 19:00+00'),
('group','F',27,'Netherlands','Sweden','2026-06-18 16:00+00'),
('group','F',28,'Tunisia','Japan','2026-06-18 22:00+00'),
('group','F',43,'Netherlands','Tunisia','2026-06-22 19:00+00'),
('group','F',44,'Japan','Sweden','2026-06-22 19:00+00'),
-- Grupp G: Belgium, Egypt, Iran, New Zealand
('group','G',13,'Belgium','Egypt','2026-06-14 19:00+00'),
('group','G',14,'Iran','New Zealand','2026-06-14 22:00+00'),
('group','G',29,'Belgium','Iran','2026-06-18 16:00+00'),
('group','G',30,'New Zealand','Egypt','2026-06-18 19:00+00'),
('group','G',45,'Belgium','New Zealand','2026-06-22 19:00+00'),
('group','G',46,'Egypt','Iran','2026-06-22 19:00+00'),
-- Grupp H: Spain, Cape Verde, Saudi Arabia, Uruguay
('group','H',15,'Spain','Cape Verde','2026-06-15 16:00+00'),
('group','H',16,'Saudi Arabia','Uruguay','2026-06-15 19:00+00'),
('group','H',31,'Spain','Saudi Arabia','2026-06-19 16:00+00'),
('group','H',32,'Uruguay','Cape Verde','2026-06-19 19:00+00'),
('group','H',47,'Spain','Uruguay','2026-06-23 19:00+00'),
('group','H',48,'Cape Verde','Saudi Arabia','2026-06-23 19:00+00'),
-- Grupp I: France, Senegal, Iraq, Norway
('group','I',49,'France','Senegal','2026-06-15 16:00+00'),
('group','I',50,'Iraq','Norway','2026-06-15 19:00+00'),
('group','I',51,'France','Iraq','2026-06-19 16:00+00'),
('group','I',52,'Norway','Senegal','2026-06-19 19:00+00'),
('group','I',53,'France','Norway','2026-06-23 19:00+00'),
('group','I',54,'Senegal','Iraq','2026-06-23 19:00+00'),
-- Grupp J: Argentina, Algeria, Austria, Jordan
('group','J',55,'Argentina','Algeria','2026-06-16 16:00+00'),
('group','J',56,'Austria','Jordan','2026-06-16 19:00+00'),
('group','J',57,'Argentina','Austria','2026-06-20 16:00+00'),
('group','J',58,'Jordan','Algeria','2026-06-20 19:00+00'),
('group','J',59,'Argentina','Jordan','2026-06-24 19:00+00'),
('group','J',60,'Algeria','Austria','2026-06-24 19:00+00'),
-- Grupp K: Portugal, DR Congo, Uzbekistan, Colombia
('group','K',61,'Portugal','DR Congo','2026-06-16 16:00+00'),
('group','K',62,'Uzbekistan','Colombia','2026-06-16 19:00+00'),
('group','K',63,'Portugal','Uzbekistan','2026-06-20 16:00+00'),
('group','K',64,'Colombia','DR Congo','2026-06-20 19:00+00'),
('group','K',65,'Portugal','Colombia','2026-06-24 19:00+00'),
('group','K',66,'DR Congo','Uzbekistan','2026-06-24 19:00+00'),
-- Grupp L: England, Croatia, Ghana, Panama
('group','L',67,'England','Croatia','2026-06-17 16:00+00'),
('group','L',68,'Ghana','Panama','2026-06-17 19:00+00'),
('group','L',69,'England','Ghana','2026-06-21 16:00+00'),
('group','L',70,'Panama','Croatia','2026-06-21 19:00+00'),
('group','L',71,'England','Panama','2026-06-25 19:00+00'),
('group','L',72,'Croatia','Ghana','2026-06-25 19:00+00');

-- Note: Knockout matches will be added when official bracket is confirmed.
