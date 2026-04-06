import { LockStatus } from './types'

// First group match: June 11, 2026 (to be updated with official schedule)
// First knockout match: July 1, 2026
const GROUP_FIRST_MATCH = new Date('2026-06-11T19:00:00Z')
const KNOCKOUT_FIRST_MATCH = new Date('2026-07-01T19:00:00Z')
const LOCK_HOURS_BEFORE = 24

export function getLockStatus(): LockStatus {
  const now = new Date()
  const groupLockTime = new Date(GROUP_FIRST_MATCH.getTime() - LOCK_HOURS_BEFORE * 3600 * 1000)
  const knockoutLockTime = new Date(KNOCKOUT_FIRST_MATCH.getTime() - LOCK_HOURS_BEFORE * 3600 * 1000)

  return {
    groupLocked: now >= groupLockTime,
    bonusLocked: now >= groupLockTime,
    knockoutLocked: now >= knockoutLockTime,
    groupLockTime: groupLockTime.toISOString(),
    knockoutLockTime: knockoutLockTime.toISOString(),
  }
}
