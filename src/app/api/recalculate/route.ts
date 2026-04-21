import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateMatchPoints, calculateBonusPoints } from '@/lib/scoring'
import { DEFAULT_POINTS } from '@/lib/types'
import { WINNER_BRACKET, BRONZE_MATCH_NUM, BRONZE_SF1_NUM, BRONZE_SF2_NUM, isPlaceholderName } from '@/lib/bracket'

export async function POST() {
  const supabase = await createServerSupabaseClient()

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

  const { data: settings } = await supabase.from('settings').select('key, value')
  const settingsMap: Record<string, string> = {}
  settings?.forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value })

  const actualChampion  = settingsMap['actual_champion']    ?? ''
  const actualTopScorer = settingsMap['actual_top_scorer']  ?? ''
  const actualThirdPlace = settingsMap['actual_third_place'] ?? ''

  const matchMap    = new Map(matches.map((m: any) => [m.id, m]))
  const matchByNum  = new Map(matches.map((m: any) => [m.match_number, m]))

  // Strict team gate: checks both home AND away source predicted_winners
  function teamsMatchStrict(match: any, preds: any[]): boolean {
    const realTeams = !isPlaceholderName(match.home_team) && !isPlaceholderName(match.away_team)
    if (!realTeams) return true // placeholders → skip gate

    const bracketEntry = WINNER_BRACKET.find(b => b.to === match.match_number)

    if (bracketEntry) {
      const homeSource = matchByNum.get(bracketEntry.home)
      const awaySource = matchByNum.get(bracketEntry.away)
      if (!homeSource || !awaySource) return true
      const homePred = preds.find((p: any) => p.match_id === homeSource.id)?.predicted_winner
      const awayPred = preds.find((p: any) => p.match_id === awaySource.id)?.predicted_winner
      return homePred === match.home_team && awayPred === match.away_team
    }

    if (match.match_number === BRONZE_MATCH_NUM) {
      const sf1 = matchByNum.get(BRONZE_SF1_NUM)
      const sf2 = matchByNum.get(BRONZE_SF2_NUM)
      if (!sf1 || !sf2) return true
      const sf1Win = preds.find((p: any) => p.match_id === sf1.id)?.predicted_winner
      const sf2Win = preds.find((p: any) => p.match_id === sf2.id)?.predicted_winner
      const loser1 = sf1Win === sf1.home_team ? sf1.away_team : (sf1Win === sf1.away_team ? sf1.home_team : null)
      const loser2 = sf2Win === sf2.home_team ? sf2.away_team : (sf2Win === sf2.away_team ? sf2.home_team : null)
      return loser1 === match.home_team && loser2 === match.away_team
    }

    // r32: single predicted_winner check
    return false // handled below
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
        const realTeams = !isPlaceholderName(match.home_team) && !isPlaceholderName(match.away_team)
        if (realTeams) {
          // Strict check for r16+ and bronze; simple check for r32
          const isR32 = match.match_number >= 73 && match.match_number <= 88
          let passes: boolean
          if (isR32) {
            const w = pred.predicted_winner
            passes = !!w && (w === match.home_team || w === match.away_team)
          } else {
            passes = teamsMatchStrict(match, preds)
          }
          if (!passes) return // 0 points
        }

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
