'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Participant, Match, Prediction, BonusAnswers } from '@/lib/types'

export default function AllasTipsPage() {
  const supabase = createClient()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [bonus, setBonus] = useState<BonusAnswers | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingTips, setLoadingTips] = useState(false)

  useEffect(() => {
    supabase.from('participants').select('*').order('name').then(({ data }: { data: any }) => {
      if (data) setParticipants(data)
      setLoading(false)
    })
    supabase.from('matches').select('*').order('match_date').then(({ data }: { data: any }) => {
      if (data) setMatches(data)
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

  const selectedName = participants.find(p => p.id === selected)?.name
  const predMap: Record<number, Prediction> = {}
  predictions.forEach(p => { predMap[p.match_id] = p })
  const groupMatches = matches.filter(m => m.phase === 'group')
  const knockoutMatches = matches.filter(m => m.phase !== 'group')
  const groups = [...new Set(groupMatches.map(m => m.group_name))].sort()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
        Inlämnade tips
      </h1>

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
                                  <span className="font-mono font-bold w-12 text-center mx-auto sm:mx-0">
                                    {p ? `${p.home_goals ?? '?'} – ${p.away_goals ?? '?'}` : '? – ?'}
                                  </span>
                                  <span className="hidden sm:block flex-1">{m.away_team}</span>
                                </div>
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
                                  <span className="font-mono font-bold w-12 text-center mx-auto sm:mx-0">
                                    {p ? `${p.home_goals ?? '?'} – ${p.away_goals ?? '?'}` : '? – ?'}
                                  </span>
                                  <span className="hidden sm:block flex-1">{m.away_team}</span>
                                </div>
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
