interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  isDangerous?: boolean
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors text-white"
            style={{ background: isDangerous ? '#EF4444' : '#1D9E75' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
