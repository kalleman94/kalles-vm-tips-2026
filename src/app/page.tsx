'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ParticipantScore } from '@/lib/types'

import { DEFAULT_INFO } from '@/lib/defaults'

export default function ScoreboardPage() {
  const [scores, setScores] = useState<ParticipantScore[]>([])
  const [loading, setLoading] = useState(true)
  const [infoContent, setInfoContent] = useState('')
  const [infoVisible, setInfoVisible] = useState(false)
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
                <tr key={s.participant_id} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                  <td className="px-4 py-3 text-lg">{medal(i)}</td>
                  <td className="px-4 py-3 font-medium">{s.participant_name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{s.group_points}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{s.knockout_points}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{s.bonus_points}</td>
                  <td className="px-4 py-3 text-right font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                    {s.total_points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="md:hidden divide-y">
            {scores.map((s, i) => (
              <div key={s.participant_id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8">{medal(i)}</span>
                  <span className="font-medium">{s.participant_name}</span>
                </div>
                <span className="font-bold text-xl" style={{ color: 'var(--color-primary)' }}>
                  {s.total_points} p
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
