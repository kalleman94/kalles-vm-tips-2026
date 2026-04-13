'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Match } from '@/lib/types'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [results, setResults] = useState<Record<number, { home: string; away: string; winner: string }>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [teamEdits, setTeamEdits] = useState<Record<number, { home: string; away: string }>>({})
  const [savingTeam, setSavingTeam] = useState<number | null>(null)
  const [savedTeamIds, setSavedTeamIds] = useState<number[]>([])
  const [newParticipant, setNewParticipant] = useState({ name: '', pin: '' })
  const [addingParticipant, setAddingParticipant] = useState(false)
  const [participantMsg, setParticipantMsg] = useState('')

  // Settings state
  const [knockoutEnabled, setKnockoutEnabled] = useState(false)
  const [savingKnockout, setSavingKnockout] = useState(false)
  const [groupLocked, setGroupLocked] = useState(false)
  const [bonusLocked, setBonusLocked] = useState(false)
  const [knockoutLocked, setKnockoutLocked] = useState(false)
  const [savingLock, setSavingLock] = useState<string | null>(null)
  const [bonus, setBonus] = useState({ champion: '', top_scorer: '', third_place: '' })
  const [savingBonus, setSavingBonus] = useState(false)
  const [bonusMsg, setBonusMsg] = useState('')

  // Collapsible sections
  const [teamsOpen, setTeamsOpen] = useState(false)
  const [groupResultsOpen, setGroupResultsOpen] = useState(false)
  const [knockoutResultsOpen, setKnockoutResultsOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      if (data.user) {
        setUser(data.user)
        loadMatches()
        loadSettings()
      }
    })
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setLoginError(error.message); return }
    setUser(data.user)
    loadMatches()
    loadSettings()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function loadSettings() {
    const { data } = await supabase.from('settings').select('key, value')
    if (!data) return
    const map: Record<string, string> = {}
    data.forEach((s: any) => { map[s.key] = s.value })
    setKnockoutEnabled(map['knockout_enabled'] === 'true')
    setGroupLocked(map['group_locked'] === 'true')
    setBonusLocked(map['bonus_locked'] === 'true')
    setKnockoutLocked(map['knockout_locked'] === 'true')
    setBonus({
      champion: map['actual_champion'] ?? '',
      top_scorer: map['actual_top_scorer'] ?? '',
      third_place: map['actual_third_place'] ?? '',
    })
  }

  async function toggleSetting(key: string, current: boolean, setter: (v: boolean) => void) {
    setSavingLock(key)
    const newVal = !current
    const { error } = await supabase.from('settings').upsert({ key, value: String(newVal) }, { onConflict: 'key' })
    if (error) {
      alert('Kunde inte spara: ' + error.message)
    } else {
      setter(newVal)
    }
    setSavingLock(null)
  }

  async function saveBonus(e: React.FormEvent) {
    e.preventDefault()
    setSavingBonus(true)
    await Promise.all([
      supabase.from('settings').upsert({ key: 'actual_champion', value: bonus.champion }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'actual_top_scorer', value: bonus.top_scorer }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'actual_third_place', value: bonus.third_place }, { onConflict: 'key' }),
    ])
    await fetch('/api/recalculate', { method: 'POST' })
    setSavingBonus(false)
    setBonusMsg('✓ Bonussvar sparade och poäng uppdaterade!')
    setTimeout(() => setBonusMsg(''), 4000)
  }

  async function loadMatches() {
    const [{ data: matchData }, { data: resultData }] = await Promise.all([
      supabase.from('matches').select('*').order('match_date'),
      supabase.from('match_results').select('*'),
    ])
    if (matchData) {
      setMatches(matchData)
      const map: Record<number, { home: string; away: string; winner: string }> = {}
      const teamMap: Record<number, { home: string; away: string }> = {}
      matchData.forEach((m: any) => {
        const r = resultData?.find((r: any) => r.match_id === m.id)
        map[m.id] = r
          ? { home: String(r.home_goals ?? ''), away: String(r.away_goals ?? ''), winner: r.winner ?? '' }
          : { home: '', away: '', winner: '' }
        teamMap[m.id] = { home: m.home_team, away: m.away_team }
      })
      setResults(map)
      setTeamEdits(teamMap)
    }
  }

  async function saveResult(matchId: number) {
    const r = results[matchId]
    if (r.home === '' || r.away === '') return
    setSaving(matchId)
    await supabase.from('match_results').upsert(
      { match_id: matchId, home_goals: Number(r.home), away_goals: Number(r.away), winner: r.winner || null },
      { onConflict: 'match_id' }
    )
    await fetch('/api/recalculate', { method: 'POST' })
    setSaving(null)
    setSavedIds(prev => [...prev, matchId])
    setTimeout(() => setSavedIds(prev => prev.filter(id => id !== matchId)), 3000)
  }

  async function saveTeam(matchId: number) {
    const t = teamEdits[matchId]
    if (!t?.home.trim() || !t?.away.trim()) return
    setSavingTeam(matchId)
    const { error } = await supabase.from('matches')
      .update({ home_team: t.home.trim(), away_team: t.away.trim() })
      .eq('id', matchId)
    if (error) alert('Fel: ' + error.message)
    setSavingTeam(null)
    setSavedTeamIds(prev => [...prev, matchId])
    setTimeout(() => setSavedTeamIds(prev => prev.filter(id => id !== matchId)), 3000)
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, home_team: t.home.trim(), away_team: t.away.trim() } : m))
  }

  async function addParticipant(e: React.FormEvent) {
    e.preventDefault()
    setAddingParticipant(true)
    const { error } = await supabase.from('participants').insert({
      name: newParticipant.name.trim(),
      pin_hash: newParticipant.pin,
    })
    setAddingParticipant(false)
    if (error) {
      setParticipantMsg(`Fel: ${error.message}`)
    } else {
      setParticipantMsg(`✓ ${newParticipant.name} tillagd!`)
      setNewParticipant({ name: '', pin: '' })
    }
    setTimeout(() => setParticipantMsg(''), 4000)
  }

  const groupMatches = matches.filter(m => m.phase === 'group')
  const knockoutMatches = matches.filter(m => m.phase !== 'group')
  const phaseLabel: Record<string, string> = {
    r32: 'R32', r16: 'R16', qf: 'Kvartsfinal', sf: 'Semifinal', bronze: 'Bronsmatch', final: 'Final'
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto mt-12">
        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
            Admin – Logga in
          </h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="E-post" required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Lösenord" required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
            <button type="submit" className="py-2 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-primary)' }}>
              Logga in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Adminpanel</h1>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">Logga ut</button>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow p-5 mb-8">
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--color-primary)' }}>⚙️ Inställningar</h2>

        {/* Lock toggles */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lås tippningar</p>
        {[
          { key: 'group_locked',    label: 'Lås gruppspel',    value: groupLocked,    setter: setGroupLocked,    icon: '⚽' },
          { key: 'bonus_locked',    label: 'Lås bonusfrågor',  value: bonusLocked,    setter: setBonusLocked,    icon: '🏆' },
          { key: 'knockout_locked', label: 'Lås slutspel',     value: knockoutLocked, setter: setKnockoutLocked, icon: '🔝' },
        ].map(({ key, label, value, setter, icon }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
            <div>
              <p className="font-medium text-sm">{icon} {label}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {value ? '🔒 Låst – deltagare kan inte längre ändra sina tips' : '🔓 Öppet – deltagare kan tippa fritt'}
              </p>
            </div>
            <button
              onClick={() => toggleSetting(key, value, setter)}
              disabled={savingLock === key}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
                value ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}

        {/* Knockout enabled toggle */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-4">Synlighet</p>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <p className="font-medium text-sm">🏟️ Aktivera slutspelstips</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {knockoutEnabled
                ? '✅ Öppet – deltagare kan se och fylla i slutspelstips'
                : '🔒 Dolt – deltagare ser ett "öppnas snart"-meddelande'}
            </p>
          </div>
          <button
            onClick={() => toggleSetting('knockout_enabled', knockoutEnabled, setKnockoutEnabled)}
            disabled={savingLock === 'knockout_enabled'}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
              knockoutEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              knockoutEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Add participant */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-4">Deltagare</p>
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="font-medium text-sm mb-3">👤 Lägg till deltagare</p>
          <form onSubmit={addParticipant} className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Namn</label>
              <input
                type="text" value={newParticipant.name} onChange={e => setNewParticipant(p => ({ ...p, name: e.target.value }))}
                required placeholder="Deltagarens namn"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PIN-kod</label>
              <input
                type="text" value={newParticipant.pin} onChange={e => setNewParticipant(p => ({ ...p, pin: e.target.value }))}
                required placeholder="t.ex. 1234" maxLength={10}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
              />
            </div>
            <button type="submit" disabled={addingParticipant}
              className="py-2 px-4 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-green)' }}>
              {addingParticipant ? 'Lägger till...' : 'Lägg till'}
            </button>
            {participantMsg && <span className="text-sm text-green-700">{participantMsg}</span>}
          </form>
        </div>

        {/* Bonus answers */}
        <form onSubmit={saveBonus}>
          <p className="font-medium text-sm mb-3">🏆 Faktiska bonussvar (för poängberäkning)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {[
              { key: 'champion', label: 'VM-vinnare', placeholder: 'Lagnamn' },
              { key: 'top_scorer', label: 'Skyttekung', placeholder: 'Spelarnamn' },
              { key: 'third_place', label: 'Bronsmatch-vinnare', placeholder: 'Lagnamn' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={(bonus as any)[key]}
                  onChange={e => setBonus(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={savingBonus}
              className="py-2 px-4 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              {savingBonus ? 'Sparar...' : 'Spara bonussvar & beräkna poäng'}
            </button>
            {bonusMsg && <span className="text-sm text-green-700">{bonusMsg}</span>}
          </div>
        </form>
      </div>

      {/* Edit match teams */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <button
          onClick={() => setTeamsOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <span>✏️ Redigera matchlag</span>
          <span className="text-white text-base">{teamsOpen ? '▲' : '▼'}</span>
        </button>
        {teamsOpen && (
          <div className="divide-y">
            {matches.map(m => (
              <TeamEditRow
                key={m.id}
                match={m}
                edit={teamEdits[m.id]}
                saving={savingTeam === m.id}
                saved={savedTeamIds.includes(m.id)}
                onChange={(field, val) => setTeamEdits(prev => ({ ...prev, [m.id]: { ...prev[m.id], [field]: val } }))}
                onSave={() => saveTeam(m.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <button
          onClick={() => setGroupResultsOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <span>Gruppspelresultat</span>
          <span className="text-white text-base">{groupResultsOpen ? '▲' : '▼'}</span>
        </button>
        {groupResultsOpen && (
          <div className="divide-y">
            {groupMatches.map(m => (
              <ResultRow key={m.id} match={m} result={results[m.id]}
                saving={saving === m.id} saved={savedIds.includes(m.id)}
                onChange={(field, val) => setResults(prev => ({ ...prev, [m.id]: { ...prev[m.id], [field]: val } }))}
                onSave={() => saveResult(m.id)} showWinner={false} />
            ))}
          </div>
        )}
      </div>

      {knockoutMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <button
            onClick={() => setKnockoutResultsOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <span>Slutspelsresultat</span>
            <span className="text-white text-base">{knockoutResultsOpen ? '▲' : '▼'}</span>
          </button>
          {knockoutResultsOpen && (
            <div className="divide-y">
              {knockoutMatches.map(m => (
                <ResultRow key={m.id} match={m} result={results[m.id]}
                  saving={saving === m.id} saved={savedIds.includes(m.id)}
                  phase={phaseLabel[m.phase] ?? m.phase}
                  onChange={(field, val) => setResults(prev => ({ ...prev, [m.id]: { ...prev[m.id], [field]: val } }))}
                  onSave={() => saveResult(m.id)} showWinner />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TeamEditRow({
  match, edit, saving, saved, onChange, onSave
}: {
  match: Match
  edit?: { home: string; away: string }
  saving: boolean
  saved: boolean
  onChange: (field: 'home' | 'away', val: string) => void
  onSave: () => void
}) {
  const label = match.phase === 'group'
    ? `Gr ${match.group_name}`
    : match.phase.toUpperCase()
  return (
    <div className="px-4 py-2 flex items-center gap-2 flex-wrap text-sm">
      <span className="text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-500 shrink-0 w-14 text-center">{label}</span>
      <input
        type="text"
        value={edit?.home ?? match.home_team}
        onChange={e => onChange('home', e.target.value)}
        className="flex-1 min-w-24 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <span className="text-gray-400 text-xs shrink-0">vs</span>
      <input
        type="text"
        value={edit?.away ?? match.away_team}
        onChange={e => onChange('away', e.target.value)}
        className="flex-1 min-w-24 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <button
        onClick={onSave}
        disabled={saving}
        className="px-3 py-1 rounded text-white text-xs font-medium disabled:opacity-50 transition-colors shrink-0"
        style={{ backgroundColor: saved ? 'var(--color-green)' : 'var(--color-primary)' }}
      >
        {saving ? '...' : saved ? '✓' : 'Spara'}
      </button>
    </div>
  )
}

function ResultRow({
  match, result, saving, saved, onChange, onSave, showWinner, phase
}: {
  match: Match
  result?: { home: string; away: string; winner: string }
  saving: boolean
  saved: boolean
  onChange: (field: 'home' | 'away' | 'winner', val: string) => void
  onSave: () => void
  showWinner: boolean
  phase?: string
}) {
  return (
    <div className="px-4 py-3 flex items-center gap-2 flex-wrap text-sm">
      {phase && <span className="text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-600 shrink-0">{phase}</span>}
      <span className="text-gray-400 text-xs w-16 shrink-0">
        {new Date(match.match_date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
      </span>
      <span className="flex-1 text-right font-medium text-xs">{match.home_team}</span>
      <input type="number" min={0} max={20} value={result?.home ?? ''}
        onChange={e => onChange('home', e.target.value)}
        className="w-10 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm" />
      <span className="text-gray-400">–</span>
      <input type="number" min={0} max={20} value={result?.away ?? ''}
        onChange={e => onChange('away', e.target.value)}
        className="w-10 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm" />
      <span className="flex-1 font-medium text-xs">{match.away_team}</span>
      {showWinner && (
        <input type="text" value={result?.winner ?? ''} onChange={e => onChange('winner', e.target.value)}
          placeholder="Vinnare" className="border border-gray-300 rounded px-2 py-1 text-xs w-28 focus:outline-none" />
      )}
        <button onClick={onSave} disabled={saving}
        className="px-3 py-1 rounded text-white text-xs font-medium disabled:opacity-50 transition-colors"
        style={{ backgroundColor: saved ? 'var(--color-green)' : 'var(--color-primary)' }}>
        {saving ? '...' : saved ? '✓' : 'Spara'}
      </button>
    </div>
  )
}
