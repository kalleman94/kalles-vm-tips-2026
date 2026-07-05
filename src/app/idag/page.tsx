'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Match, MatchResult, Participant, Prediction } from '@/lib/types'
import { calculateMatchPoints, calculateKnockoutPoints } from '@/lib/scoring'
import { getMatchDayDate } from '@/lib/matchday'
import { clientGatePass } from '@/lib/gate'

const PHASE_LABELS: Record<string, string> = {
  group: 'Grupp',
  r32: 'Omgång 32',
  r16: 'Omgång 16',
  qf: 'Kvartsfinal',
  sf: 'Semifinal',
  bronze: 'Bronsmatch',
  final: 'Final',
}

function getTipLabel(pred: Prediction | undefined, match: Match) {
  if (!pred) return { score: '–', winner: null }
  const hasGoals = pred.home_goals != null && pred.away_goals != null
  const score = hasGoals ? `${pred.home_goals}–${pred.away_goals}` : '–'
  const winner = match.phase !== 'group' ? pred.predicted_winner ?? null : null
  return { score, winner }
}

function getPoints(pred: Prediction | undefined, match: Match, result: MatchResult | undefined, predArr: Prediction[], matchesByNum: Map<number, Match>): number | null {
  if (!result) return null
  if (!pred) return 0
  if (!clientGatePass(match, predArr, matchesByNum)) return 0
  const goalPoints = calculateMatchPoints(pred, result)
  const knockoutPoints = match.phase !== 'group'
    ? calculateKnockoutPoints(match.phase, pred.predicted_winner ?? null, result.winner ?? null)
    : 0
  return goalPoints + knockoutPoints
}

function PointsBadge({ points }: { points: number | null }) {
  if (points === null) return <span className="text-gray-300 text-xs">–</span>
  const color = points >= 7 ? '#16a34a' : points >= 3 ? 'var(--color-primary)' : points > 0 ? '#f59e0b' : '#dc2626'
  return (
    <span className="text-sm font-bold" style={{ color }}>
      {points}p
    </span>
  )
}

