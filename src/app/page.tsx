'use client'
export const dynamic = 'force-dynamic'
import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ParticipantScore, Match, Prediction, MatchResult, Participant } from '@/lib/types'
import { DEFAULT_INFO } from '@/lib/defaults'
import { calculateMatchPoints, calculateKnockoutPoints } from '@/lib/scoring'
import { getMatchDayDate } from '@/lib/matchday'
import { clientGatePass } from '@/lib/gate'
import { buildResolvedTeams } from '@/lib/bracket'

const KNOCKOUT_PHASE_LABELS: Record<string, string> = {
  r16: 'Åttondelsfinaler',
  qf: 'Kvartsfinaler',
  sf: 'Semifinaler',
  bronze: 'Bronsmatch',
  final: 'Final',
}
const KNOCKOUT_PHASES = ['r16', 'qf', 'sf', 'bronze', 'final']

function getCurrentKnockoutPhase(allMatches: Match[], matchResults: Record<number, MatchResult>): string {
  let current = 'r16'
  for (const phase of KNOCKOUT_PHASES) {
    const pm = allMatches.filter(m => m.phase === phase)
    if (pm.length === 0) continue
    current = phase
    if (!pm.every(m => matchResults[m.id])) break
  }
  return current
}

// Visa den aktuella fasen + nästa fas (max 2 faser åt gången), t.ex. Brons + Final i slutet av turneringen.
function getVisibleKnockoutPhases(allMatches: Match[], matchResults: Record<number, MatchResult>): string[] {
  const current = getCurrentKnockoutPhase(allMatches, matchResults)
  const idx = KNOCKOUT_PHASES.indexOf(current)
  const next = KNOCKOUT_PHASES[idx + 1]
  const phases = [current]
  if (next && allMatches.some(m => m.phase === next)) phases.push(next)
  return phases
}

function getMatchPoints(pred: Prediction | undefined, match: Match, result: MatchResult | undefined): number {
  if (!result || !pred) return 0
  return calculateMatchPoints(pred, result) + calculateKnockoutPoints(match.phase, pred.predicted_winner ?? null, result.winner ?? null)
}

