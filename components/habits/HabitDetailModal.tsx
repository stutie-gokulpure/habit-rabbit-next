'use client'

import { useState, useEffect } from 'react'

interface Habit {
  id: string
  name: string
  icon: string
  color_idx: number
  created_at: string
}

interface HabitLog {
  habit_id: string
  logged_date: string
}

interface HabitDetailModalProps {
  habit: Habit | null
  logs: HabitLog[]
  weekStartDay: string
  onClose: () => void
  onUpdate: (updated: Habit) => Promise<void>
}

const COLORS = ['#E1F5EE', '#E6F1FB', '#FAEEDA', '#FAECE7', '#FBEAF0', '#EAF3DE']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ICONS = ['🏃','🧘','💪','📚','💧','🥗','😴','✍️','🎸','🧠','🌿','🧹','💊','🚴','🧗','🏊','🎨','☕','🍎','🌅','🦷','🎯','🏋️','🧃','🧺']

export function HabitDetailModal({ habit, logs, weekStartDay, onClose, onUpdate }: HabitDetailModalProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [showIconPicker, setShowIconPicker] = useState(false)

  useEffect(() => {
    if (habit) {
      setEditName(habit.name)
      setEditIcon(habit.icon)
      setShowIconPicker(false)
      setWeekOffset(0)
    }
  }, [habit])

  if (!habit) return null

  const computeWeek = (offset: number): string[] => {
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const startIdx = DAYS.indexOf(weekStartDay)
    const now = new Date()
    now.setDate(now.getDate() + offset * 7)
    const daysBack = (now.getDay() - startIdx + 7) % 7
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - daysBack + i)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })
  }

  const weekDates = computeWeek(weekOffset)
  const habitColor = COLORS[habit.color_idx || 0]

  const formatWeekLabel = () => {
    const start = new Date(weekDates[0])
    const end = new Date(weekDates[6])
    const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${startMonth} – ${endMonth}`
  }

  const isLogged = (date: string) => logs.some(l => l.habit_id === habit.id && l.logged_date === date)

  const handleSave = async (updatedData: Partial<Habit>) => {
    if (!habit) return
    await onUpdate({ ...habit, ...updatedData })
  }

  const handleNameBlur = () => {
    if (editName.trim() && editName.trim() !== habit?.name) {
      handleSave({ name: editName.trim() })
    } else {
      setEditName(habit?.name || '')
    }
  }

  const handleIconSelect = async (icon: string) => {
    setEditIcon(icon)
    setShowIconPicker(false)
    if (icon !== habit?.icon) {
      await handleSave({ icon })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-lg p-6 max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header: editable icon and name */}
        <div className="flex items-center gap-4 mb-4">
          <div
            onClick={() => setShowIconPicker(v => !v)}
            className="text-4xl w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: COLORS[habit.color_idx || 0] }}
          >
            {editIcon}
          </div>
          <div className="flex-1">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={handleNameBlur}
              maxLength={40}
              className="text-2xl font-bold w-full bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none dark:text-gray-100"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tap icon to change</p>
          </div>
        </div>

        {/* Icon picker */}
        {showIconPicker && (
          <div className="grid grid-cols-7 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => handleIconSelect(icon)}
                className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                style={{ backgroundColor: editIcon === icon ? COLORS[habit.color_idx || 0] : 'transparent' }}
              >
                {icon}
              </button>
            ))}
          </div>
        )}

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ←
          </button>
          <div className="text-center font-semibold text-gray-700 dark:text-gray-300">
            {formatWeekLabel()}
          </div>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset === 0}
            className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>

        {/* 7-day grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, i) => {
            const logged = isLogged(date)
            const d = new Date(date)
            const dayNum = d.getDate()
            return (
              <div key={date} className="flex flex-col items-center gap-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {DAY_NAMES[i]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{dayNum}</div>
                <div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: logged ? habitColor : 'transparent',
                    borderColor: logged ? habitColor : '#D1D5DB',
                  }}
                >
                  {logged && <span className="font-bold text-xs" style={{ color: '#1D9E75' }}>✓</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
