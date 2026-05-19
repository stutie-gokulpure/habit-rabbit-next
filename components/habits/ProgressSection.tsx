interface ProgressSectionProps {
  weekNumber: number
  weekPct: number
  carrots: number
  todayDone: number
  totalHabits: number
}

export function ProgressSection({ weekNumber, weekPct, carrots, todayDone, totalHabits }: ProgressSectionProps) {
  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold dark:text-gray-100">Week {weekNumber} of 52</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">{weekPct}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(weekPct, 100)}%`, background: '#1D9E75' }}></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {carrots >= 52
            ? '🎉 You collected all 52 carrots this year!'
            : todayDone === totalHabits && totalHabits > 0
            ? `All done today! Keep it up all week to earn carrot #${carrots + 1}.`
            : `Complete all habits every day this week to earn carrot #${carrots + 1} of 52.`}
        </p>

        <div className="mb-2">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">Carrots Collected</div>
          <div className="grid grid-cols-13 gap-1">
            {Array.from({ length: 52 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 flex items-center justify-center text-sm rounded transition-opacity ${
                  i < carrots ? 'opacity-100' : 'opacity-20'
                }`}
                title={i < carrots ? `Week ${i + 1} — earned!` : `Week ${i + 1}`}
              >
                🥕
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .grid-cols-13 {
          display: grid;
          grid-template-columns: repeat(13, minmax(0, 1fr));
        }
      `}</style>
    </>
  )
}
