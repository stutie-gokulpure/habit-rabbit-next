'use client'

import { useState, useRef } from 'react'

const COLORS = ['#E1F5EE','#E6F1FB','#FAEEDA','#FAECE7','#FBEAF0','#EAF3DE']

interface Habit {
  id: string
  name: string
  icon: string
  color_idx: number
  created_at: string
}

interface HabitCardProps {
  habit: Habit
  isDone: boolean
  isCheatDay?: boolean
  isSkipped?: boolean
  streak: number
  weekLogs: boolean[]
  todayIndex?: number
  onToggle: (habitId: string) => void
  onSkip: (habitId: string) => void
  onUnskip: (habitId: string) => void
  onDelete: (habitId: string) => void
  onDetailClick: (habit: Habit) => void
  canSkip: boolean
}

export function HabitCard({ habit, isDone, isCheatDay, isSkipped, streak, weekLogs, todayIndex, onToggle, onSkip, onUnskip, onDelete, onDetailClick, canSkip }: HabitCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [isHorizontalScroll, setIsHorizontalScroll] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setStartY(e.touches[0].clientY)
    setIsHorizontalScroll(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = Math.abs(currentX - startX)
    const diffY = Math.abs(currentY - startY)

    // Only treat as horizontal swipe if X movement > Y movement
    if (!isHorizontalScroll) {
      if (diffX > diffY && diffX > 10) {
        setIsHorizontalScroll(true)
        e.preventDefault()
      } else if (diffY > diffX && diffY > 10) {
        // It's a vertical scroll, don't prevent default
        return
      }
    }

    if (isHorizontalScroll) {
      e.preventDefault()
      const diff = currentX - startX
      setSwipeOffset(Math.max(Math.min(diff, 0), -80))
    }
  }

  const handleTouchEnd = () => {
    if (swipeOffset < -40) {
      setSwipeOffset(-80)
    } else {
      setSwipeOffset(0)
    }
  }
  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-lg"
    >
      {/* Delete button background - stays fixed in place */}
      <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center">
        <button
          onClick={() => onDelete(habit.id)}
          className="flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M3 6h18" strokeLinecap="round" />
            <path d="M8 6V4c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v2" strokeLinecap="round" />
            <path d="M5 9h14l-1 14c-.06.7-.63 1.2-1.34 1.2H7.34c-.71 0-1.28-.5-1.34-1.2L5 9z" />
            <path d="M10 13v7" strokeLinecap="round" />
            <path d="M14 13v7" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Card content - slides over the delete button */}
      <div
        className={`p-4 transition-transform duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          boxShadow: isDone ? '0 0 0 3px rgba(29, 158, 117, 0.1)' : 'none',
          borderColor: isDone ? '#1D9E75' : 'inherit',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Card Header — icon, name/streak, action buttons */}
      <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => onDetailClick(habit)}>
        {/* Icon Swatch */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: COLORS[habit.color_idx || 0] }}>
          {habit.icon}
        </div>
        {/* Name & Streak */}
        <div className="flex-1">
          <div className="font-semibold dark:text-gray-100">{habit.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {streak > 0 ? `🔥 ${streak}-day streak` : 'Start today!'}
          </div>
        </div>
        {/* Action Buttons — toggle done + skip */}
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(habit.id) }}
            disabled={isSkipped}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
              isDone && !isSkipped ? 'text-white' : 'border-gray-300 text-gray-400'
            } ${isSkipped ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              background: isCheatDay ? '#F0B429' : (isDone && !isSkipped ? '#1D9E75' : 'transparent'),
              borderColor: isCheatDay ? '#F0B429' : (isDone && !isSkipped ? '#1D9E75' : 'currentColor'),
            }}
          >
            {isDone && !isSkipped ? (
              <span className="text-white text-sm">{isCheatDay ? '★' : '✓'}</span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
          {(!isDone || isSkipped) && (
            <button
              onClick={(e) => { e.stopPropagation(); isSkipped ? onUnskip(habit.id) : onSkip(habit.id) }}
              disabled={!isSkipped && !canSkip}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSkipped ? 'text-white' : 'border-gray-300 text-gray-400'
              } ${!isSkipped && !canSkip ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                background: isSkipped ? '#9CA3AF' : 'transparent',
                borderColor: isSkipped ? '#9CA3AF' : 'currentColor',
              }}
              title={isSkipped ? 'Unskip habit' : canSkip ? 'Skip habit' : 'No skip habits remaining'}
            >
              <span className={`text-sm ${isSkipped ? 'text-white' : 'text-gray-400'}`}>⊘</span>
            </button>
          )}
        </div>
      </div>
      {/* Week Progress Bar — one segment per day of the week */}
      <div className="flex gap-1">
        {weekLogs.map((isLogged, i) => {
          const isToday = i === todayIndex
          const isTodayCheatDay = isToday && isCheatDay
          const isTodaySkipped = isToday && isSkipped
          return (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full ${isLogged ? '' : 'bg-gray-200'} ${i === weekLogs.length - 1 ? 'ring-1' : ''}`}
              style={{
                background: isTodayCheatDay ? '#F0B429' : isTodaySkipped ? '#9CA3AF' : (isLogged ? '#1D9E75' : 'currentColor'),
              }}
            ></div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
