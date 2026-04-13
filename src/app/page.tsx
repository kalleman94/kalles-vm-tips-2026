'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ParticipantScore } from '@/lib/types'

const DEFAULT_INFO = `<h2>🏆 Välkommen till VM-tips 2026!</h2>
<p>Tävla mot dina vänner om att tippa rätt i fotbolls-VM 2026! Den med flest poäng vinner potten. Insatsen är <strong>100 kr</strong> – swishas till spelansvarig senast 1 dygn innan turneringen startar.</p>
<h3>Poängsystem – snabbguide</h3>
<ul>
  <li>⚽ <strong>Gruppspel &amp; slutspel:</strong> Rätt antal mål hemma/borta = 2p vardera · Rätt utfall (1/X/2) = 3p · Max 7p per match.</li>
  <li>🏟️ <strong>Slutspelsbonus:</strong> Rätt vinnare i Semifinal +6p · Bronsmatch +8p · Final +8p.</li>
  <li>🎯 <strong>Bonusfrågor:</strong> VM-vinnare 20p · Skyttekung 20p · Bronsmedaljör 10p.</li>
  <li>💰 <strong>Prispott:</strong> 🥇 1:a plats 60% · 🥈 2:a plats 25% · 🥉 3:e plats 15%.</li>
</ul>
<p>📋 Läs de fullständiga reglerna under <a href="/regler">Regler</a>.</p>`

export default function ScoreboardPage() {
  const [scores, setScores] = useState<ParticipantScore[]>([])
  const [loading, setLoading] = useState(true)
  const [infoContent, setInfoContent] = useState('')
  const [infoVisible, setInfoVisible] = useState(false)
  const supabase = createClient()

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
    const { data } = await supabase
      .from('scores')
      .select('*, participants(name)')
      .order('total_points', { ascending: false })
    if (data) {
      setScores(data.map((row: any) => ({
        participant_id: row.participant_id,
        participant_name: row.participants?.name ?? '-',
        total_points: row.total_points ?? 0,
        group_points: row.group_points ?? 0,
        knockout_points: row.knockout_points ?? 0,
        bonus_points: row.bonus_points ?? 0,
      })))
    }
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
