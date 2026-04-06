'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Scoreboard' },
  { href: '/tips', label: 'Mitt tips' },
  { href: '/allas-tips', label: 'Inlämnade tips' },
]

export default function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ backgroundColor: 'var(--color-primary)' }} className="text-white shadow-md">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg tracking-tight text-white">
          🏆 VM-Tips 2026
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="ml-2 px-3 py-1.5 rounded text-sm font-medium bg-red-700 hover:bg-red-600 transition-colors"
          >
            Admin
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-white/10"
          onClick={() => setOpen(!open)}
          aria-label="Meny"
        >
          <span className="block w-5 h-0.5 bg-white mb-1"></span>
          <span className="block w-5 h-0.5 bg-white mb-1"></span>
          <span className="block w-5 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/20 px-4 py-2 flex flex-col gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                pathname === l.href ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="px-3 py-2 rounded text-sm font-medium bg-red-700 hover:bg-red-600"
          >
            Admin
          </Link>
        </div>
      )}
    </nav>
  )
}
