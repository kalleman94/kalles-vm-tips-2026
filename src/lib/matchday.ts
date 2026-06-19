/**
 * Returns the "matchday date" for a given UTC timestamp.
 *
 * A Swedish matchday runs from ~18:00 CEST (16:00 UTC) one evening
 * to ~06:00 CEST (04:00 UTC) the following morning.
 * By shifting +10h before taking the UTC date, all matches in that
 * window are grouped under the same calendar date (Swedish perspective).
 * The matchday "rolls over" at 16:00 CEST (14:00 UTC).
 */
export function getMatchDayDate(date: Date): string {
  const shifted = new Date(date.getTime() + 10 * 60 * 60 * 1000)
  return shifted.toISOString().slice(0, 10)
}
