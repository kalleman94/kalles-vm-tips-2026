'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function switchMode(m: 'login' | 'register') {
    setMode(m)
    setError('')
    setName('')
    setPin('')
    setPinConfirm('')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: dbError } = await supabase
      .from('participants')
      .select('id, name, pin_hash')
      .ilike('name', name.trim())
      .single()

    if (dbError || !data) {
      setError('Deltagare hittades inte.')
      setLoading(false)
      return
    }

    if (data.pin_hash !== pin) {
      setError('Fel PIN-kod.')
      setLoading(false)
      return
    }

    localStorage.setItem('participant_id', data.id)
    localStorage.setItem('participant_name', data.name)
    router.push('/tips')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (pin !== pinConfirm) {
      setError('PIN-koderna matchar inte.')
      return
    }
    if (pin.length < 4) {
      setError('PIN-koden måste vara minst 4 tecken.')
      return
    }

    setLoading(true)

    // Check if name already taken
    const { data: existing } = await supabase
      .from('participants')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle()

    if (existing) {
      setError('Det finns redan en deltagare med det namnet.')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('participants')
      .insert({ name: name.trim(), pin_hash: pin })
      .select('id, name')
      .single()

    if (insertError || !data) {
      setError(`Kunde inte skapa konto: ${insertError?.message ?? 'okänt fel'}`)
      setLoading(false)
      return
    }

    localStorage.setItem('participant_id', data.id)
    localStorage.setItem('participant_name', data.name)
    router.push('/tips')
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
          {mode === 'login' ? 'Logga in' : 'Skapa konto'}
        </h1>

        {/* Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6 mt-4">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={mode === 'login'
              ? { backgroundColor: 'var(--color-primary)', color: 'white' }
              : { backgroundColor: 'white', color: 'var(--color-primary)' }}
          >
            Logga in
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={mode === 'register'
              ? { backgroundColor: 'var(--color-primary)', color: 'white' }
              : { backgroundColor: 'white', color: 'var(--color-primary)' }}
          >
            Skapa konto
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ditt namn"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN-kod</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••"
              required
              maxLength={10}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bekräfta PIN-kod</label>
              <input
                type="password"
                value={pinConfirm}
                onChange={e => setPinConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••"
                required
                maxLength={10}
              />
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {loading
              ? (mode === 'login' ? 'Loggar in...' : 'Skapar konto...')
              : (mode === 'login' ? 'Logga in' : 'Skapa konto')}
          </button>
        </form>
      </div>
    </div>
  )
}
