'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
      setError('Deltagare hittades inte. Kontakta admin.')
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

  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
          Logga in
        </h1>
        <p className="text-gray-500 text-sm mb-6">Ange ditt namn och din PIN-kod</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  )
}
