'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { usePreferences } from '@/context/PreferencesContext'

interface BottomNavBarProps {
  userEmail?: string
  onAddHabitClick?: () => void
  onLogout: () => void
  onCheatDayClick?: () => void
  isTodayCheatDay?: boolean
  cheatDaysRemaining?: number
}

export function BottomNavBar({
  userEmail,
  onAddHabitClick,
  onLogout,
  onCheatDayClick,
  isTodayCheatDay,
  cheatDaysRemaining,
}: BottomNavBarProps) {
  const showCheatDayButton =
    onCheatDayClick !== undefined &&
    (isTodayCheatDay || (cheatDaysRemaining ?? 0) > 0)

  const { animationsEnabled, setAnimationsEnabled } = usePreferences()

  const [showSettings, setShowSettings] = useState(false)
  const [showWeekDayMenu, setShowWeekDayMenu] = useState(false)
  const [weekStartDay, setWeekStartDay] = useState<string>('Sunday')

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    const loadWeekStartDay = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.week_start_day) {
        setWeekStartDay(user.user_metadata.week_start_day)
      }
    }
    loadWeekStartDay()
  }, [])

  const handleWeekStartDayChange = async (day: string) => {
    setWeekStartDay(day)
    setShowWeekDayMenu(false)
    setShowSettings(false)
    await supabase.auth.updateUser({
      data: { week_start_day: day },
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4 z-20">
      <div className="max-w-2xl mx-auto flex items-center justify-around gap-2">
        {/* Profile Button */}
        {/* <Link
          href="/profile"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold transition-opacity hover:opacity-80"
          style={{ background: '#1D9E75' }}
          title={userEmail}
        >
          {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
        </Link> */}

        {/* Home Button */}
        <Link
          href="/"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80"
          style={{ background: '#1D9E75' }}
          title="Home"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </Link>

        {/* Progress Button */}
        <Link
          href="/progress"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-opacity hover:opacity-80"
          style={{ background: '#1D9E75' }}
          title="Week progress"
        >
          🥕
        </Link>

        {/* Add Habit Button — only when caller provides a handler (home screen) */}
        {onAddHabitClick && (
          <button
            onClick={onAddHabitClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl font-light leading-none transition-transform hover:scale-110 active:scale-95"
            style={{ background: '#1D9E75' }}
            title="Add habit"
          >
            +
          </button>
        )}

        {/* Cheat Day Button */}
        {showCheatDayButton && (
          <button
            onClick={onCheatDayClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-opacity hover:opacity-80"
            style={{ background: isTodayCheatDay ? '#F0B429' : '#1D9E75' }}
            title={isTodayCheatDay ? 'Cheat day active — click to unmark' : 'Mark today as cheat day'}
          >
            ★
          </button>
        )}

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80"
            style={{ background: '#1D9E75' }}
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Settings Menu */}
          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              <Link
                href="/profile"
                onClick={() => setShowSettings(false)}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Profile Settings
              </Link>

              {/* Start of Week Submenu */}
              <div className="relative border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowWeekDayMenu(!showWeekDayMenu)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  Start of Week
                  <span className="text-xs">›</span>
                </button>

                {/* Week Day Submenu */}
                {showWeekDayMenu && (
                  <div className="absolute right-full mr-1 bottom-0 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        onClick={() => handleWeekStartDayChange(day)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          weekStartDay === day
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Animations Toggle */}
              <button
                onClick={() => setAnimationsEnabled(!animationsEnabled)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between border-t border-gray-200 dark:border-gray-700"
              >
                Animations
                <span
                  className={`text-xs font-semibold ${
                    animationsEnabled
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {animationsEnabled ? 'On' : 'Off'}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowSettings(false)
                  onLogout()
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showSettings && (
        <div
          className="fixed inset-0"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
