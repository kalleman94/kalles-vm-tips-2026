'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Scoreboard' },
  { href: '/tips', label: 'Mitt tips' },
  { href: '/allas-tips', label: 'Inlämnade tips' },
  { href: '/regler', label: 'Regler' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav style={{ backgroundColor: 'var(--color-primary)' }} className="text-white shadow-md">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Logotyp + desktop-nav */}
        <div className="flex items-center justify-between h-14">
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
                  pathname === l.href ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                {l.label}
              </Link>
            ))}
            </div>
        </div>

        {/* Mobil-rad: alltid synlig */}
        <div className="md:hidden flex flex-wrap gap-1 pb-2">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === l.href ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