export default function IdagPage() {
  const supabase = createClient()
  const [matches, setMatches] = useState<Match[]>([])
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [results, setResults] = useState<Record<number, MatchResult>>({})
  const [participants, setParticipants] = useState<Participant[]>([])
  const [allPreds, setAllPreds] = useState<Record<string, Record<number, Prediction>>>({})
  const [loading, setLoading] = useState(true)
  const [groupTipsVisible, setGroupTipsVisible] = useState(true)
  const [knockoutTipsVisible, setKnockoutTipsVisible] = useState(false)

  useEffect(() => {
    async function load() {
      const todayMatchDay = getMatchDayDate(new Date())

      const [
        { data: matchData },
        { data: resultData },
        { data: participantData },
        { data: settingsData },
      ] = await Promise.all([
        supabase.from('matches').select('*').order('match_date'),
        supabase.from('match_results').select('*'),
        supabase.from('participants').select('id, name').order('name'),
        supabase.from('settings').select('key, value').in('key', ['group_tips_visible', 'knockout_tips_visible']),
      ])

      if (settingsData) {
        const map: Record<string, string> = {}
        settingsData.forEach((s: any) => { map[s.key] = s.value })
        if (map['group_tips_visible'] !== undefined) setGroupTipsVisible(map['group_tips_visible'] !== 'false')
        if (map['knockout_tips_visible'] !== undefined) setKnockoutTipsVisible(map['knockout_tips_visible'] === 'true')
      }

      const todaysMatches: Match[] = (matchData ?? []).filter(
        (m: Match) => getMatchDayDate(new Date(m.match_date)) === todayMatchDay
      )

      const resultMap: Record<number, MatchResult> = {}
      ;(resultData ?? []).forEach((r: MatchResult) => { resultMap[r.match_id] = r })

      setMatches(todaysMatches)
      setAllMatches(matchData ?? [])
      setResults(resultMap)
      setParticipants(participantData ?? [])

      if ((participantData ?? []).length > 0) {
        const { data: predData } = await supabase
          .from('predictions')
          .select('*')

        const map: Record<string, Record<number, Prediction>> = {}
        ;(predData ?? []).forEach((p: Prediction) => {
          if (!map[p.participant_id]) map[p.participant_id] = {}
          map[p.participant_id][p.match_id] = p
        })
        setAllPreds(map)
      }

      setLoading(false)
    }
    load()
  }, [])

  // Daily totals per participant
  const matchesByNum = new Map<number, Match>()
  allMatches.forEach(m => matchesByNum.set(m.match_number, m))

  const dailyTotals = participants.map(p => {
    const preds = allPreds[p.id] ?? {}
    const predArr = Object.values(preds)
    const total = matches.reduce((sum, m) => {
      const pts = getPoints(preds[m.id], m, results[m.id], predArr, matchesByNum)
      return sum + (pts ?? 0)
    }, 0)
    return { id: p.id, name: p.name, total }
  }).sort((a, b) => b.total - a.total)

  const todayHasResults = matches.some(m => results[m.id])

  // Filter visible matches based on admin settings
  const visibleMatches = matches.filter(m =>
    m.phase === 'group' ? groupTipsVisible : knockoutTipsVisible
  )
  const allMatchesHidden = matches.length > 0 && visibleMatches.length === 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
          Idag
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' })}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Laddar...</div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p>Inga matcher spelas idag.</p>
        </div>
      ) : allMatchesHidden ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔒</p>
          <p>Tipsen för dagens matcher är dolda tills alla har lämnat in.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Daily leaderboard – only show when results exist */}
          {todayHasResults && (
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Dagens poängliga</h2>
              <div className="flex flex-wrap gap-2">
                {dailyTotals.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{p.total}p</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match grid */}
          <div className="bg-white rounded-xl shadow overflow-hidden">

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-primary)' }} className="text-white">
                    <th className="px-4 py-3 text-left">Match</th>
                    {participants.map(p => (
                      <th key={p.id} className="px-3 py-3 text-center whitespace-nowrap">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleMatches.map((m, i) => {
                    const result = results[m.id]
                    return (
                      <tr key={m.id} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {m.home_team} – {m.away_team}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                            <span>{PHASE_LABELS[m.phase] ?? m.phase}</span>
                            {result && (
                              <span className="font-semibold text-gray-600">
                                Resultat: {result.home_goals}–{result.away_goals}
                                {result.winner && ` (${result.winner})`}
                              </span>
                            )}
                          </div>
                        </td>
                        {participants.map(p => {
                          const pred = allPreds[p.id]?.[m.id]
                          const { score, winner } = getTipLabel(pred, m)
                          const predArr = Object.values(allPreds[p.id] ?? {})
                          const pts = getPoints(pred, m, result, predArr, matchesByNum)
                          return (
                            <td key={p.id} className="px-3 py-3 text-center">
                              <div className="font-mono font-bold text-gray-700">{score}</div>
                              {winner && <div className="text-xs text-gray-500">{winner}</div>}
                              <PointsBadge points={pts} />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
                {todayHasResults && (
                  <tfoot>
                    <tr className="border-t bg-gray-50 font-bold">
                      <td className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide">Totalt idag</td>
                      {participants.map(p => {
                        const t = dailyTotals.find(d => d.id === p.id)
                        return (
                          <td key={p.id} className="px-3 py-2 text-center">
                            <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{t?.total ?? 0}p</span>
                          </td>
                        )
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mobile: one card per match */}
            <div className="md:hidden divide-y">
              {visibleMatches.map(m => {
                const result = results[m.id]
                return (
                  <div key={m.id} className="p-4">
                    <div className="font-semibold text-gray-800 mb-1">
                      {m.home_team} – {m.away_team}
                    </div>
                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                      <span>{PHASE_LABELS[m.phase] ?? m.phase}</span>
                      {result && (
                        <span className="font-semibold text-gray-600">
                          Resultat: {result.home_goals}–{result.away_goals}
                          {result.winner && ` (${result.winner})`}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {participants.map(p => {
                        const pred = allPreds[p.id]?.[m.id]
                        const { score, winner } = getTipLabel(pred, m)
                        const predArr = Object.values(allPreds[p.id] ?? {})
                        const pts = getPoints(pred, m, result, predArr, matchesByNum)
                        return (
                          <div key={p.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{p.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-700">{score}</span>
                              {winner && <span className="text-xs text-gray-500">{winner}</span>}
                              <PointsBadge points={pts} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Mobile daily totals */}
              {todayHasResults && (
                <div className="p-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Totalt idag</p>
                  <div className="space-y-1">
                    {dailyTotals.map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                          <span className="text-gray-700">{p.name}</span>
                        </span>
                        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{p.total}p</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          <p className="text-center text-sm text-gray-400">
            Poäng räknas ut efter att admin rättat matcherna.{' '}
            <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>
              Se scoreboard →
            </Link>
          </p>

        </div>
      )}
    </div>
  )
}
