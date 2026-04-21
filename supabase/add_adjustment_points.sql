-- Add adjustment_points column to scores table
ALTER TABLE scores ADD COLUMN IF NOT EXISTS adjustment_points integer NOT NULL DEFAULT 0;
