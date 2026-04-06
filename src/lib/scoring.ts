import { MatchResult, Prediction, BonusAnswers, DEFAULT_POINTS } from './types'

type PointsConfig = typeof DEFAULT_POINTS

function getSign(home: number, away: number): '1' | 'X' | '2' {
  if (home > away) return '1'
  if (home === away) return 'X'
  return '2'
}

export function calculateMatchPoints(
  prediction: Prediction,
  result: MatchResult,
  config: PointsConfig = DEFAULT_POINTS
): number {
  if (prediction.home_goals === null || prediction.away_goals === null) return 0

  let points = 0
  if (prediction.home_goals === result.home_goals) points += config.correct_home_goals
  if (prediction.away_goals === result.away_goals) points += config.correct_away_goals

  const resultSign = getSign(result.home_goals, result.away_goals)
  const predSign = getSign(prediction.home_goals, prediction.away_goals)
  if (resultSign === predSign) points += config.correct_sign

  return points
}

export function calculateKnockoutPoints(
  phase: string,
  predictedWinner: string | null,
  actualWinner: string | null,
  config: PointsConfig = DEFAULT_POINTS
): number {
  if (!predictedWinner || !actualWinner) return 0
  if (predictedWinner !== actualWinner) return 0

  const phasePoints: Record<string, number> = {
    r32: config.r32_team,
    r16: config.r16_team,
    qf: config.qf_team,
    sf: config.sf_team,
    bronze: config.bronze_team,
    final: config.final_team,
  }
  return phasePoints[phase] ?? 0
}

export function calculateBonusPoints(
  answers: BonusAnswers,
  actualTopScorer: string,
  actualChampion: string,
  actualThirdPlace: string,
  config: PointsConfig = DEFAULT_POINTS
): number {
  let points = 0
  if (answers.top_scorer?.toLowerCase() === actualTopScorer?.toLowerCase())
    points += config.bonus_top_scorer
  if (answers.champion?.toLowerCase() === actualChampion?.toLowerCase())
    points += config.bonus_champion
  if (answers.third_place?.toLowerCase() === actualThirdPlace?.toLowerCase())
    points += config.bonus_third_place
  return points
}
