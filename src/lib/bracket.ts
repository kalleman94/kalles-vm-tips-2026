// FIFA World Cup 2026 – officiellt slutspelsträd
// Varje entry: vinnare av match `home` → hemmalag, vinnare av `away` → bortalag i match `to`
export const WINNER_BRACKET: Array<{ to: number; home: number; away: number }> = [
  // Åttondelsfinaler (R16)
  { to: 89, home: 74, away: 77 },
  { to: 90, home: 73, away: 75 },
  { to: 91, home: 76, away: 78 },
  { to: 92, home: 79, away: 80 },
  { to: 93, home: 83, away: 84 },
  { to: 94, home: 81, away: 82 },
  { to: 95, home: 86, away: 88 },
  { to: 96, home: 85, away: 87 },
  // Kvartsfinaler (QF)
  { to: 97,  home: 89, away: 90 },
  { to: 98,  home: 93, away: 94 },
  { to: 99,  home: 91, away: 92 },
  { to: 100, home: 95, away: 96 },
  // Semifinaler (SF)
  { to: 101, home: 97,  away: 98  },
  { to: 102, home: 99,  away: 100 },
  // Final
  { to: 104, home: 101, away: 102 },
]

// Bronsmatch (M103) = förlorare av SF1 (M101) vs förlorare av SF2 (M102)
export const BRONZE_MATCH_NUM = 103
export const BRONZE_SF1_NUM   = 101
export const BRONZE_SF2_NUM   = 102

export const PHASE_ORDER = ['r32', 'r16', 'qf', 'sf', 'bronze', 'final'] as const

export function isPlaceholderName(name: string): boolean {
  return /^(Vinnare|Tvåa|Bästa|Förlorare)/.test(name)
}
