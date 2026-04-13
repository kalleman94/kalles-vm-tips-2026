'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DEFAULT_RULES } from '@/lib/defaults'

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
