'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Match } from '@/lib/types'
import { DEFAULT_INFO, DEFAULT_RULES } from '@/lib/defaults'
import { WINNER_BRACKET, BRONZE_MATCH_NUM, BRONZE_SF1_NUM, BRONZE_SF2_NUM } from '@/lib/bracket'

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
  const [randomEnabled, setRandomEnabled] = useState(false)
  const [savingKnockout, setSavingKnockout] = useState(false)
  const [groupLocked, setGroupLocked] = useState(false)
  const [bonusLocked, setBonusLocked] = useState(false)
  const [knockoutLocked, setKnockoutLocked] = useState(false)
  const [savingLock, setSavingLock] = useState<string | null>(null)
  const [bonus, setBonus] = useState({ champion: '', top_scorer: '', third_place: '' })
  const [savingBonus, setSavingBonus] = useState(false)
  const [bonusMsg, setBonusMsg] = useState('')

  // Collapsible sections
  const [groupResultsOpen, setGroupResultsOpen] = useState(false)
  const [knockoutResultsOpen, setKnockoutResultsOpen] = useState(false)
  const [contentOpen, setContentOpen] = useState(false)
  const [participantsOpen, setParticipantsOpen] = useState(false)

  // Participant management
  const [participantList, setParticipantList] = useState<{ id: string; name: string; pin_hash: string; total_points: number; group_points: number; knockout_points: number; bonus_points: number; adjustment_points: number; has_swished: boolean; submitted_group: boolean; submitted_bonus: boolean; submitted_knockout: boolean }[]>([])
  const [deletingParticipantId, setDeletingParticipantId] = useState<string | null>(null)
  const [adjustmentEdits, setAdjustmentEdits] = useState<Record<string, string>>({})
  const [savingScore, setSavingScore] = useState<string | null>(null)
  const [savedScoreIds, setSavedScoreIds] = useState<string[]>([])
  const [clearingType, setClearingType] = useState<string | null>(null)

  // Content editing
  const [infoBoxContent, setInfoBoxContent] = useState('')
  const [infoBoxVisible, setInfoBoxVisible] = useState(false)
  const [rulesContent, setRulesContent] = useState('')
  const [savingContent, setSavingContent] = useState<string | null>(null)
  const [contentMsg, setContentMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      if (data.user) {
        setUser(data.user)
        loadMatches()
        loadSettings()
        loadParticipants()
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
    setRandomEnabled(map['random_enabled'] === 'true')
    setGroupLocked(map['group_locked'] === 'true')
    setBonusLocked(map['bonus_locked'] === 'true')
    setKnockoutLocked(map['knockout_locked'] === 'true')
    setBonus({
      champion: map['actual_champion'] ?? '',
      top_scorer: map['actual_top_scorer'] ?? '',
      third_place: map['actual_third_place'] ?? '',
    })
    setInfoBoxContent(map['info_box_content'] || DEFAULT_INFO)
    setInfoBoxVisible(map['info_box_visible'] === 'true')
    setRulesContent(map['rules_content'] || DEFAULT_RULES)
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
    setSaving(matchId)

    // Both fields empty = clear the result
    if (r.home === '' && r.away === '') {
      const { error } = await supabase.from('match_results').delete().eq('match_id', matchId)
      setSaving(null)
      if (error) { alert('Kunde inte ta bort resultat: ' + error.message); return }
      await fetch('/api/recalculate', { method: 'POST' })
      await loadMatches()
      setSavedIds(prev => [...prev, matchId])
      setTimeout(() => setSavedIds(prev => prev.filter(id => id !== matchId)), 3000)
      return
    }

    // One field empty = incomplete, do nothing
    if (r.home === '' || r.away === '') { setSaving(null); return }

    const { error } = await supabase.from('match_results').upsert(
      { match_id: matchId, home_goals: Number(r.home), away_goals: Number(r.away), winner: r.winner || null },
      { onConflict: 'match_id' }
    )
    setSaving(null)
    if (error) {
      alert('Kunde inte spara resultat: ' + error.message)
      return
    }
    await fetch('/api/recalculate', { method: 'POST' })
    await loadMatches()
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

  async function propagateWinner(matchNumber: number, winner: string, loser: string) {
    const ops: Promise<any>[] = []
    const entry = WINNER_BRACKET.find(b => b.home === matchNumber || b.away === matchNumber)
    if (entry) {
      const target = matches.find(m => m.match_number === entry.to)
      if (target) {
        const field = entry.home === matchNumber ? 'home_team' : 'away_team'
        ops.push(supabase.from('matches').update({ [field]: winner }).eq('id', target.id))
      }
    }
    if (matchNumber === BRONZE_SF1_NUM || matchNumber === BRONZE_SF2_NUM) {
      const bronze = matches.find(m => m.match_number === BRONZE_MATCH_NUM)
      if (bronze) {
        const field = matchNumber === BRONZE_SF1_NUM ? 'home_team' : 'away_team'
        ops.push(supabase.from('matches').update({ [field]: loser }).eq('id', bronze.id))
      }
    }
    if (ops.length) await Promise.all(ops)
  }

  async function saveKnockoutResult(matchId: number) {
    const r = results[matchId]
    const t = teamEdits[matchId]
    const hasResult = r && r.home !== '' && r.away !== ''
    setSaving(matchId)

    // Always save team names if changed
    if (t?.home?.trim() && t?.away?.trim()) {
      await supabase.from('matches')
        .update({ home_team: t.home.trim(), away_team: t.away.trim() })
        .eq('id', matchId)
      setMatches(prev => prev.map(m => m.id === matchId
        ? { ...m, home_team: t.home.trim(), away_team: t.away.trim() } : m))
    }

    // Save result + propagate only if goals are filled in
    if (hasResult) {
      const { error } = await supabase.from('match_results').upsert(
        { match_id: matchId, home_goals: Number(r.home), away_goals: Number(r.away), winner: r.winner || null },
        { onConflict: 'match_id' }
      )
      if (error) { setSaving(null); alert('Fel: ' + error.message); return }
      const match = matches.find(m => m.id === matchId)
      if (match && r.winner) {
        const homeTeam = t?.home?.trim() || match.home_team
        const awayTeam = t?.away?.trim() || match.away_team
        const loser = r.winner === homeTeam ? awayTeam : homeTeam
        await propagateWinner(match.match_number, r.winner, loser)
      }
      await fetch('/api/recalculate', { method: 'POST' })
    }

    await loadMatches()
    setSaving(null)
    setSavedIds(prev => [...prev, matchId])
    setTimeout(() => setSavedIds(prev => prev.filter(id => id !== matchId)), 3000)
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

  async function fetchAllPredictions() {
    const batchSize = 1000
    let all: any[] = []
    let from = 0
    while (true) {
      const { data } = await supabase
        .from('predictions')
        .select('participant_id, match_id')
        .range(from, from + batchSize - 1)
      if (!data || data.length === 0) break
      all = all.concat(data)
      if (data.length < batchSize) break
      from += batchSize
    }
    return all
  }

  async function loadParticipants() {
    const [{ data: pData }, { data: sData }, { data: mData }, predData, { data: bonusData }] = await Promise.all([
      supabase.from('participants').select('id, name, pin_hash, has_swished').order('name'),
      supabase.from('scores').select('*'),
      supabase.from('matches').select('id, phase'),
      fetchAllPredictions(),
      supabase.from('bonus_answers').select('participant_id'),
    ])
    if (!pData) return
    const scoreMap: Record<string, any> = {}
    sData?.forEach((s: any) => { scoreMap[s.participant_id] = s })

    // Build sets of group/knockout match IDs
    const groupIds = new Set((mData ?? []).filter((m: any) => m.phase === 'group').map((m: any) => m.id))
    const knockoutIds = new Set((mData ?? []).filter((m: any) => m.phase !== 'group').map((m: any) => m.id))
    // Build per-participant prediction sets
    const predByParticipant: Record<string, Set<number>> = {}
    predData?.forEach((p: any) => {
      if (!predByParticipant[p.participant_id]) predByParticipant[p.participant_id] = new Set()
      predByParticipant[p.participant_id].add(p.match_id)
    })
    const bonusSet = new Set((bonusData ?? []).map((b: any) => b.participant_id))

    const list = pData.map((p: any) => {
      const preds = predByParticipant[p.id] ?? new Set()
      return {
        id: p.id, name: p.name, pin_hash: p.pin_hash,
        has_swished: p.has_swished ?? false,
        submitted_group: [...preds].some(id => groupIds.has(id)),
        submitted_bonus: bonusSet.has(p.id),
        submitted_knockout: [...preds].some(id => knockoutIds.has(id)),
        total_points: scoreMap[p.id]?.total_points ?? 0,
        group_points: scoreMap[p.id]?.group_points ?? 0,
        knockout_points: scoreMap[p.id]?.knockout_points ?? 0,
        bonus_points: scoreMap[p.id]?.bonus_points ?? 0,
        adjustment_points: scoreMap[p.id]?.adjustment_points ?? 0,
      }
    })
    setParticipantList(list)
    const edits: Record<string, string> = {}
    list.forEach((p: any) => { edits[p.id] = String(p.adjustment_points) })
    setAdjustmentEdits(edits)
  }

  async function deleteParticipant(id: string, name: string) {
    if (!confirm(`Är du säker på att du vill ta bort ${name} och all deras data?`)) return
    setDeletingParticipantId(id)
    const { error } = await supabase.from('participants').delete().eq('id', id)
    setDeletingParticipantId(null)
    if (error) {
      alert(`Fel vid borttagning: ${error.message}`)
    }
    loadParticipants()
  }

  async function saveScore(participantId: string) {
    const adj = adjustmentEdits[participantId]
    if (adj === undefined) return
    setSavingScore(participantId)
    await supabase.from('scores').upsert(
      { participant_id: participantId, adjustment_points: Number(adj) },
      { onConflict: 'participant_id' }
    )
    await fetch('/api/recalculate', { method: 'POST' })
    setSavingScore(null)
    setSavedScoreIds(prev => [...prev, participantId])
    setTimeout(() => setSavedScoreIds(prev => prev.filter(id => id !== participantId)), 3000)
    loadParticipants()
  }

  async function toggleSwish(participantId: string, current: boolean) {
    const newVal = !current
    await supabase.from('participants').update({ has_swished: newVal }).eq('id', participantId)
    setParticipantList(prev => prev.map(p => p.id === participantId ? { ...p, has_swished: newVal } : p))
  }

  async function clearResults() {
    if (!confirm('Rensa ALLA inmatade matchresultat? Detta går inte att ångra.')) return
    setClearingType('results')
    await supabase.from('match_results').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await fetch('/api/recalculate', { method: 'POST' })
    await loadMatches()
    await loadParticipants()
    setClearingType(null)
  }

  async function clearPredictions() {
    if (!confirm('Rensa ALLA användartips och bonussvar? Detta går inte att ångra.')) return
    setClearingType('predictions')
    await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('bonus_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await fetch('/api/recalculate', { method: 'POST' })
    await loadParticipants()
    setClearingType(null)
  }

  async function saveInfoBox(e: React.FormEvent) {
    e.preventDefault()
    setSavingContent('info')
    await Promise.all([
      supabase.from('settings').upsert({ key: 'info_box_content', value: infoBoxContent }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'info_box_visible', value: String(infoBoxVisible) }, { onConflict: 'key' }),
    ])
    setSavingContent(null)
    setContentMsg('✓ Inforutan sparad!')
    setTimeout(() => setContentMsg(''), 3000)
  }

  async function saveRules(e: React.FormEvent) {
    e.preventDefault()
    setSavingContent('rules')
    await supabase.from('settings').upsert({ key: 'rules_content', value: rulesContent }, { onConflict: 'key' })
    setSavingContent(null)
    setContentMsg('✓ Reglerna sparade!')
    setTimeout(() => setContentMsg(''), 3000)
  }

  // Original placeholder team names per match number – used for reset
  const KNOCKOUT_DEFAULTS: Record<number, { home: string; away: string }> = {
    73:  { home: 'Tvåa Grupp A',    away: 'Tvåa Grupp B' },
    74:  { home: 'Vinnare Grupp E', away: 'Bästa 3:a (A/B/C/D/F)' },
    75:  { home: 'Vinnare Grupp F', away: 'Tvåa Grupp C' },
    76:  { home: 'Vinnare Grupp C', away: 'Tvåa Grupp F' },
    77:  { home: 'Vinnare Grupp I', away: 'Bästa 3:a (C/D/F/G/H)' },
    78:  { home: 'Tvåa Grupp E',    away: 'Tvåa Grupp I' },
    79:  { home: 'Vinnare Grupp A', away: 'Bästa 3:a (C/E/F/H/I)' },
    80:  { home: 'Vinnare Grupp L', away: 'Bästa 3:a (E/H/I/J/K)' },
    81:  { home: 'Vinnare Grupp D', away: 'Bästa 3:a (B/E/F/I/J)' },
    82:  { home: 'Vinnare Grupp G', away: 'Bästa 3:a (A/E/H/I/J)' },
    83:  { home: 'Tvåa Grupp K',    away: 'Tvåa Grupp L' },
    84:  { home: 'Vinnare Grupp H', away: 'Tvåa Grupp J' },
    85:  { home: 'Vinnare Grupp B', away: 'Bästa 3:a (E/F/G/I/J)' },
    86:  { home: 'Vinnare Grupp J', away: 'Tvåa Grupp H' },
    87:  { home: 'Vinnare Grupp K', away: 'Bästa 3:a (D/E/I/J/L)' },
    88:  { home: 'Tvåa Grupp D',    away: 'Tvåa Grupp G' },
    89:  { home: 'Vinnare M74',     away: 'Vinnare M77' },
    90:  { home: 'Vinnare M73',     away: 'Vinnare M75' },
    91:  { home: 'Vinnare M83',     away: 'Vinnare M84' },
    92:  { home: 'Vinnare M81',     away: 'Vinnare M82' },
    93:  { home: 'Vinnare M76',     away: 'Vinnare M78' },
    94:  { home: 'Vinnare M79',     away: 'Vinnare M80' },
    95:  { home: 'Vinnare M86',     away: 'Vinnare M88' },
    96:  { home: 'Vinnare M85',     away: 'Vinnare M87' },
    97:  { home: 'Vinnare M89',     away: 'Vinnare M90' },
    98:  { home: 'Vinnare M91',     away: 'Vinnare M92' },
    99:  { home: 'Vinnare M93',     away: 'Vinnare M94' },
    100: { home: 'Vinnare M95',     away: 'Vinnare M96' },
    101: { home: 'Vinnare M97',     away: 'Vinnare M98' },
    102: { home: 'Vinnare M99',     away: 'Vinnare M100' },
    103: { home: 'Förlorare M101',  away: 'Förlorare M102' },
    104: { home: 'Vinnare M101',    away: 'Vinnare M102' },
  }

  async function resetKnockoutTeams() {
    if (!confirm('Återställer ALLA slutspelslags lagnamn till originalet (platshållare). Är du säker?')) return
    setClearingType('resetTeams')
    const updates = matches
      .filter(m => m.phase !== 'group' && KNOCKOUT_DEFAULTS[m.match_number])
      .map(m => {
        const d = KNOCKOUT_DEFAULTS[m.match_number]
        return supabase.from('matches').update({ home_team: d.home, away_team: d.away }).eq('id', m.id)
      })
    await Promise.all(updates)
    await loadMatches()
    setClearingType(null)
  }

  const groupMatches = matches.filter(m => m.phase === 'group')
  const knockoutMatches = matches.filter(m => m.phase !== 'group')
  const phaseLabel: Record<string, string> = {
    r32: 'Sextondelsfinal', r16: 'Åttondelsfinal', qf: 'Kvartsfinal', sf: 'Semifinal', bronze: 'Bronsmatch', final: 'Final'
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
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
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
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <p className="font-medium text-sm">🎲 Visa Random-knapp</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {randomEnabled
                ? '✅ Synlig – deltagare kan slumpa gruppspelstips'
                : '🙈 Dold – Random-knappen visas inte'}
            </p>
          </div>
          <button
            onClick={() => toggleSetting('random_enabled', randomEnabled, setRandomEnabled)}
            disabled={savingLock === 'random_enabled'}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
              randomEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              randomEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Reset buttons */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-4">Farliga åtgärder</p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={resetKnockoutTeams}
            disabled={clearingType !== null}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 bg-yellow-600 hover:bg-yellow-700 transition-colors"
          >
            {clearingType === 'resetTeams' ? 'Återställer...' : '↩️ Återställ slutspelslag'}
          </button>
          <button
            onClick={clearResults}
            disabled={clearingType !== null}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            {clearingType === 'results' ? 'Rensar...' : '🗑️ Rensa matchresultat'}
          </button>
          <button
            onClick={clearPredictions}
            disabled={clearingType !== null}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 bg-red-600 hover:bg-red-700 transition-colors"
          >
            {clearingType === 'predictions' ? 'Rensar...' : '🗑️ Rensa användartips'}
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

      {/* Content editor */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <button
          onClick={() => setContentOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <span>📝 Redigera innehåll & regler</span>
          <span className="text-white text-base">{contentOpen ? '▲' : '▼'}</span>
        </button>
        {contentOpen && (
          <div className="p-5 flex flex-col gap-6">
            {contentMsg && <p className="text-sm text-green-700 font-medium">{contentMsg}</p>}

            {/* Info box */}
            <form onSubmit={saveInfoBox}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">🏠 Inforuta på startsidan (ovanför scoreboard)</p>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                  <span>{infoBoxVisible ? '👁️ Synlig' : '🙈 Dold'}</span>
                  <button
                    type="button"
                    onClick={() => setInfoBoxVisible(v => !v)}
                    className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${infoBoxVisible ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${infoBoxVisible ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </label>
              </div>
              <p className="text-xs text-gray-400 mb-2">HTML-formatering stöds (t.ex. &lt;strong&gt;, &lt;ul&gt;, &lt;table&gt;).</p>
              <textarea
                value={infoBoxContent}
                onChange={e => setInfoBoxContent(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" disabled={savingContent === 'info'}
                className="mt-2 py-2 px-4 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                {savingContent === 'info' ? 'Sparar...' : 'Spara inforuta'}
              </button>
            </form>

            <hr className="border-gray-200" />

            {/* Rules */}
            <form onSubmit={saveRules}>
              <p className="font-medium text-sm mb-2">📋 Regeltext (visas alltid på sidan /regler)</p>
              <p className="text-xs text-gray-400 mb-2">HTML-formatering stöds (t.ex. &lt;h2&gt;, &lt;table&gt;, &lt;ul&gt;).</p>
              <textarea
                value={rulesContent}
                onChange={e => setRulesContent(e.target.value)}
                rows={12}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" disabled={savingContent === 'rules'}
                className="mt-2 py-2 px-4 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                {savingContent === 'rules' ? 'Sparar...' : 'Spara regler'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Participant management */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <button
          onClick={() => { setParticipantsOpen(o => !o); if (!participantsOpen) loadParticipants() }}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <span>👥 Hantera deltagare</span>
          <span className="text-white text-base">{participantsOpen ? '▲' : '▼'}</span>
        </button>
        {participantsOpen && (
          <div className="p-4">
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-4">
              ℹ️ Grupp-, slutspels- och bonuspoäng beräknas automatiskt. Du kan lägga till eller dra av poäng via <strong>Justering</strong>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2 pr-3">Namn</th>
                    <th className="pb-2 pr-3">PIN</th>
                    <th className="pb-2 pr-2 text-center">Grupp</th>
                    <th className="pb-2 pr-2 text-center">Slutspel</th>
                    <th className="pb-2 pr-2 text-center">Bonus</th>
                    <th className="pb-2 pr-2 text-center text-purple-600">Justering</th>
                    <th className="pb-2 pr-2 text-center">Totalt</th>
                    <th className="pb-2 pr-2 text-center text-green-600">Swish</th>
                    <th className="pb-2 pr-2 text-center" title="Inlämnat gruppspel / bonus / slutspel">Inlämnat</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {participantList.map(p => {
                    const saved = savedScoreIds.includes(p.id)
                    return (
                      <tr key={p.id} className="text-xs">
                        <td className="py-2 pr-3 font-medium">{p.name}</td>
                        <td className="py-2 pr-3 font-mono text-gray-500">{p.pin_hash}</td>
                        <td className="py-2 pr-2 text-center text-gray-600">{p.group_points}</td>
                        <td className="py-2 pr-2 text-center text-gray-600">{p.knockout_points}</td>
                        <td className="py-2 pr-2 text-center text-gray-600">{p.bonus_points}</td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={adjustmentEdits[p.id] ?? '0'}
                            onChange={ev => setAdjustmentEdits(prev => ({ ...prev, [p.id]: ev.target.value }))}
                            className="w-16 text-center border border-purple-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
                          />
                        </td>
                        <td className="py-2 pr-2 text-center font-semibold">{p.total_points}</td>
                        <td className="py-2 pr-2 text-center">
                          <button
                            onClick={() => toggleSwish(p.id, p.has_swished)}
                            title={p.has_swished ? 'Markera som ej Swishat' : 'Markera som Swishat'}
                            className={`w-7 h-7 rounded-full text-sm font-bold transition-colors border-2 ${
                              p.has_swished
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white border-gray-300 text-gray-300 hover:border-green-400'
                            }`}
                          >
                            {p.has_swished ? '✓' : '–'}
                          </button>
                        </td>
                        <td className="py-2 pr-2 text-center">
                          <div className="flex gap-0.5 justify-center" title={`Grupp: ${p.submitted_group ? 'Ja' : 'Nej'} | Bonus: ${p.submitted_bonus ? 'Ja' : 'Nej'} | Slutspel: ${p.submitted_knockout ? 'Ja' : 'Nej'}`}>
                            <span className={`text-xs px-1 rounded font-bold ${p.submitted_group ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>G</span>
                            <span className={`text-xs px-1 rounded font-bold ${p.submitted_bonus ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>B</span>
                            <span className={`text-xs px-1 rounded font-bold ${p.submitted_knockout ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>S</span>
                          </div>
                        </td>
                        <td className="py-2 flex gap-1">
                          <button
                            onClick={() => saveScore(p.id)}
                            disabled={savingScore === p.id}
                            className="px-2 py-1 rounded text-white text-xs font-medium disabled:opacity-50 transition-colors"
                            style={{ backgroundColor: saved ? 'var(--color-green)' : 'var(--color-primary)' }}
                          >
                            {savingScore === p.id ? '...' : saved ? '✓' : 'Spara'}
                          </button>
                          <button
                            onClick={() => deleteParticipant(p.id, p.name)}
                            disabled={deletingParticipantId === p.id}
                            className="px-2 py-1 rounded text-white text-xs font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            {deletingParticipantId === p.id ? '...' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
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
          <div>
            {groupMatches.map(m => (
              <ResultRow key={m.id} match={m} result={results[m.id]}
                saving={saving === m.id} saved={savedIds.includes(m.id)}
                onChange={(field, val) => setResults(prev => ({ ...prev, [m.id]: { ...prev[m.id], [field]: val } }))}
                onSave={() => saveResult(m.id)} showWinner={false}
                teamEdit={teamEdits[m.id]}
                onTeamChange={(field, val) => setTeamEdits(prev => ({ ...prev, [m.id]: { ...prev[m.id], [field]: val } }))}
                onTeamSave={() => saveTeam(m.id)}
                savingTeam={savingTeam === m.id}
                savedTeam={savedTeamIds.includes(m.id)} />
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
            <div>
              {knockoutMatches.map(m => (
                <KnockoutResultRow key={m.id} match={m} result={results[m.id]}
                  saving={saving === m.id} saved={savedIds.includes(m.id)}
                  phase={phaseLabel[m.phase] ?? m.phase}
                  onChange={(field, val) => setResults(prev => ({ ...prev, [m.id]: { ...prev[m.id], [field]: val } }))}
                  onSave={() => saveKnockoutResult(m.id)}
                  teamEdit={teamEdits[m.id]}
                  onTeamChange={(field, val) => setTeamEdits(prev => ({ ...prev, [m.id]: { ...prev[m.id], [field]: val } }))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ResultRow({
  match, result, saving, saved, onChange, onSave, showWinner, phase,
  teamEdit, onTeamChange, onTeamSave, savingTeam, savedTeam
}: {  match: Match
  result?: { home: string; away: string; winner: string }
  saving: boolean
  saved: boolean
  onChange: (field: 'home' | 'away' | 'winner', val: string) => void
  onSave: () => void
  showWinner: boolean
  phase?: string
  teamEdit?: { home: string; away: string }
  onTeamChange?: (field: 'home' | 'away', val: string) => void
  onTeamSave?: () => void
  savingTeam?: boolean
  savedTeam?: boolean
}) {
  const isSaving = saving || !!savingTeam
  const isSaved = saved || !!savedTeam
  return (
    <div className="px-4 py-3 text-sm border-b border-gray-100 last:border-0">
      {/* Row 1: badges + date */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {phase && (
          <span className="text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-600">{phase}</span>
        )}
        {phase && match.match_number != null && (
          <span className="text-xs bg-blue-100 text-blue-700 font-mono rounded px-2 py-0.5">M{match.match_number}</span>
        )}
        <span className="text-gray-400 text-xs leading-tight">
          {new Date(match.match_date).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm', month: 'short', day: 'numeric' })}
          {' · '}
          {new Date(match.match_date).toLocaleTimeString('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Row 2: home team – score – score – away team */}
      <div className="flex items-center justify-center gap-2">
        {teamEdit && onTeamChange ? (
          <input
            type="text"
            value={teamEdit.home}
            onChange={e => onTeamChange('home', e.target.value)}
            className="w-0 flex-1 text-right border border-gray-300 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <span className="w-0 flex-1 text-right font-medium text-xs truncate">{match.home_team}</span>
        )}
        <input type="number" min={0} max={20} value={result?.home ?? ''}
          onChange={e => onChange('home', e.target.value)}
          className="w-10 shrink-0 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm" />
        <span className="text-gray-400 shrink-0">–</span>
        <input type="number" min={0} max={20} value={result?.away ?? ''}
          onChange={e => onChange('away', e.target.value)}
          className="w-10 shrink-0 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm" />
        {teamEdit && onTeamChange ? (
          <input
            type="text"
            value={teamEdit.away}
            onChange={e => onTeamChange('away', e.target.value)}
            className="w-0 flex-1 border border-gray-300 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <span className="w-0 flex-1 font-medium text-xs truncate">{match.away_team}</span>
        )}
      </div>

      {/* Row 3: winner + save */}
      <div className="flex items-center justify-end gap-2 mt-2">
        {showWinner && (
          <input type="text" value={result?.winner ?? ''} onChange={e => onChange('winner', e.target.value)}
            placeholder="Vinnare" className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none" />
        )}
        <button
          onClick={() => { onSave(); onTeamSave?.() }}
          disabled={isSaving}
          className="px-3 py-1 rounded text-white text-xs font-medium disabled:opacity-50 transition-colors shrink-0"
          style={{ backgroundColor: isSaved ? 'var(--color-green)' : 'var(--color-primary)' }}>
          {isSaving ? '...' : isSaved ? '✓' : 'Spara'}
        </button>
      </div>
    </div>
  )
}

function KnockoutResultRow({
  match, result, saving, saved, onChange, onSave, phase, teamEdit, onTeamChange
}: {
  match: Match
  result?: { home: string; away: string; winner: string }
  saving: boolean
  saved: boolean
  onChange: (field: 'home' | 'away' | 'winner', val: string) => void
  onSave: () => void
  phase?: string
  teamEdit?: { home: string; away: string }
  onTeamChange?: (field: 'home' | 'away', val: string) => void
}) {
  const homeGoals = result?.home ?? ''
  const awayGoals = result?.away ?? ''
  const currentWinner = result?.winner ?? ''
  const isBronze = match.match_number === 103
  const bothFilled = homeGoals !== '' && awayGoals !== ''
  const isDraw = bothFilled && homeGoals === awayGoals
  const homeTeam = teamEdit?.home ?? match.home_team
  const awayTeam = teamEdit?.away ?? match.away_team

  function handleGoalChange(field: 'home' | 'away', val: string) {
    onChange(field, val)
    const h = field === 'home' ? val : homeGoals
    const a = field === 'away' ? val : awayGoals
    if (h !== '' && a !== '') {
      if (h !== a) {
        onChange('winner', Number(h) > Number(a) ? homeTeam : awayTeam)
      } else {
        onChange('winner', '')
      }
    } else {
      onChange('winner', '')
    }
  }

  return (
    <div className="px-4 py-3 text-sm border-b border-gray-100 last:border-0">
      {/* Row 1: badges + date */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {phase && <span className="text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-600">{phase}</span>}
        {match.match_number != null && (
          <span className="text-xs bg-blue-100 text-blue-700 font-mono rounded px-2 py-0.5">M{match.match_number}</span>
        )}
        <span className="text-gray-400 text-xs leading-tight">
          {new Date(match.match_date).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm', month: 'short', day: 'numeric' })}
          {' · '}
          {new Date(match.match_date).toLocaleTimeString('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Row 2: home – score – score – away */}
      <div className="flex items-center justify-center gap-2">
        {onTeamChange ? (
          <input type="text" value={teamEdit?.home ?? ''} onChange={e => onTeamChange('home', e.target.value)}
            className="w-0 flex-1 text-right border border-gray-300 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400" />
        ) : (
          <span className="w-0 flex-1 text-right font-medium text-xs truncate">{homeTeam}</span>
        )}
        <input type="number" min={0} max={20} value={homeGoals}
          onChange={e => handleGoalChange('home', e.target.value)}
          className="w-10 shrink-0 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm" />
        <span className="text-gray-400 shrink-0">–</span>
        <input type="number" min={0} max={20} value={awayGoals}
          onChange={e => handleGoalChange('away', e.target.value)}
          className="w-10 shrink-0 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm" />
        {onTeamChange ? (
          <input type="text" value={teamEdit?.away ?? ''} onChange={e => onTeamChange('away', e.target.value)}
            className="w-0 flex-1 border border-gray-300 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400" />
        ) : (
          <span className="w-0 flex-1 font-medium text-xs truncate">{awayTeam}</span>
        )}
      </div>

      {/* Row 3: auto-winner / Vidare buttons + save */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex-1 min-w-0">
          {bothFilled && !isDraw && currentWinner && (
            <span className="text-xs text-gray-500">→ <strong>{currentWinner}</strong></span>
          )}
          {isDraw && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 shrink-0">{isBronze ? 'Vinnare:' : 'Vidare:'}</span>
              {[homeTeam, awayTeam].map(team => (
                <button key={team} type="button"
                  onClick={() => onChange('winner', currentWinner === team ? '' : team)}
                  className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                    currentWinner === team
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  style={currentWinner === team ? { backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : {}}
                >
                  {team}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={onSave} disabled={saving}
          className="px-3 py-1 rounded text-white text-xs font-medium disabled:opacity-50 transition-colors shrink-0"
          style={{ backgroundColor: saved ? 'var(--color-green)' : 'var(--color-primary)' }}>
          {saving ? '...' : saved ? '✓' : 'Spara'}
        </button>
      </div>
    </div>
  )
}
