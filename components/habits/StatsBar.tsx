import { CarrotCakeSliceIcon } from '@/components/ui/CarrotCakeSliceIcon'

interface StatsBarProps {
  todayDone: number
  totalHabits: number
  cakeSlices: number
  weeklyCarrots: number
}

export function StatsBar({ todayDone, totalHabits, cakeSlices, weeklyCarrots }: StatsBarProps) {
  const positive = { color: '#1D9E75' }
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* Today — habits completed of total */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Today</div>
        <div className="text-2xl font-bold dark:text-gray-100">
          <span style={todayDone > 0 ? positive : undefined}>{todayDone}</span>
          /{totalHabits}
        </div>
      </div>
      {/* This Week — daily carrots earned (one per day with all habits done) */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">This Week</div>
        <div className="text-2xl font-bold dark:text-gray-100">
          <span style={weeklyCarrots > 0 ? positive : undefined}>{weeklyCarrots}</span>
          /7 <span id="weekly-carrot-target">🥕</span>
        </div>
      </div>
      {/* Cake Slices — full-week wins (7/7 days) earned this year */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Cake Slices</div>
        <div className="text-2xl font-bold dark:text-gray-100 flex items-center gap-1">
          <span>
            <span style={cakeSlices > 0 ? positive : undefined}>{cakeSlices}</span>
            /52
          </span>
          <CarrotCakeSliceIcon className="w-7 h-7" />
        </div>
      </div>
    </div>
  )
}
