interface AddHabitBarProps {
  value: string
  onChange: (value: string) => void
  onAddClick: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function AddHabitBar({ value, onChange, onAddClick, onKeyDown }: AddHabitBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10">
      <div className="max-w-2xl mx-auto flex gap-3">
        <input
          type="text"
          placeholder="New habit…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          maxLength={40}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 dark:text-gray-100"
          style={{ '--tw-ring-color': '#1D9E75' } as React.CSSProperties}
        />
        <button
          onClick={onAddClick}
          className="px-6 py-2 text-white rounded-lg font-semibold transition-opacity hover:opacity-90"
          style={{ background: '#1D9E75' }}
        >
          + Add
        </button>
      </div>
    </div>
  )
}
