'use client'

import { useEffect, useState } from 'react'

const ICONS = ['🏃','🧘','💪','📚','💧','🥗','😴','✍️','🎸','🧠','🌿','🧹','💊','🚴','🧗','🏊','🎨','☕','🍎','🌅','🦷','🎯','🏋️','🧃','🧺']

interface IconModalProps {
  isOpen: boolean
  selectedIcon: string
  onSelectIcon: (icon: string) => void
  onClose: () => void
  onAddHabit: () => void
  isAdding: boolean
}

export function IconModal({ isOpen, selectedIcon, onSelectIcon, onClose, onAddHabit, isAdding }: IconModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(ICONS.indexOf(selectedIcon))

  useEffect(() => {
    setSelectedIndex(ICONS.indexOf(selectedIcon))
  }, [selectedIcon])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      let newIndex = selectedIndex

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          newIndex = Math.max(0, selectedIndex - 7)
          break
        case 'ArrowDown':
          e.preventDefault()
          newIndex = Math.min(ICONS.length - 1, selectedIndex + 7)
          break
        case 'ArrowLeft':
          e.preventDefault()
          newIndex = Math.max(0, selectedIndex - 1)
          break
        case 'ArrowRight':
          e.preventDefault()
          newIndex = Math.min(ICONS.length - 1, selectedIndex + 1)
          break
        case 'Enter':
          e.preventDefault()
          onAddHabit()
          return
        case 'Escape':
          e.preventDefault()
          onClose()
          return
        default:
          return
      }

      setSelectedIndex(newIndex)
      onSelectIcon(ICONS[newIndex])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, onSelectIcon, onAddHabit, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-lg p-6 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-4 dark:text-gray-100">Pick an icon</h3>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {ICONS.map((icon, index) => (
            <button
              key={icon}
              type="button"
              onClick={() => onSelectIcon(icon)}
              className="aspect-square rounded-lg border-2 flex items-center justify-center text-lg transition-colors"
              style={{
                borderColor: index === selectedIndex ? '#1D9E75' : '#E5E7EB',
                background: index === selectedIndex ? 'rgba(29, 158, 117, 0.05)' : 'transparent',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 dark:text-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAddHabit}
            disabled={isAdding}
            className="flex-1 px-4 py-2 text-white rounded-lg font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#1D9E75' }}
          >
            {isAdding ? 'Adding...' : 'Add Habit'}
          </button>
        </div>
      </div>
    </div>
  )
}
