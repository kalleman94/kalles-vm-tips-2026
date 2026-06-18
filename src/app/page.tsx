'use client'
export const dynamic = 'force-dynamic'
import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ParticipantScore, Match, Prediction, MatchResult } from '@/lib/types'
import { DEFAULT_INFO } from '@/lib/defaults'

function TodaysTips({
  participantId,
  todaysMatches,
  matchResults,
  predictions,
  isLoading,
}: {
  participantId: string
  todaysMatches: Match[]
  matchResults: Record<number, MatchResult>
  predictions: Prediction[]
  isLoading: boolean
}) {
  const predMap: Record<number, Prediction> = {}
  predictions.forEach(p => { predMap[p.match_id] = p })

  const isKnockout = (phase: string) => phase !== 'group'

  return (
    <div className="px-4 py-3 bg-blue-50 border-t">
      {isLoading ? (
        <p className="text-sm text-gray-400 py-1">Laddar tips...</p>
      ) : todaysMatches.length === 0 ? (
        <p className="text-sm text-gray-500 py-1">Inga matcher idag.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dagens matcher</p>
          {todaysMatches.map(m => {
            const pred = predMap[m.id]
            const result = matchResults[m.id]
            const hasTip = pred && pred.home_goals != null && pred.away_goals != null
            const tipScore = hasTip ? `${pred.home_goals} – ${pred.away_goals}` : '? – ?'
            const knockout = isKnockout(m.phase)
            const predictedWinner = pred?.predicted_winner

            let correctGoals = 0
            let checkmark = ''
            if (result && hasTip) {
              if (pred.home_goals === result.home_goals) correctGoals++
              if (pred.away_goals === result.away_goals) correctGoals++
              const predSign = pred.home_goals! > pred.away_goals! ? '1' : pred.home_goals! < pred.away_goals! ? '2' : 'X'
              const resSign = result.home_goals > result.away_goals ? '1' : result.home_goals < result.away_goals ? '2' : 'X'
              const rightSign = predSign === resSign
              if (correctGoals === 2 && rightSign) checkmark = '✅'
              else if (rightSign || correctGoals > 0) checkmark = '〰️'
              else checkmark = '❌'
            }

            return (
              <div key={m.id} className="text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-gray-600 min-w-0">
                    <span className="text-xs text-gray-400 shrink-0 w-14">
                      {new Date(m.match_date).toLocaleDateString('sv-SE', {
                        timeZone: 'Europe/Stockholm', month: 'short', day: 'numeric',
                      })}
                    </span>
                    <span className="truncate">{m.home_team}</span>
                    <span className="text-gray-400 shrink-0">–</span>
                    <span className="truncate">{m.away_team}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold" style={{ color: hasTip ? 'var(--color-primary)' : '#9ca3af' }}>
                      {tipScore}
                    </span>
                    {result && (
                      <span className="text-xs text-gray-500">
                        ({result.home_goals}–{result.away_goals} {checkmark})
                      </span>
                    )}
                  </div>
                </div>
                {knockout && predictedWinner && (
                  <div className="ml-16 text-xs text-gray-500 mt-0.5">
                    Vinnare: <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{predictedWinner}</span>
                    {result?.winner && (
                      <span className="ml-1">{predictedWinner === result.winner ? '✅' : '❌'}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="mt-3 pt-2 border-t border-blue-100">
        <Link
          href={`/idag`}
          className="text-xs font-semibold hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Se allas tips idag →
        </Link>
      </div>
    </div>
  )
}

export default function ScoreboardPage() {
  const [scores, setScores] = useState<ParticipantScore[]>([])
  const [loading, setLoading] = useState(true)
  const [infoContent, setInfoContent] = useState('')
  const [infoVisible, setInfoVisible] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [matchResults, setMatchResults] = useState<Record<number, MatchResult>>({})
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
    const { data } = await supabase.from('settings').select('key, value').in('key', ['info_box_content', 'info_box_visible'])
    const map: Record<string, string> = {}
    data?.forEach((s: any) => { map[s.key] = s.value })
    setInfoContent(map['info_box_content'] ?? DEFAULT_INFO)
    setInfoVisible(map['info_box_visible'] === 'true')
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

  const todayUTC = new Date().toISOString().slice(0, 10)
  const todaysMatches = matches.filter(m => m.match_date.slice(0, 10) === todayUTC)
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
                         <TodaysTips
                           participantId={s.participant_id}
                           todaysMatches={todaysMatches}
                           matchResults={matchResults}
                           predictions={dropdownCache[s.participant_id] ?? []}
                           isLoading={loadingDropdown === s.participant_id}
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
                  <TodaysTips
                    participantId={s.participant_id}
                    todaysMatches={todaysMatches}
                    matchResults={matchResults}
                    predictions={dropdownCache[s.participant_id] ?? []}
                    isLoading={loadingDropdown === s.participant_id}
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
