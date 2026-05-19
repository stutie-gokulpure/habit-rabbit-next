interface StatsBarProps {
  todayDone: number
  totalHabits: number
  carrots: number
  weekPct: number
}

export function StatsBar({ todayDone, totalHabits, carrots, weekPct }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Today</div>
        <div className="text-2xl font-bold" style={{ color: '#1D9E75' }}>
          {todayDone}/{totalHabits}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Carrots</div>
        <div className="text-2xl font-bold dark:text-gray-100">
          {carrots}/52 🥕
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">This Week</div>
        <div className="text-2xl font-bold dark:text-gray-100">{weekPct}%</div>
      </div>
    </div>
  )
}
