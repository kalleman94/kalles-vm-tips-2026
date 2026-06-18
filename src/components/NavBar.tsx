'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Scoreboard', mobileLabel: 'Scoreboard' },
  { href: '/idag', label: 'Idag', mobileLabel: 'Idag' },
  { href: '/tips', label: 'Mitt tips', mobileLabel: 'Mitt tips' },
  { href: '/allas-tips', label: 'Inlämnade tips', mobileLabel: 'Alla tips' },
  { href: '/regler', label: 'Regler', mobileLabel: 'Regler' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav style={{ backgroundColor: 'var(--color-primary)' }} className="text-white shadow-md">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Mobil: centrerad rubrik */}
        <div className="flex md:hidden items-center justify-center h-12">
          <Link href="/" className="font-bold text-lg tracking-tight text-white">
            🏆 VM-Tips 2026
          </Link>
        </div>

        {/* Desktop: logo vänster + länkar höger */}
        <div className="hidden md:flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-lg tracking-tight text-white">
            🏆 VM-Tips 2026
          </Link>
          <div className="flex items-center gap-1">
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

        {/* Mobil: alla flikar på en rad, centrerade */}
        <div className="md:hidden flex justify-center gap-1 pb-2 overflow-x-auto">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === l.href ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              {l.mobileLabel}
            </Link>
          ))}
        </div>

      </div>
    </nav>
  )
}
