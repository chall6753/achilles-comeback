import DayView from './DayView'
import { todayKey } from '../hooks/useDb'

// Thin wrapper — the heavy lifting lives in DayView so the Calendar tab
// can reuse the exact same renderer for any selected date.
export default function Today() {
  return <DayView date={todayKey()} />
}
