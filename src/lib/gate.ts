// Client-side gate check – mirrors the logic in api/recalculate/route.ts
import { Match, Prediction } from './types'
import { WINNER_BRACKET, BRONZE_MATCH_NUM, BRONZE_SF1_NUM, BRONZE_SF2_NUM, isPlaceholderName } from './bracket'

export function clientGatePass(
  match: Match,
  predictions: Prediction[],
  matchesByNum: Map<number, Match>,
): boolean {
  if (match.phase === 'group') return true
  if (isPlaceholderName(match.home_team) || isPlaceholderName(match.away_team)) return true

  const num = match.match_number

  if (num >= 73 && num <= 88) {
    const w = predictions.find(p => p.match_id === match.id)?.predicted_winner
    return !!w && (w === match.home_team || w === match.away_team)
  }

  const entry = WINNER_BRACKET.find(b => b.to === num)
  if (entry) {
    const hs = matchesByNum.get(entry.home)
    const as_ = matchesByNum.get(entry.away)
    if (!hs || !as_) return true
    const hw = predictions.find(p => p.match_id === hs.id)?.predicted_winner
    const aw = predictions.find(p => p.match_id === as_.id)?.predicted_winner
    return hw === match.home_team && aw === match.away_team
  }

  if (num === BRONZE_MATCH_NUM) {
    const sf1 = matchesByNum.get(BRONZE_SF1_NUM)
    const sf2 = matchesByNum.get(BRONZE_SF2_NUM)
    if (!sf1 || !sf2) return true
    const w1 = predictions.find(p => p.match_id === sf1.id)?.predicted_winner
    const w2 = predictions.find(p => p.match_id === sf2.id)?.predicted_winner
    const l1 = w1 === sf1.home_team ? sf1.away_team : (w1 === sf1.away_team ? sf1.home_team : null)
    const l2 = w2 === sf2.home_team ? sf2.away_team : (w2 === sf2.away_team ? sf2.home_team : null)
    return l1 === match.home_team && l2 === match.away_team
  }

  return true
}
