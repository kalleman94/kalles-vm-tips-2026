'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase'
import { Participant, Match, Prediction, BonusAnswers, MatchResult, DEFAULT_POINTS } from '@/lib/types'

export default function AllasTipsPage() {
  const supabase = createClient()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [bonus, setBonus] = useState<BonusAnswers | null>(null)
  const [results, setResults] = useState<Record<number, MatchResult>>({})
  const [loading, setLoading] = useState(true)
  const [loadingTips, setLoadingTips] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    supabase.from('participants').select('*').order('name').then(({ data }: { data: any }) => {
      if (data) setParticipants(data)
      setLoading(false)
    })
    supabase.from('matches').select('*').order('match_date').then(({ data }: { data: any }) => {
      if (data) setMatches(data)
    })
    supabase.from('match_results').select('*').then(({ data }: { data: any }) => {
      if (data) {
        const map: Record<number, MatchResult> = {}
        data.forEach((r: MatchResult) => { map[r.match_id] = r })
        setResults(map)
      }
    })
  }, [])

  async function selectParticipant(id: string) {
    setSelected(id)
    setLoadingTips(true)
    const [{ data: predData }, { data: bonusData }] = await Promise.all([
      supabase.from('predictions').select('*').eq('participant_id', id),
      supabase.from('bonus_answers').select('*').eq('participant_id', id).maybeSingle(),
    ])
    setPredictions(predData ?? [])
    setBonus(bonusData)
    setLoadingTips(false)
  }

  async function downloadAllTips() {
    setDownloading(true)

    // Fetch all predictions with pagination to avoid 1000-row server limit
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

    const [allPreds, { data: allBonus }] = await Promise.all([
      fetchAllPredictions(),
      supabase.from('bonus_answers').select('*'),
    ])

    const predsByParticipant: Record<string, Record<number, Prediction>> = {}
    allPreds?.forEach((p: Prediction) => {
      if (!predsByParticipant[p.participant_id]) predsByParticipant[p.participant_id] = {}
      predsByParticipant[p.participant_id][p.match_id] = p
    })
    const bonusByParticipant: Record<string, BonusAnswers> = {}
    allBonus?.forEach((b: BonusAnswers) => { bonusByParticipant[b.participant_id] = b })

    const phaseLabel: Record<string, string> = {
      group: 'Grupp', r32: 'Sexton', r16: 'Åttondel', qf: 'Kvart', sf: 'Semi', bronze: 'Brons', final: 'Final'
    }

    const wb = XLSX.utils.book_new()
    const groupMatches = matches.filter(m => m.phase === 'group')
    const koMatches = matches.filter(m => m.phase !== 'group')

    participants.forEach(participant => {
      const preds = predsByParticipant[participant.id] ?? {}
      const bonus = bonusByParticipant[participant.id]
      const rows: (string | number)[][] = []

      // Bonus questions
      rows.push(['Bonusfrågor', '', ''])
      rows.push(['VM-vinnare', bonus?.champion || '–', ''])
      rows.push(['Skyttekung', bonus?.top_scorer || '–', ''])
      rows.push(['Bronsmatch', bonus?.third_place || '–', ''])
      rows.push([])

      // Group stage header
      rows.push(['Grupp', 'Hemmalag', 'Tips', 'Bortalag'])
      groupMatches.forEach(m => {
        const pred = preds[m.id]
        const tips = (pred && pred.home_goals != null && pred.away_goals != null)
          ? `${pred.home_goals} – ${pred.away_goals}`
          : '–'
        rows.push([`Grupp ${m.group_name ?? ''}`, m.home_team, tips, m.away_team])
      })

      rows.push([])

      // Knockout stage header
      if (koMatches.length > 0) {
        rows.push(['Omgång', 'Hemmalag', 'Tips', 'Bortalag', 'Vinnartips'])
        koMatches.forEach(m => {
          const pred = preds[m.id]
          const tips = (pred && pred.home_goals != null && pred.away_goals != null)
            ? `${pred.home_goals} – ${pred.away_goals}`
            : '–'
          rows.push([
            phaseLabel[m.phase] ?? m.phase,
            m.home_team,
            tips,
            m.away_team,
            pred?.predicted_winner || '–',
          ])
        })
      }

      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws['!cols'] = [
        { wch: 14 }, // Grupp/Omgång
        { wch: 22 }, // Hemmalag
        { wch: 8 },  // Tips
        { wch: 22 }, // Bortalag
        { wch: 22 }, // Vinnartips
      ]

      const sheetName = participant.name.replace(/[/\\?*[\]:]/g, '').substring(0, 31)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buf], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vm-tips-2026.xlsx'
    a.click()
    URL.revokeObjectURL(url)
    setDownloading(false)
  }

  const selectedName = participants.find(p => p.id === selected)?.name
  const predMap: Record<number, Prediction> = {}
  predictions.forEach(p => { predMap[p.match_id] = p })
  const groupMatches = matches.filter(m => m.phase === 'group')
  const knockoutMatches = matches.filter(m => m.phase !== 'group')
  const groups = [...new Set(groupMatches.map(m => m.group_name))].sort()

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
          Inlämnade tips
        </h1>
        <button
          onClick={downloadAllTips}
          disabled={downloading || matches.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 shadow"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {downloading ? '⏳ Laddar ner...' : '⬇️ Ladda ner allas tips'}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Laddar...</p>
      ) : (
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Participant list */}
          <div className="md:w-48 shrink-0">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                Deltagare
              </div>
              <div className="divide-y max-h-[60vh] overflow-y-auto">
                {participants.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectParticipant(p.id)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      selected === p.id ? 'font-semibold' : 'hover:bg-gray-50'
                    }`}
                    style={selected === p.id ? { backgroundColor: '#EEF2FF', color: 'var(--color-primary)' } : {}}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips view */}
          <div className="flex-1">
            {!selected && (
              <div className="text-gray-400 text-center py-16">
                <p className="text-3xl mb-2">👆</p>
                <p>Välj en deltagare för att se deras tips</p>
              </div>
            )}
            {selected && loadingTips && <p className="text-gray-400">Laddar tips...</p>}
            {selected && !loadingTips && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">{selectedName}</h2>

                {/* Bonus */}
                {bonus && (
                  <div className="bg-white rounded-xl shadow p-4">
                    <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-primary)' }}>Bonusfrågor</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-gray-500">🏆 VM-vinnare:</span> <strong>{bonus.champion || '–'}</strong></div>
                      <div><span className="text-gray-500">⚽ Skyttekung:</span> <strong>{bonus.top_scorer || '–'}</strong></div>
                      <div><span className="text-gray-500">🥉 Bronsmatch:</span> <strong>{bonus.third_place || '–'}</strong></div>
                    </div>
                  </div>
                )}

                {/* Group matches */}
                {groups.map(g => (
                  <div key={g} className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                      Grupp {g}
                    </div>
                    <div className="divide-y">
                      {groupMatches.filter(m => m.group_name === g).map(m => {
                        const p = predMap[m.id]
                        return (
                          <div key={m.id} className="px-4 py-2 text-sm">
                            <div className="flex items-start gap-3">
                              <span className="text-gray-400 w-24 shrink-0 text-xs leading-tight pt-0.5">
                                <span className="block">{new Date(m.match_date).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm', month: 'short', day: 'numeric' })}</span>
                                <span className="block">{new Date(m.match_date).toLocaleTimeString('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                              <div className="flex-1">
                                <div className="flex gap-2 mb-1 sm:hidden">
                                  <span className="flex-1 min-w-0 truncate">{m.home_team}</span>
                                  <span className="flex-1 min-w-0 truncate text-right">{m.away_team}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="hidden sm:block flex-1 text-right">{m.home_team}</span>
                                  <span className="font-mono font-bold w-12 text-center">
                                    {p ? `${p.home_goals ?? '?'} – ${p.away_goals ?? '?'}` : '? – ?'}
                                  </span>
                                  <div className="hidden sm:flex flex-1 items-center gap-2">
                                    <span>{m.away_team}</span>
                                    <PointsBadge info={getMatchPointInfo(p, results[m.id], m)} />
                                  </div>
                                  <div className="flex-1 flex justify-end sm:hidden">
                                    <PointsBadge info={getMatchPointInfo(p, results[m.id], m)} />
                                  </div>
                                </div>
                                {results[m.id] && (
                                  <div className="mt-1 text-xs text-center text-gray-400">
                                   Facit: <span className="font-medium text-gray-500">{results[m.id].home_goals} – {results[m.id].away_goals}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Knockout */}
                {knockoutMatches.length > 0 && (
                  <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
                      Slutspel
                    </div>
                    <div className="divide-y">
                      {knockoutMatches.map(m => {
                        const p = predMap[m.id]
                        return (
                          <div key={m.id} className="px-4 py-2 text-sm">
                            <div className="flex items-start gap-3">
                              <span className="text-gray-400 w-20 shrink-0 text-xs capitalize pt-0.5">{m.phase}</span>
                              <div className="flex-1">
                                <div className="flex gap-2 mb-1 sm:hidden">
                                  <span className="flex-1 min-w-0 truncate">{m.home_team}</span>
                                  <span className="flex-1 min-w-0 truncate text-right">{m.away_team}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="hidden sm:block flex-1 text-right">{m.home_team}</span>
                                  <span className="font-mono font-bold w-12 text-center">
                                    {p ? `${p.home_goals ?? '?'} – ${p.away_goals ?? '?'}` : '? – ?'}
                                  </span>
                                  <div className="hidden sm:flex flex-1 items-center gap-2">
                                    <span>{m.away_team}</span>
                                    <PointsBadge info={getMatchPointInfo(p, results[m.id], m)} />
                                  </div>
                                  <div className="flex-1 flex justify-end sm:hidden">
                                    <PointsBadge info={getMatchPointInfo(p, results[m.id], m)} />
                                  </div>
                                </div>
                                {results[m.id] && (
                                  <div className="mt-1 text-xs text-center text-gray-400">
                                    Facit: <span className="font-medium text-gray-500">{results[m.id].home_goals} – {results[m.id].away_goals}</span>
                                  </div>
                                )}
                                {p?.predicted_winner && (
                                  <div className="mt-1 text-xs text-gray-500 text-center sm:text-left sm:pl-[calc(33.333%+0.75rem)]">
                                    → {p.predicted_winner}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getMatchPointInfo(
  pred: Prediction | undefined,
  result: MatchResult | undefined,
  match: Match
): { points: number; exact: boolean } | null {
  if (!result) return null
  if (!pred || pred.home_goals === null || pred.home_goals === undefined ||
      pred.away_goals === null || pred.away_goals === undefined) return { points: 0, exact: false }
  const sign = (h: number, a: number) => h > a ? '1' : h === a ? 'X' : '2'
  let points = 0
  const homeCorrect = pred.home_goals === result.home_goals
  const awayCorrect = pred.away_goals === result.away_goals
  if (homeCorrect) points += DEFAULT_POINTS.correct_home_goals
  if (awayCorrect) points += DEFAULT_POINTS.correct_away_goals
  if (sign(pred.home_goals, pred.away_goals) === sign(result.home_goals, result.away_goals))
    points += DEFAULT_POINTS.correct_sign
  if (match.phase !== 'group' && pred.predicted_winner && result.winner &&
      pred.predicted_winner === result.winner) {
    const bonus: Record<string, number> = {
      r32: DEFAULT_POINTS.r32_team, r16: DEFAULT_POINTS.r16_team, qf: DEFAULT_POINTS.qf_team,
      sf: DEFAULT_POINTS.sf_team, bronze: DEFAULT_POINTS.bronze_team, final: DEFAULT_POINTS.final_team,
    }
    points += bonus[match.phase] ?? 0
  }
  return { points, exact: homeCorrect && awayCorrect }
}

function PointsBadge({ info }: { info: { points: number; exact: boolean } | null }) {
  if (!info) return null
  if (info.points === 0) return <span className="text-xs font-bold text-red-500 shrink-0">✗ 0p</span>
  if (info.exact) return <span className="text-xs font-bold text-green-600 shrink-0">✓ {info.points}p</span>
  return <span className="text-xs font-bold text-orange-500 shrink-0">~ {info.points}p</span>
}
