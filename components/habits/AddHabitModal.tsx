interface AddHabitModalProps {
  isOpen: boolean
  habitName: string
  setHabitName: (name: string) => void
  onAddClick: () => void
  onClose: () => void
}

export function AddHabitModal({
  isOpen,
  habitName,
  setHabitName,
  onAddClick,
  onClose,
}: AddHabitModalProps) {
  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddClick()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-lg p-6 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold mb-4 dark:text-gray-100">New Habit</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-100">Habit Name</label>
            <input
              type="text"
              placeholder="e.g., Morning Run, Read a Book"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              maxLength={40}
              autoFocus
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              style={{ '--tw-ring-color': '#1D9E75' } as React.CSSProperties}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 dark:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#1D9E75' }}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