function KnockoutRoundTips({
  allMatches,
  matchResults,
  predictions,
  isLoading,
  knockoutTipsVisible,
}: {
  allMatches: Match[]
  matchResults: Record<number, MatchResult>
  predictions: Prediction[]
  isLoading: boolean
  knockoutTipsVisible: boolean
}) {
  if (!knockoutTipsVisible) {
    return (
      <div className="px-4 py-3 bg-blue-50 border-t">
        <p className="text-sm text-gray-500 py-1">🔒 Tipsen för slutspelet är dolda.</p>
      </div>
    )
  }

  const matchesByNum = new Map<number, Match>()
  allMatches.forEach(m => matchesByNum.set(m.match_number, m))

  const visiblePhases = getVisibleKnockoutPhases(allMatches, matchResults)
  const visibleMatches = allMatches
    .filter(m => visiblePhases.includes(m.phase))
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

  const predMap: Record<number, Prediction> = {}
  predictions.forEach(p => { predMap[p.match_id] = p })

  const resolvedTeams = buildResolvedTeams(allMatches, predMap)

  return (
    <div className="px-4 py-3 bg-blue-50 border-t">
      {isLoading ? (
        <p className="text-sm text-gray-400 py-1">Laddar tips...</p>
      ) : visibleMatches.length === 0 ? (
        <p className="text-sm text-gray-500 py-1">Inga slutspelsmatcher ännu.</p>
      ) : (
        <div className="space-y-3">
          {visiblePhases.map(phase => {
            const phaseMatches = visibleMatches.filter(m => m.phase === phase)
            if (phaseMatches.length === 0) return null
            return (
              <div key={phase} className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {KNOCKOUT_PHASE_LABELS[phase] ?? phase}
                </p>
                {phaseMatches.map(m => {
                  const pred = predMap[m.id]
                  const result = matchResults[m.id]
                  const hasTip = pred && pred.home_goals != null && pred.away_goals != null
                  const tipScore = hasTip ? `${pred.home_goals}–${pred.away_goals}` : '?–?'
                  const gateOk = clientGatePass(m, predictions, matchesByNum)
                  const pts = gateOk ? getMatchPoints(pred, m, result) : 0
                  const resolved = resolvedTeams[m.id]
                  const displayHome = resolved?.home ?? m.home_team
                  const displayAway = resolved?.away ?? m.away_team

                  return (
                    <div key={m.id} className="text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-gray-600 min-w-0">
                          <span className="text-xs text-gray-400 shrink-0 w-14">
                            {new Date(m.match_date).toLocaleDateString('sv-SE', {
                              timeZone: 'Europe/Stockholm', month: 'short', day: 'numeric',
                            })}
                          </span>
                          <span className="truncate">{displayHome}</span>
                          <span className="text-gray-400 shrink-0">–</span>
                          <span className="truncate">{displayAway}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold" style={{ color: hasTip ? 'var(--color-primary)' : '#9ca3af' }}>
                            {tipScore}
                          </span>
                          {result && gateOk && (
                            <span className="text-xs text-gray-500">
                              ({result.home_goals}–{result.away_goals})
                            </span>
                          )}
                          {result ? (
                            <span className="text-xs font-bold" style={{ color: !gateOk ? '#dc2626' : pts >= 7 ? '#16a34a' : pts >= 5 ? 'var(--color-primary)' : pts > 0 ? '#f59e0b' : '#dc2626' }}>
                              {!gateOk ? '❌ 0p (fel lag)' : `${pts}p`}
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: gateOk ? '#16a34a' : '#dc2626', backgroundColor: gateOk ? '#dcfce7' : '#fee2e2' }}>
                              {gateOk ? '✅ Rätt lag' : '❌ Fel lag'}
                            </span>
                          )}
                        </div>
                      </div>
                      {!gateOk && result && (
                        <div className="ml-16 text-xs text-gray-400 mt-0.5">
                          Faktiskt: <span className="font-medium">{m.home_team} – {m.away_team}</span>
                          {' '}({result.home_goals}–{result.away_goals})
                        </div>
                      )}
                      {pred?.predicted_winner && (
                        <div className="ml-16 text-xs text-gray-500 mt-0.5">
                          Vinnare: <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{pred.predicted_winner}</span>
                          {result?.winner && gateOk && (
                            <span className="ml-1 font-bold" style={{ color: pred.predicted_winner === result.winner ? '#16a34a' : '#dc2626' }}>
                              {pred.predicted_winner === result.winner ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
      <div className="mt-3 pt-2 border-t border-blue-100">
        <Link
          href="/idag"
          className="text-xs font-semibold hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Se allas tips idag →
        </Link>
      </div>
    </div>
  )
}

function TodayHighlights({
  todaysMatches,
  allMatches,
  matchResults,
  allPredictions,
  participants,
}: {
  todaysMatches: Match[]
  allMatches: Match[]
  matchResults: Record<number, MatchResult>
  allPredictions: Record<string, Record<number, Prediction>>
  participants: Participant[]
}) {
  const matchesWithResults = todaysMatches.filter(m => matchResults[m.id])
  if (matchesWithResults.length === 0) return null

  const matchesByNum = new Map<number, Match>()
  allMatches.forEach(m => matchesByNum.set(m.match_number, m))

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">🔥 Idag</h2>
        <Link href="/idag" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
          Alla tips idag →
        </Link>
      </div>
      <div className="space-y-3">
        {matchesWithResults.map(m => {
          const result = matchResults[m.id]
          const winners7: Array<{ name: string; pts: number }> = []
          const winners5: Array<{ name: string; pts: number }> = []
          participants.forEach(p => {
            const predArr = Object.values(allPredictions[p.id] ?? {})
            const pred = allPredictions[p.id]?.[m.id]
            const gateOk = clientGatePass(m, predArr, matchesByNum)
            const pts = gateOk ? getMatchPoints(pred, m, result) : 0
            if (pts >= 7) winners7.push({ name: p.name, pts })
            else if (pts >= 5) winners5.push({ name: p.name, pts })
          })
          if (winners7.length === 0 && winners5.length === 0) return null
          return (
            <div key={m.id}>
              <p className="text-xs text-gray-500 mb-1">
                <span className="font-semibold text-gray-700">{m.home_team} – {m.away_team}</span>
                <span className="ml-2 text-gray-400">{result.home_goals}–{result.away_goals}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {winners7.map(({ name, pts }) => (
                  <span key={name} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    {pts}p {name}
                  </span>
                ))}
                {winners5.map(({ name, pts }) => (
                  <span key={name} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {pts}p {name}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MatchOverview({
  matches,
  matchResults,
}: {
  matches: Match[]
  matchResults: Record<number, MatchResult>
}) {
  const played = matches
    .filter(m => matchResults[m.id])
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    .slice(-6)

  const upcoming = matches
    .filter(m => !matchResults[m.id])
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    .slice(0, 5)

  if (played.length === 0 && upcoming.length === 0) return null

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm', month: 'short', day: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">📅 Matcher</h2>

      {played.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Senaste resultat</p>
          <div className="space-y-1.5">
            {played.map(m => {
              const r = matchResults[m.id]
              const isDraw = r.home_goals === r.away_goals
              return (
                <div key={m.id} className="flex items-center gap-2 text-sm min-w-0">
                  <span className="text-xs text-gray-400 shrink-0">
                    <span className="hidden sm:inline">{fmtDate(m.match_date)} </span>
                    {fmtTime(m.match_date)}
                  </span>
                  <span className="flex-1 text-gray-700 truncate min-w-0">
                    {m.home_team} – {m.away_team}
                  </span>
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-primary)' }}>
                    {r.home_goals}–{r.away_goals}
                    {isDraw && r.winner && <span className="font-normal text-xs text-gray-500 ml-1">({r.winner})</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {played.length > 0 && upcoming.length > 0 && <div className="border-t border-gray-100 my-2" />}

      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Kommande matcher</p>
          <div className="space-y-1.5">
            {upcoming.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-sm min-w-0">
                <span className="text-xs text-gray-400 shrink-0">
                  <span className="hidden sm:inline">{fmtDate(m.match_date)} </span>
                  {fmtTime(m.match_date)}
                </span>
                <span className="flex-1 text-gray-600 truncate min-w-0">
                  {m.home_team} – {m.away_team}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ScoreboardPage() {
  const [scores, setScores] = useState<ParticipantScore[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [infoContent, setInfoContent] = useState('')
  const [infoVisible, setInfoVisible] = useState(false)
  const [groupTipsVisible, setGroupTipsVisible] = useState(true)
  const [knockoutTipsVisible, setKnockoutTipsVisible] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [matchResults, setMatchResults] = useState<Record<number, MatchResult>>({})
  const [allPredictions, setAllPredictions] = useState<Record<string, Record<number, Prediction>>>({})
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [dropdownCache, setDropdownCache] = useState<Record<string, Prediction[]>>({})
  const [loadingDropdown, setLoadingDropdown] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!infoContent) return
    const container = document.querySelector('.content-area')
    if (!container) return
    container.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script')
      newScript.textContent = oldScript.textContent
      oldScript.replaceWith(newScript)
    })
  }, [infoContent])

  useEffect(() => {
    fetchScores()
    fetchInfo()
    fetchMatchData()
    const channel = supabase
      .channel('scores')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, fetchScores)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchInfo() {
    const { data } = await supabase.from('settings').select('key, value').in('key', ['info_box_content', 'info_box_visible', 'group_tips_visible', 'knockout_tips_visible'])
    const map: Record<string, string> = {}
    data?.forEach((s: any) => { map[s.key] = s.value })
    setInfoContent(map['info_box_content'] ?? DEFAULT_INFO)
    setInfoVisible(map['info_box_visible'] === 'true')
    if (map['group_tips_visible'] !== undefined) setGroupTipsVisible(map['group_tips_visible'] !== 'false')
    if (map['knockout_tips_visible'] !== undefined) setKnockoutTipsVisible(map['knockout_tips_visible'] === 'true')
  }

  async function fetchMatchData() {
    const [{ data: matchData }, { data: resultData }] = await Promise.all([
      supabase.from('matches').select('*').order('match_date'),
      supabase.from('match_results').select('*'),
    ])
    if (matchData) setMatches(matchData)
    if (resultData) {
      const map: Record<number, MatchResult> = {}
      resultData.forEach((r: MatchResult) => { map[r.match_id] = r })
      setMatchResults(map)

      // Fetch all participants' predictions with pagination (Supabase max 1000 rows per query)
      const batchSize = 1000
      let allPreds: Prediction[] = []
      let from = 0
      while (true) {
        const { data: batch } = await supabase.from('predictions').select('*').range(from, from + batchSize - 1)
        if (!batch || batch.length === 0) break
        allPreds = allPreds.concat(batch)
        if (batch.length < batchSize) break
        from += batchSize
      }
      const predMap: Record<string, Record<number, Prediction>> = {}
      allPreds.forEach((p: Prediction) => {
        if (!predMap[p.participant_id]) predMap[p.participant_id] = {}
        predMap[p.participant_id][p.match_id] = p
      })
      setAllPredictions(predMap)
    }
  }

  async function fetchScores() {
    const [{ data: scoreData }, { data: participantData }] = await Promise.all([
      supabase.from('scores').select('*, participants(name)'),
      supabase.from('participants').select('id, name').order('name'),
    ])

    const scoreMap: Record<string, any> = {}
    scoreData?.forEach((row: any) => { scoreMap[row.participant_id] = row })

    const merged = (participantData ?? []).map((p: any) => {
      const s = scoreMap[p.id]
      return {
        participant_id: p.id,
        participant_name: p.name,
        total_points: s?.total_points ?? 0,
        group_points: s?.group_points ?? 0,
        knockout_points: s?.knockout_points ?? 0,
        bonus_points: s?.bonus_points ?? 0,
      }
    }).sort((a: ParticipantScore, b: ParticipantScore) => b.total_points - a.total_points)

    setScores(merged)
    setParticipants((participantData ?? []).map((p: any) => ({ id: p.id, name: p.name, created_at: '' })))
    setLoading(false)
  }

  async function toggleDropdown(participantId: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(participantId)) {
        next.delete(participantId)
      } else {
        next.add(participantId)
      }
      return next
    })
    if (!dropdownCache[participantId]) {
      setLoadingDropdown(participantId)
      const { data } = await supabase.from('predictions').select('*').eq('participant_id', participantId)
      setDropdownCache(prev => ({ ...prev, [participantId]: data ?? [] }))
      setLoadingDropdown(null)
    }
  }

  const todayMatchDay = getMatchDayDate(new Date())
  const todaysMatches = matches.filter(m => getMatchDayDate(new Date(m.match_date)) === todayMatchDay)
  const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`

  return (
    <div>
      {infoVisible && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="content-area" dangerouslySetInnerHTML={{ __html: infoContent }} />
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
          Scoreboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Uppdateras automatiskt i realtid ⚡</p>
      </div>

      <TodayHighlights
        todaysMatches={todaysMatches}
        allMatches={matches}
        matchResults={matchResults}
        allPredictions={allPredictions}
        participants={participants}
      />

      <MatchOverview matches={matches} matchResults={matchResults} />
      {loading ? (
        <div className="text-center py-16 text-gray-400">Laddar...</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">⚽</p>
          <p>Inga poäng registrerade ännu. Tävlingen börjar snart!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Desktop table */}
          <table className="w-full hidden md:table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-primary)' }} className="text-white text-sm">
                <th className="px-4 py-3 text-left w-12">#</th>
                <th className="px-4 py-3 text-left">Deltagare</th>
                <th className="px-4 py-3 text-right">Gruppspel</th>
                <th className="px-4 py-3 text-right">Slutspel</th>
                <th className="px-4 py-3 text-right">Bonus</th>
                <th className="px-4 py-3 text-right font-bold">Totalt</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <Fragment key={s.participant_id}>
                  <tr
                    onClick={() => toggleDropdown(s.participant_id)}
                    className={`border-t cursor-pointer select-none ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-lg">{medal(i)}</td>
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-1">
                        {s.participant_name}
                        <span className="text-gray-400 text-xs ml-1">
                          {expandedIds.has(s.participant_id) ? '▲' : '▼'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{s.group_points}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{s.knockout_points}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{s.bonus_points}</td>
                    <td className="px-4 py-3 text-right font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                      {s.total_points}
                    </td>
                  </tr>
                  {expandedIds.has(s.participant_id) && (
                     <tr>
                       <td colSpan={6} className="p-0">
                         <KnockoutRoundTips
                          allMatches={matches}
                          matchResults={matchResults}
                          predictions={dropdownCache[s.participant_id] ?? []}
                          isLoading={loadingDropdown === s.participant_id}
                          knockoutTipsVisible={knockoutTipsVisible}
                         />
                       </td>
                     </tr>
                   )}
                </Fragment>
              ))}
            </tbody>
          </table>

          {/* Mobile list */}
          <div className="md:hidden divide-y">
            {scores.map((s, i) => (
              <div key={s.participant_id}>
                <div
                  onClick={() => toggleDropdown(s.participant_id)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none active:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8">{medal(i)}</span>
                    <span className="font-medium">{s.participant_name}</span>
                    <span className="text-gray-400 text-xs">
                      {expandedIds.has(s.participant_id) ? '▲' : '▼'}
                    </span>
                  </div>
                  <span className="font-bold text-xl" style={{ color: 'var(--color-primary)' }}>
                    {s.total_points} p
                  </span>
                </div>
                {expandedIds.has(s.participant_id) && (
                  <KnockoutRoundTips
                    allMatches={matches}
                    matchResults={matchResults}
                    predictions={dropdownCache[s.participant_id] ?? []}
                    isLoading={loadingDropdown === s.participant_id}
                    knockoutTipsVisible={knockoutTipsVisible}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
