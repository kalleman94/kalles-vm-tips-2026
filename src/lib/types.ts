export type Phase = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'bronze' | 'final'

export interface Participant {
  id: string
  name: string
  created_at: string
}

export interface Match {
  id: number
  phase: Phase
  group_name: string | null
  match_number: number
  home_team: string
  away_team: string
  match_date: string
}

export interface MatchResult {
  id: string
  match_id: number
  home_goals: number
  away_goals: number
  winner: string | null
}

export interface Prediction {
  id: string
  participant_id: string
  match_id: number
  home_goals: number | null
  away_goals: number | null
  predicted_winner: string | null
}

export interface BonusAnswers {
  id: string
  participant_id: string
  top_scorer: string
  champion: string
  third_place: string
}

export interface ParticipantScore {
  participant_id: string
  participant_name: string
  total_points: number
  group_points: number
  knockout_points: number
  bonus_points: number
}

export interface LockStatus {
  groupLocked: boolean
  bonusLocked: boolean
  knockoutLocked: boolean
  groupLockTime: string
  knockoutLockTime: string
}

// Points config (stored in settings table, defaults here)
export const DEFAULT_POINTS = {
  correct_home_goals: 2,
  correct_away_goals: 2,
  correct_sign: 3,
  r32_team: 0,
  r16_team: 0,
  qf_team: 0,
  sf_team: 6,
  bronze_team: 8,
  final_team: 8,
  bonus_top_scorer: 20,
  bonus_champion: 20,
  bonus_third_place: 10,
}
