import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateMatchPoints, calculateBonusPoints } from '@/lib/scoring'
import { DEFAULT_POINTS } from '@/lib/types'

export async function POST() {
  const supabase = await createServerSupabaseClient()

  // Fetch all data needed
  const [
    { data: participants },
    { data: results },
    { data: allPredictions },
    { data: allBonus },
    { data: matches },
  ] = await Promise.all([
    supabase.from('participants').select('id'),
    supabase.from('match_results').select('*, matches(phase)'),
    supabase.from('predictions').select('*'),
    supabase.from('bonus_answers').select('*'),
    supabase.from('matches').select('*'),
  ])

  if (!participants || !results || !allPredictions || !matches) {
    return NextResponse.json({ error: 'Data fetch failed' }, { status: 500 })
  }

  // Get bonus targets from settings or use empty strings (admin fills via match results)
  const { data: settings } = await supabase.from('settings').select('key, value')
  const settingsMap: Record<string, string> = {}
  settings?.forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value })

  const actualChampion = settingsMap['actual_champion'] ?? ''
  const actualTopScorer = settingsMap['actual_top_scorer'] ?? ''
  const actualThirdPlace = settingsMap['actual_third_place'] ?? ''

  const matchMap = new Map(matches.map((m: any) => [m.id, m]))

  // Helper: detect placeholder team names (before admin fills in real teams)
  const isPlaceholder = (name: string) => /^(Vinnare|Tvåa|Bästa|Förlorare)/.test(name)

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
        // Gate check: real teams must be filled in AND user must have predicted one of them
        const realTeamsFilled = !isPlaceholder(match.home_team) && !isPlaceholder(match.away_team)
        if (realTeamsFilled) {
          const w = pred.predicted_winner
          if (!w || (w !== match.home_team && w !== match.away_team)) {
            return // Wrong teams → 0 points for this match
          }
        }
        const pts = calculateMatchPoints(pred, result, DEFAULT_POINTS)
        knockoutPoints += pts
        // Bonus for correct advancing team
        if (pred.predicted_winner && result.winner && pred.predicted_winner === result.winner) {
          const phaseBonus: Record<string, number> = {
            r32: DEFAULT_POINTS.r32_team, r16: DEFAULT_POINTS.r16_team,
            qf: DEFAULT_POINTS.qf_team, sf: DEFAULT_POINTS.sf_team,
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

    return {
      participant_id: p.id,
      group_points: groupPoints,
      knockout_points: knockoutPoints,
      bonus_points: bonusPoints,
      total_points: groupPoints + knockoutPoints + bonusPoints,
    }
  })

  await supabase.from('scores').upsert(scoreRows, { onConflict: 'participant_id' })

  return NextResponse.json({ ok: true, updated: scoreRows.length })
}
