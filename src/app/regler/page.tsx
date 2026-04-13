'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const DEFAULT_RULES = `<h2>🏆 Kalles VM-tips 2026 – Spelregler</h2>
<p>Välkommen till VM-tipset! Tävlingen går ut på att tippa så rätt som möjligt i fotbolls-VM 2026. Den med flest poäng när turneringen är slut vinner!</p>

<hr>

<h2>🚀 Kom igång</h2>
<ol>
  <li>Kontakta spelansvarig för att registreras – du får ett namn och en PIN-kod.</li>
  <li>Logga in på sidan med ditt namn och din PIN.</li>
  <li>Fyll i dina tips innan deadline – du kan ändra fram tills tipset låses.</li>
  <li>Följ poängtavlan live under turneringen!</li>
</ol>
<p>💸 <strong>Insats: 100 kr</strong> – swishas till spelansvarig senast 1 dygn innan turneringen startar.</p>

<hr>

<h2>⚽ Gruppspelet</h2>
<p>För varje match i gruppspelet tippas exakt resultat (antal mål för varje lag).</p>
<table>
  <tr><th>Vad du prickar rätt</th><th>Poäng</th></tr>
  <tr><td>Rätt antal mål – hemmalag</td><td>2p</td></tr>
  <tr><td>Rätt antal mål – bortalag</td><td>2p</td></tr>
  <tr><td>Rätt utfall (hemmavinst / oavgjort / bortavinst)</td><td>3p</td></tr>
  <tr><td><strong>Max per match</strong></td><td><strong>7p</strong></td></tr>
</table>
<p><strong>Exempel:</strong> Matchen slutar 2–1. Du tippade 2–1 → 7p. Du tippade 1–0 → 3p (rätt utfall, fel mål). Du tippade 0–2 → 0p.</p>

<hr>

<h2>🏟️ Slutspelet</h2>
<p>Samma poängsystem som i gruppspelet gäller för alla slutspelsmatcher – du tippar exakt resultat och kan få max 7p per match.</p>
<p><strong>Extra bonuspoäng</strong> delas ut om du tippar rätt vinnare i de tre sista rundorna:</p>
<table>
  <tr><th>Omgång</th><th>Bonuspoäng för rätt vinnare</th></tr>
  <tr><td>Omgång 32</td><td>–</td></tr>
  <tr><td>Omgång 16</td><td>–</td></tr>
  <tr><td>Kvartsfinal</td><td>–</td></tr>
  <tr><td><strong>Semifinal</strong></td><td><strong>+6p</strong></td></tr>
  <tr><td><strong>Bronsmatch</strong></td><td><strong>+8p</strong></td></tr>
  <tr><td><strong>Final</strong></td><td><strong>+8p</strong></td></tr>
</table>

<hr>

<h2>🎯 Bonusfrågor</h2>
<p>Tre frågor som lämnas in innan turneringen startar. Svaren går <strong>inte att ändra</strong> efteråt!</p>
<table>
  <tr><th>Fråga</th><th>Poäng</th></tr>
  <tr><td>Vem vinner VM?</td><td>20p</td></tr>
  <tr><td>Vem blir skyttekung?</td><td>20p</td></tr>
  <tr><td>Vem vinner bronsmatchen?</td><td>10p</td></tr>
</table>

<hr>

<h2>💰 Prispott</h2>
<p>Pengarna fördelas bland de tre bästa:</p>
<table>
  <tr><th>Placering</th><th>Andel av potten</th></tr>
  <tr><td>🥇 1:a plats</td><td>60%</td></tr>
  <tr><td>🥈 2:a plats</td><td>25%</td></tr>
  <tr><td>🥉 3:e plats</td><td>15%</td></tr>
</table>

<hr>

<h2>📊 Poängtavlan</h2>
<p>Poängtavlan uppdateras automatiskt efter varje match. Där ser du din totalsumma uppdelad på gruppspel, slutspel och bonuspoäng – och hur du ligger till mot de andra deltagarna.</p>`

export default function ReglerPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('settings').select('key, value').in('key', ['rules_content']).then(({ data }: { data: any }) => {
      const map: Record<string, string> = {}
      data?.forEach((s: any) => { map[s.key] = s.value })
      setContent(map['rules_content'] ?? DEFAULT_RULES)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Regler</h1>
      </div>
      {loading ? (
        <div className="text-center py-16 text-gray-400">Laddar...</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="content-area" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  )
}
