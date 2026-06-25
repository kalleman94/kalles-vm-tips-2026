'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

import { Match, Prediction, BonusAnswers, LockStatus, MatchResult, DEFAULT_POINTS } from '@/lib/types'
import { WINNER_BRACKET, BRONZE_MATCH_NUM, BRONZE_SF1_NUM, BRONZE_SF2_NUM, isPlaceholderName } from '@/lib/bracket'

const PHASES_GROUP = 'group'
const PHASES_KNOCKOUT = ['r32', 'r16', 'qf', 'sf', 'bronze', 'final']

function isPlaceholder(name: string): boolean { return isPlaceholderName(name) }

function buildResolvedTeams(
  matches: Match[],
  predictions: Record<number, Partial<Prediction>>
): Record<number, { home: string; away: string }> {
  const resolved: Record<number, { home: string; away: string }> = {}
  const byNum: Record<number, Match> = {}
  matches.forEach(m => {
    resolved[m.id] = { home: m.home_team, away: m.away_team }
    byNum[m.match_number] = m
  })

  for (const { to, home: homeNum, away: awayNum } of WINNER_BRACKET) {
    const toMatch = byNum[to]
    const homeSource = byNum[homeNum]
    const awaySource = byNum[awayNum]
    if (!toMatch || !homeSource || !awaySource) continue
    const homeWinner = predictions[homeSource.id]?.predicted_winner
    const awayWinner = predictions[awaySource.id]?.predicted_winner
    // Always show user's own predicted winner – never let admin's real teams override
    if (homeWinner) resolved[toMatch.id].home = homeWinner
    if (awayWinner) resolved[toMatch.id].away = awayWinner
  }

  // Bronze: losers of the two semi-finals (match numbers 101 and 102)
  const bronzeMatch = byNum[103]
  const sf1 = byNum[101]
  const sf2 = byNum[102]
  if (bronzeMatch && sf1 && sf2) {
    const sf1r = resolved[sf1.id]
    const sf2r = resolved[sf2.id]
    const w1 = predictions[sf1.id]?.predicted_winner
    const w2 = predictions[sf2.id]?.predicted_winner
    if (w1) resolved[bronzeMatch.id].home = w1 === sf1r.home ? sf1r.away : sf1r.home
    if (w2) resolved[bronzeMatch.id].away = w2 === sf2r.home ? sf2r.away : sf2r.home
  }

  return resolved
}

