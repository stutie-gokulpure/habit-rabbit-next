interface ProgressModalProps {
  isOpen: boolean
  weekNumber: number
  weekPct: number
  carrots: number
  todayDone: number
  totalHabits: number
  onClose: () => void
}

export function ProgressModal({
  isOpen,
  weekNumber,
  weekPct,
  carrots,
  todayDone,
  totalHabits,
  onClose,
}: ProgressModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🥕</span>
          <h3 className="text-2xl font-semibold dark:text-gray-100">Week Progress</h3>
        </div>

        <div className="space-y-6">
          {/* Week Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
              Week {weekNumber} of 52
            </h4>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${Math.min(weekPct, 100)}%`, background: '#1D9E75' }}
              ></div>
            </div>
            <p className="text-sm font-semibold dark:text-gray-100">{weekPct}% Complete</p>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {carrots >= 52
              ? '🎉 You collected all 52 carrots this year!'
              : todayDone === totalHabits && totalHabits > 0
              ? `All done today! Keep it up all week to earn carrot #${carrots + 1}.`
              : `Complete all habits every day this week to earn carrot #${carrots + 1} of 52.`}
          </p>

          {/* Carrots Collected */}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">
              Carrots Collected
            </h4>
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

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg font-semibold transition-colors text-white"
            style={{ background: '#1D9E75' }}
          >
            Close
          </button>
        </div>

        <style jsx>{`
          .grid-cols-13 {
            display: grid;
            grid-template-columns: repeat(13, minmax(0, 1fr));
          }
        `}</style>
      </div>
    </div>
  )
}
