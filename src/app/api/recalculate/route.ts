import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateMatchPoints, calculateBonusPoints } from '@/lib/scoring'
import { DEFAULT_POINTS } from '@/lib/types'
import { WINNER_BRACKET, BRONZE_MATCH_NUM, BRONZE_SF1_NUM, BRONZE_SF2_NUM, isPlaceholderName } from '@/lib/bracket'

export async function POST() {
  const supabase = await createServerSupabaseClient()

  // Fetch predictions with pagination to avoid Supabase's 1000-row default limit
  const fetchAllPredictions = async () => {
    const batchSize = 1000
    let all: any[] = []
    let from = 0
    while (true) {
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .range(from, from + batchSize - 1)
      if (!data || data.length === 0) break
      all = all.concat(data)
      if (data.length < batchSize) break
      from += batchSize
    }
    return all
  }

  const [
    { data: participants },
    { data: results },
    allPredictions,
    { data: allBonus },
    { data: matches },
  ] = await Promise.all([
    supabase.from('participants').select('id'),
    supabase.from('match_results').select('*, matches(phase)'),
    fetchAllPredictions(),
    supabase.from('bonus_answers').select('*'),
    supabase.from('matches').select('*'),
  ])

  if (!participants || !results || !allPredictions || !matches) {
    return NextResponse.json({ error: 'Data fetch failed' }, { status: 500 })
  }

  const { data: settings } = await supabase.from('settings').select('key, value')
  const settingsMap: Record<string, string> = {}
  settings?.forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value })

  const actualChampion  = settingsMap['actual_champion']    ?? ''
  const actualTopScorer = settingsMap['actual_top_scorer']  ?? ''
  const actualThirdPlace = settingsMap['actual_third_place'] ?? ''

  const matchMap    = new Map(matches.map((m: any) => [m.id, m]))
  const matchByNum  = new Map(matches.map((m: any) => [m.match_number, m]))

  // Preserve existing adjustments across recalculations
  const { data: existingScores } = await supabase.from('scores').select('participant_id, adjustment_points')
  const adjustmentMap = new Map(existingScores?.map((s: any) => [s.participant_id, s.adjustment_points ?? 0]) ?? [])

  // Gate: both source predicted_winners must match actual team names.
  // r32 uses simple check (teams come from group stage, no source predictions).
  function gatePass(match: any, preds: any[]): boolean {
    if (isPlaceholderName(match.home_team) || isPlaceholderName(match.away_team)) return true

    const isR32 = match.match_number >= 73 && match.match_number <= 88
    if (isR32) {
      const w = preds.find((p: any) => p.match_id === match.id)?.predicted_winner
      return !!w && (w === match.home_team || w === match.away_team)
    }

    // r16+: check both source predicted_winners
    const entry = WINNER_BRACKET.find(b => b.to === match.match_number)
    if (entry) {
      const hs = matchByNum.get(entry.home)
      const as_ = matchByNum.get(entry.away)
      if (!hs || !as_) return true
      const hw = preds.find((p: any) => p.match_id === hs.id)?.predicted_winner
      const aw = preds.find((p: any) => p.match_id === as_.id)?.predicted_winner
      return hw === match.home_team && aw === match.away_team
    }

    // Bronze: check predicted losers of both SFs
    if (match.match_number === BRONZE_MATCH_NUM) {
      const sf1 = matchByNum.get(BRONZE_SF1_NUM)
      const sf2 = matchByNum.get(BRONZE_SF2_NUM)
      if (!sf1 || !sf2) return true
      const w1 = preds.find((p: any) => p.match_id === sf1.id)?.predicted_winner
      const w2 = preds.find((p: any) => p.match_id === sf2.id)?.predicted_winner
      const l1 = w1 === sf1.home_team ? sf1.away_team : (w1 === sf1.away_team ? sf1.home_team : null)
      const l2 = w2 === sf2.home_team ? sf2.away_team : (w2 === sf2.away_team ? sf2.home_team : null)
      return l1 === match.home_team && l2 === match.away_team
    }

    return true
  }

  const scoreRows = participants.map((p: any) => {
    const preds = allPredictions.filter((pred: any) => pred.participant_id === p.id)
    const bonus = allBonus?.find((b: any) => b.participant_id === p.id)

    let groupPoints = 0
    let knockoutPoints = 0

    preds.forEach((pred: any) => {
      const result = results.find((r: any) => r.match_id === pred.match_id)
      if (!result) return
      const match = matchMap.get(pred.match_id)
      if (!match) return

      if (match.phase !== 'group') {
        if (!gatePass(match, preds)) return // 0 points

        knockoutPoints += calculateMatchPoints(pred, result, DEFAULT_POINTS)
        if (pred.predicted_winner && result.winner && pred.predicted_winner === result.winner) {
          const phaseBonus: Record<string, number> = {
            r32: DEFAULT_POINTS.r32_team, r16: DEFAULT_POINTS.r16_team,
            qf: DEFAULT_POINTS.qf_team,  sf: DEFAULT_POINTS.sf_team,
            bronze: DEFAULT_POINTS.bronze_team, final: DEFAULT_POINTS.final_team,
          }
          knockoutPoints += phaseBonus[match.phase] ?? 0
        }
      } else {
        groupPoints += calculateMatchPoints(pred, result, DEFAULT_POINTS)
      }
    })

    const bonusPoints = bonus
      ? calculateBonusPoints(bonus, actualTopScorer, actualChampion, actualThirdPlace, DEFAULT_POINTS)
      : 0

    const adjustment = adjustmentMap.get(p.id) ?? 0

    return {
      participant_id: p.id,
      group_points: groupPoints,
      knockout_points: knockoutPoints,
      bonus_points: bonusPoints,
      adjustment_points: adjustment,
      total_points: groupPoints + knockoutPoints + bonusPoints + adjustment,
    }
  })

  await supabase.from('scores').upsert(scoreRows, { onConflict: 'participant_id' })
  return NextResponse.json({ ok: true, updated: scoreRows.length })
}
