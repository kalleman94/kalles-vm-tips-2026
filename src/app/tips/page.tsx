'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getLockStatus } from '@/lib/lock'
import { Match, Prediction, BonusAnswers, LockStatus } from '@/lib/types'

const PHASES_GROUP = 'group'
const PHASES_KNOCKOUT = ['r32', 'r16', 'qf', 'sf', 'bronze', 'final']

export default function TipsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [participantId, setParticipantId] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<number, Partial<Prediction>>>({})
  const [bonus, setBonus] = useState<Partial<BonusAnswers>>({})
  const [lockStatus, setLockStatus] = useState<LockStatus | null>(null)
  const [knockoutEnabled, setKnockoutEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'group' | 'bonus' | 'knockout'>('group')

  useEffect(() => {
    const id = localStorage.getItem('participant_id')
    const name = localStorage.getItem('participant_name')
    if (!id) { router.push('/login'); return }
    setParticipantId(id)
    setParticipantName(name ?? '')
    setLockStatus(getLockStatus())
    loadData(id)
    // Load settings from DB (knockout_enabled + manual locks)
    createClient().from('settings').select('key, value')
      .then(({ data }: { data: any }) => {
        if (!data) return
        const map: Record<string, string> = {}
        data.forEach((s: any) => { map[s.key] = s.value })
        setKnockoutEnabled(map['knockout_enabled'] === 'true')
        // Manual locks override time-based locks
        setLockStatus(prev => ({
          groupLocked: prev?.groupLocked || map['group_locked'] === 'true',
          knockoutLocked: prev?.knockoutLocked || map['knockout_locked'] === 'true',
          bonusLocked: map['bonus_locked'] === 'true',
          groupLockTime: prev?.groupLockTime ?? '',
          knockoutLockTime: prev?.knockoutLockTime ?? '',
        }))
      })
  }, [])

  async function loadData(pid: string) {
    const [{ data: matchData }, { data: predData }, { data: bonusData }] = await Promise.all([
      supabase.from('matches').select('*').order('match_date'),
      supabase.from('predictions').select('*').eq('participant_id', pid),
      supabase.from('bonus_answers').select('*').eq('participant_id', pid).maybeSingle(),
    ])
    if (matchData) setMatches(matchData)
    if (predData) {
      const map: Record<number, Partial<Prediction>> = {}
      predData.forEach((p: Prediction) => { map[p.match_id] = p })
      setPredictions(map)
    }
    if (bonusData) setBonus(bonusData)
  }

  function setPred(matchId: number, field: 'home_goals' | 'away_goals' | 'predicted_winner', value: string) {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: field === 'predicted_winner' ? value : value === '' ? null : Number(value),
      }
    }))
  }

  async function handleSave() {
    if (!participantId) return
    setSaving(true)

    const predRows = Object.entries(predictions).map(([matchId, pred]) => ({
      participant_id: participantId,
      match_id: Number(matchId),
      home_goals: pred.home_goals ?? null,
      away_goals: pred.away_goals ?? null,
      predicted_winner: pred.predicted_winner ?? null,
    }))

    await supabase.from('predictions').upsert(predRows, { onConflict: 'participant_id,match_id' })

    if (bonus.top_scorer || bonus.champion || bonus.third_place) {
      await supabase.from('bonus_answers').upsert(
        { participant_id: participantId, ...bonus },
        { onConflict: 'participant_id' }
      )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const groupMatches = matches.filter(m => m.phase === PHASES_GROUP)
  const knockoutMatches = matches.filter(m => PHASES_KNOCKOUT.includes(m.phase))
  const groups = [...new Set(groupMatches.map(m => m.group_name))].sort()

  const locked = (phase: string) =>
    phase === 'group' ? lockStatus?.groupLocked : lockStatus?.knockoutLocked

  const phaseLabel: Record<string, string> = {
    r32: 'Sextondelsfinal', r16: 'Åttondelsfinal', qf: 'Kvartsfinal',
    sf: 'Semifinal', bronze: 'Bronsmatch', final: 'Final'
  }

  if (!participantId) return null

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            Mina tips
          </h1>
          <p className="text-gray-500 text-sm mt-1">Inloggad som <strong>{participantName}</strong></p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50"
          style={{ backgroundColor: saved ? 'var(--color-green)' : 'var(--color-primary)' }}
        >
          {saving ? 'Sparar...' : saved ? '✓ Sparat!' : 'Spara tips'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg shadow p-1 w-fit">
        {(['group', 'bonus', 'knockout'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
            style={activeTab === tab ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            {tab === 'group' ? 'Gruppspel' : tab === 'bonus' ? 'Bonusfrågor' : 'Slutspel'}
            {locked(tab === 'knockout' ? 'knockout' : 'group') && tab !== 'knockout'
              ? ' 🔒' : ''}
          </button>
        ))}
      </div>

      {/* Group stage */}
      {activeTab === 'group' && (
        <div className="space-y-6">
          {lockStatus?.groupLocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 text-sm">
              🔒 Gruppspelstips är låsta och kan inte längre ändras.
            </div>
          )}
          {groups.map(g => (
            <div key={g} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                Grupp {g}
              </div>
              <div className="divide-y">
                {groupMatches.filter(m => m.group_name === g).map(m => (
                  <MatchRow key={m.id} match={m} pred={predictions[m.id]} locked={!!lockStatus?.groupLocked}
                    onChangePred={(field, val) => setPred(m.id, field, val)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bonus */}
      {activeTab === 'bonus' && (
        <div className="bg-white rounded-xl shadow p-6 max-w-md">
          {lockStatus?.bonusLocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 text-sm mb-4">
              🔒 Bonusfrågor är låsta.
            </div>
          )}
          <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--color-primary)' }}>
            Bonusfrågor
          </h2>
          {[
            { key: 'champion', label: '🏆 Världsmästare', points: '20 p' },
            { key: 'top_scorer', label: '⚽ Skyttekung', points: '20 p' },
            { key: 'third_place', label: '🥉 Vinnare bronsmatch', points: '10 p' },
          ].map(({ key, label, points }) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-gray-400 font-normal">({points})</span>
              </label>
              <input
                type="text"
                value={(bonus as any)[key] ?? ''}
                onChange={e => setBonus(prev => ({ ...prev, [key]: e.target.value }))}
                disabled={!!lockStatus?.bonusLocked}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Lagnamn eller spelarnamn"
              />
            </div>
          ))}
        </div>
      )}

      {/* Knockout */}
      {activeTab === 'knockout' && (
        <div className="space-y-6">
          {!knockoutEnabled ? (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <p className="text-4xl mb-4">⏳</p>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                Slutspelet är inte öppet än
              </h2>
              <p className="text-gray-500">
                Slutspelet öppnas när gruppspelet är färdigt.
              </p>
              <p className="text-gray-400 text-sm mt-2">På återseende! / SpelAdmin</p>
            </div>
          ) : (
            <>
              {lockStatus?.knockoutLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 text-sm">
                  🔒 Slutspelstips är låsta och kan inte längre ändras.
                </div>
              )}
              {PHASES_KNOCKOUT.map(phase => {
                const phaseMatches = knockoutMatches.filter(m => m.phase === phase)
                if (!phaseMatches.length) return null
                return (
                  <div key={phase} className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
                      {phaseLabel[phase] ?? phase}
                    </div>
                    <div className="divide-y">
                      {phaseMatches.map(m => (
                        <MatchRow key={m.id} match={m} pred={predictions[m.id]} locked={!!lockStatus?.knockoutLocked}
                          onChangePred={(field, val) => setPred(m.id, field, val)} showWinner />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MatchRow({
  match, pred, locked, onChangePred, showWinner = false
}: {
  match: Match
  pred?: Partial<Prediction>
  locked: boolean
  onChangePred: (field: 'home_goals' | 'away_goals' | 'predicted_winner', val: string) => void
  showWinner?: boolean
}) {
  return (
    <div className="px-4 py-3 text-sm">
      <div className="flex items-start gap-3">
        <span className="text-gray-400 w-24 shrink-0 text-xs leading-tight pt-0.5">
          <span className="block">{new Date(match.match_date).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm', month: 'short', day: 'numeric' })}</span>
          <span className="block">{new Date(match.match_date).toLocaleTimeString('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' })}</span>
        </span>
        <div className="flex-1">
          {/* Mobil: lagnamn på rad ovanför */}
          <div className="flex gap-2 mb-2 sm:hidden">
            <span className="font-medium flex-1 min-w-0 truncate">{match.home_team}</span>
            <span className="font-medium flex-1 min-w-0 truncate text-right">{match.away_team}</span>
          </div>
          {/* Resultatrad */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block flex-1 text-right font-medium">{match.home_team}</span>
            <div className="flex items-center gap-1 mx-auto sm:mx-0">
              <input
                type="number" min={0} max={20}
                value={pred?.home_goals ?? ''}
                onChange={e => onChangePred('home_goals', e.target.value)}
                disabled={locked}
                className="w-12 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number" min={0} max={20}
                value={pred?.away_goals ?? ''}
                onChange={e => onChangePred('away_goals', e.target.value)}
                disabled={locked}
                className="w-12 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <span className="hidden sm:block flex-1 font-medium">{match.away_team}</span>
          </div>
          {showWinner && (
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs text-gray-500">Vinnare:</label>
              <input
                type="text"
                value={pred?.predicted_winner ?? ''}
                onChange={e => onChangePred('predicted_winner', e.target.value)}
                disabled={locked}
                placeholder="Lagnamn"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 w-32"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