export default function TipsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [participantId, setParticipantId] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<number, Partial<Prediction>>>({})
  const [results, setResults] = useState<Record<number, MatchResult>>({})
  const [bonus, setBonus] = useState<Partial<BonusAnswers>>({})
  const [lockStatus, setLockStatus] = useState<LockStatus | null>(null)
  const [knockoutEnabled, setKnockoutEnabled] = useState(false)
  const [randomEnabled, setRandomEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'group' | 'bonus' | 'knockout'>('group')
  const [hasSwished, setHasSwished] = useState<boolean | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('participant_id')
    const name = localStorage.getItem('participant_name')
    if (!id) { router.push('/login'); return }
    setParticipantId(id)
    setParticipantName(name ?? '')
    loadData(id)
    // Load has_swished for this participant
    createClient().from('participants').select('has_swished').eq('id', id).maybeSingle()
      .then(({ data }: { data: any }) => {
        setHasSwished(data?.has_swished ?? false)
      })
    // Load settings from DB (knockout_enabled + manual locks)
    createClient().from('settings').select('key, value')
      .then(({ data }: { data: any }) => {
        if (!data) return
        const map: Record<string, string> = {}
        data.forEach((s: any) => { map[s.key] = s.value })
        setKnockoutEnabled(map['knockout_enabled'] === 'true')
        if (map['knockout_enabled'] === 'true') setActiveTab('knockout')
        setRandomEnabled(map['random_enabled'] === 'true')
        // Lock status controlled exclusively by admin DB settings
        setLockStatus({
          groupLocked: map['group_locked'] === 'true',
          knockoutLocked: map['knockout_locked'] === 'true',
          bonusLocked: map['bonus_locked'] === 'true',
          groupLockTime: '',
          knockoutLockTime: '',
        })
      })
  }, [])

  async function loadData(pid: string) {
    const [{ data: matchData }, { data: predData }, { data: bonusData }, { data: resultData }] = await Promise.all([
      supabase.from('matches').select('*').order('match_date'),
      supabase.from('predictions').select('*').eq('participant_id', pid),
      supabase.from('bonus_answers').select('*').eq('participant_id', pid).maybeSingle(),
      supabase.from('match_results').select('*'),
    ])
    if (matchData) setMatches(matchData)
    if (predData) {
      const map: Record<number, Partial<Prediction>> = {}
      predData.forEach((p: Prediction) => { map[p.match_id] = p })
      setPredictions(map)
    }
    if (bonusData) setBonus(bonusData)
    if (resultData) {
      const map: Record<number, MatchResult> = {}
      resultData.forEach((r: MatchResult) => { map[r.match_id] = r })
      setResults(map)
    }
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

  // Knockout matches with draw score but no winner selected
  const incompleteKnockout = knockoutMatches.filter(m => {
    const pred = predictions[m.id]
    if (pred?.home_goals == null || pred?.away_goals == null) return false
    return pred.home_goals === pred.away_goals && !pred.predicted_winner
  })

  const resolvedTeams = useMemo(
    () => buildResolvedTeams(matches, predictions),
    [matches, predictions]
  )

  // Strict gate (mirrors route.ts logic) – used for point display badges
  const matchTeamsOk = useMemo(() => {
    const byNum: Record<number, Match> = {}
    matches.forEach(m => { byNum[m.match_number] = m })
    const ok: Record<number, boolean> = {}
    matches.forEach(m => {
      if (m.phase === 'group') { ok[m.id] = true; return }
      if (isPlaceholder(m.home_team) || isPlaceholder(m.away_team)) { ok[m.id] = true; return }

      const isR32 = m.match_number >= 73 && m.match_number <= 88
      if (isR32) {
        const w = predictions[m.id]?.predicted_winner
        ok[m.id] = !!w && (w === m.home_team || w === m.away_team)
        return
      }

      const entry = WINNER_BRACKET.find(b => b.to === m.match_number)
      if (entry) {
        const hs = byNum[entry.home]
        const as_ = byNum[entry.away]
        ok[m.id] = !!hs && !!as_ &&
          predictions[hs.id]?.predicted_winner === m.home_team &&
          predictions[as_.id]?.predicted_winner === m.away_team
        return
      }

      if (m.match_number === BRONZE_MATCH_NUM) {
        const sf1 = byNum[BRONZE_SF1_NUM]
        const sf2 = byNum[BRONZE_SF2_NUM]
        if (!sf1 || !sf2) { ok[m.id] = true; return }
        const w1 = predictions[sf1.id]?.predicted_winner
        const w2 = predictions[sf2.id]?.predicted_winner
        const l1 = w1 === sf1.home_team ? sf1.away_team : (w1 === sf1.away_team ? sf1.home_team : null)
        const l2 = w2 === sf2.home_team ? sf2.away_team : (w2 === sf2.away_team ? sf2.home_team : null)
        ok[m.id] = l1 === m.home_team && l2 === m.away_team
        return
      }
      ok[m.id] = true
    })
    return ok
  }, [matches, predictions])

  const locked = (phase: string) =>
    phase === 'group' ? lockStatus?.groupLocked : lockStatus?.knockoutLocked

  function randomizeGroup() {
    // Weighted goal distribution: 0(22%), 1(33%), 2(25%), 3(12%), 4(5%), 5(3%)
    const goalWeights = [22, 33, 25, 12, 5, 3]
    const goalCumulative = goalWeights.reduce<number[]>((acc, w, i) => {
      acc.push((acc[i - 1] ?? 0) + w); return acc
    }, [])
    function randomGoals(): number {
      const r = Math.random() * 100
      return goalCumulative.findIndex(c => r < c)
    }
    const updates: Record<number, Partial<Prediction>> = {}
    groupMatches.forEach(m => {
      const home = randomGoals()
      const away = randomGoals()
      updates[m.id] = {
        home_goals: home,
        away_goals: away,
        predicted_winner: undefined,
      }
    })
    setPredictions(prev => {
      const next = { ...prev }
      Object.entries(updates).forEach(([id, upd]) => {
        next[Number(id)] = { ...prev[Number(id)], ...upd }
      })
      return next
    })
  }

  const phaseLabel: Record<string, string> = {
    r32: 'Sextondelsfinal', r16: 'Åttondelsfinal', qf: 'Kvartsfinal',
    sf: 'Semifinal', bronze: 'Bronsmatch', final: 'Final'
  }

  if (!participantId) return null

  return (
    <div className="pb-24">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            Mina tips
          </h1>
          <p className="text-gray-500 text-sm mt-1">Inloggad som <strong>{participantName}</strong></p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('participant_id')
            localStorage.removeItem('participant_name')
            router.push('/login')
          }}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-1"
        >
          Logga ut
        </button>
      </div>

      {/* Swish banner – sticky under header when not swished */}
      {hasSwished === false && (
        <div className="sticky top-0 z-40 -mx-4 px-4 py-2 bg-red-50 border-b border-red-200">
          <p className="text-center text-sm font-semibold text-red-600">
            🔴 Du har inte Swishat – kontakta administratören
          </p>
        </div>
      )}

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center px-4 py-3 bg-white/80 backdrop-blur border-t border-gray-200 shadow-lg gap-2">
        {incompleteKnockout.length > 0 && (
          <div className="w-full max-w-sm bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-amber-800">
            ⚠️ Du måste välja vinnare (Vidare/Vinnare) i {incompleteKnockout.length} slutspelsmatch{incompleteKnockout.length > 1 ? 'er' : ''} med oavgjort resultat innan du kan spara.
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving || incompleteKnockout.length > 0}
          className="w-full max-w-sm px-5 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-md"
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
          {randomEnabled && !lockStatus?.groupLocked && (
            <div className="flex justify-end">
              <button
                onClick={randomizeGroup}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors shadow"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                🎲 Random
              </button>
            </div>
          )}
          {groups.map(g => (
            <div key={g} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                Grupp {g}
              </div>
              <div className="divide-y">
                {groupMatches.filter(m => m.group_name === g).map(m => (
                  <MatchRow key={m.id} match={m} pred={predictions[m.id]} result={results[m.id]} locked={!!lockStatus?.groupLocked}
                    onChangePred={(field, val) => setPred(m.id, field, val)} />
                ))}
              </div>
            </div>
          ))}

          {/* Bonus questions inline at bottom of group tab */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
              🏆 Bonusfrågor
            </div>
            <div className="p-4 space-y-4">
              {lockStatus?.bonusLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 text-sm">
                  🔒 Bonusfrågor är låsta.
                </div>
              )}
              {[
                { key: 'champion', label: '🏆 Världsmästare', points: '20 p' },
                { key: 'top_scorer', label: '⚽ Skyttekung', points: '20 p' },
                { key: 'third_place', label: '🥉 Vinnare bronsmatch', points: '10 p' },
              ].map(({ key, label, points }) => (
                <div key={key}>
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
          </div>
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
                        <MatchRow key={m.id} match={m} pred={predictions[m.id]} result={results[m.id]} locked={!!lockStatus?.knockoutLocked}
                          onChangePred={(field, val) => setPred(m.id, field, val)} showWinner
                          resolvedHome={resolvedTeams[m.id]?.home}
                          resolvedAway={resolvedTeams[m.id]?.away}
                          teamsMatch={matchTeamsOk[m.id] ?? true} />
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
  match, pred, result, locked, onChangePred, showWinner = false, resolvedHome, resolvedAway, teamsMatch = true
}: {
  match: Match
  pred?: Partial<Prediction>
  result?: MatchResult
  locked: boolean
  onChangePred: (field: 'home_goals' | 'away_goals' | 'predicted_winner', val: string) => void
  showWinner?: boolean
  resolvedHome?: string
  resolvedAway?: string
  teamsMatch?: boolean
}){
  const homeTeam = resolvedHome ?? match.home_team
  const awayTeam = resolvedAway ?? match.away_team
  const info = getMatchPointInfo(pred, result, match, teamsMatch)

  const homeGoals = pred?.home_goals
  const awayGoals = pred?.away_goals
  const bothFilled = homeGoals != null && awayGoals != null
  const isDraw = bothFilled && homeGoals === awayGoals

  function handleGoalChange(field: 'home_goals' | 'away_goals', val: string) {
    onChangePred(field, val)
    const newHome = field === 'home_goals' ? (val === '' ? null : Number(val)) : homeGoals
    const newAway = field === 'away_goals' ? (val === '' ? null : Number(val)) : awayGoals
    if (newHome != null && newAway != null) {
      if (newHome !== newAway) {
        onChangePred('predicted_winner', newHome > newAway ? homeTeam : awayTeam)
      } else {
        onChangePred('predicted_winner', '')
      }
    }
  }

  return (
    <div className="px-3 py-2.5 text-sm border-b border-gray-100 last:border-0">
      {/* En rad: datum | hemmalag | [H]–[B] | bortalag | poäng */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 w-14 shrink-0 text-xs leading-tight">
          <span className="block">{new Date(match.match_date).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm', month: 'short', day: 'numeric' })}</span>
          <span className="block">{new Date(match.match_date).toLocaleTimeString('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' })}</span>
        </span>
        <span className="w-0 flex-1 text-right font-medium text-xs truncate">{homeTeam}</span>
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number" min={0} max={20}
            value={pred?.home_goals ?? ''}
            onChange={e => handleGoalChange('home_goals', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const all = Array.from(document.querySelectorAll<HTMLElement>('[data-score-input]')); const i = all.indexOf(e.currentTarget as HTMLElement); all[i + 1]?.focus() } }}
            data-score-input
            disabled={locked}
            className="w-10 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 text-sm"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number" min={0} max={20}
            value={pred?.away_goals ?? ''}
            onChange={e => handleGoalChange('away_goals', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const all = Array.from(document.querySelectorAll<HTMLElement>('[data-score-input]')); const i = all.indexOf(e.currentTarget as HTMLElement); all[i + 1]?.focus() } }}
            data-score-input
            disabled={locked}
            className="w-10 text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 text-sm"
          />
        </div>
        <span className="w-0 flex-1 font-medium text-xs truncate">{awayTeam}</span>
        <div className="shrink-0"><PointsBadge info={info} /></div>
      </div>
      {result && (
        <div className="mt-1 text-xs text-center text-gray-400">
          Facit: <span className="font-medium text-gray-500">{result.home_goals} – {result.away_goals}</span>
        </div>
      )}
          {showWinner && isDraw && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 shrink-0">
                {match.phase === 'bronze' ? 'Vinnare:' : 'Vidare:'}
              </span>
              {[homeTeam, awayTeam].map(team => {
                const selected = pred?.predicted_winner === team
                return (
                  <button
                    key={team}
                    type="button"
                    disabled={locked}
                    onClick={() => onChangePred('predicted_winner', selected ? '' : team)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      selected
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={selected ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
                  >
                    {team}
                  </button>
                )
              })}
            </div>
          )}
    </div>
  )
}

function getMatchPointInfo(
  pred: Partial<Prediction> | undefined,
  result: MatchResult | undefined,
  match: Match,
  teamsMatch = true
): { points: number; exact: boolean; gateFail?: boolean } | null {
  if (!result) return null
  if (!pred || pred.home_goals === null || pred.home_goals === undefined ||
      pred.away_goals === null || pred.away_goals === undefined) return { points: 0, exact: false }

  if (match.phase !== 'group') {
    const realTeamsFilled = !isPlaceholder(match.home_team) && !isPlaceholder(match.away_team)
    if (realTeamsFilled && !teamsMatch) return { points: 0, exact: false, gateFail: true }
  }

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

function PointsBadge({ info }: { info: { points: number; exact: boolean; gateFail?: boolean } | null }) {
  if (!info) return null
  if (info.gateFail) return <span className="text-xs font-bold text-red-500 shrink-0">❌ 0p (fel lag)</span>
  if (info.points === 0) return <span className="text-xs font-bold text-red-500 shrink-0">✗ 0p</span>
  if (info.exact) return <span className="text-xs font-bold text-green-600 shrink-0">✓ {info.points}p</span>
  return <span className="text-xs font-bold text-orange-500 shrink-0">~ {info.points}p</span>
}
