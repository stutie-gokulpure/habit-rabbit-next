'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useHabitData } from '@/context/HabitDataContext'
import { CarrotCakeSliceIcon } from '@/components/ui/CarrotCakeSliceIcon'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { BottomNavBar } from '@/components/layout/BottomNavBar'

export default function ProgressPage() {
  const router = useRouter()
  const {
    user, habits, logs, carrots, cheatDayUsage,
    cheatDaysCount, skipHabitsCount, skipHabitsPeriod, loading,
    currentWeekNumber, weekKeys, getWeekPct,
    getCheatDaysRemaining, getSkipHabitsRemaining,
    todayKey,
    refresh,
  } = useHabitData()

  // Refresh data on mount to ensure latest settings from profile
  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [loading, user, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const weekNumber = currentWeekNumber()
  const weekPct = getWeekPct()
  const today = todayKey()
  const todayDone = habits.filter(h => logs.some(l => l.habit_id === h.id && l.logged_date === today)).length
  const totalHabits = habits.length
  const carrotCount = carrots.length
  const cheatDaysRemaining = getCheatDaysRemaining()
  const skipHabitsRemaining = getSkipHabitsRemaining()

  // Per-day breakdown of this week's daily carrots: earned when every habit
  // was logged (or covered by a cheat day) on that date, and the date isn't in the future.
  const wk = weekKeys()
  const dailyCarrots = wk.map(date => ({
    date,
    earned:
      date <= today &&
      habits.length > 0 &&
      habits.every(h =>
        cheatDayUsage.includes(date) ||
        logs.some(l => l.habit_id === h.id && l.logged_date === date)
      ),
  }))

  return (
    <div className="bg-gray-50 dark:bg-gray-900 pb-32 min-h-screen">
      <div className="max-w-2xl mx-auto p-6 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-semibold dark:text-gray-100">Progress</h1>
          <span className="text-3xl">🥕</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
            Week {weekNumber} of 52
          </h4>

          {/* Week's Progress — one 🥕 per day this week */}
          <div>
            <div className="grid grid-cols-7 gap-1">
              {dailyCarrots.map(({ date, earned }) => {
                // Parse YYYY-MM-DD manually to avoid UTC parsing shifting the day
                const [y, m, d] = date.split('-').map(n => parseInt(n, 10))
                const dayName = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' })
                const isToday = date === today
                return (
                  <div key={date} className={`flex flex-col items-center gap-1 p-2 rounded ${isToday ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                    <div
                      className={`w-6 h-6 flex items-center justify-center text-sm rounded transition-opacity ${earned ? 'opacity-100' : 'opacity-20'
                        }`}
                      title={earned ? `${date} — earned!` : date}
                    >
                      🥕
                    </div>
                    <div className="text-[10px] leading-none text-gray-500 dark:text-gray-400">
                      {dayName}
                    </div>
                    <div className={`text-xs leading-none font-semibold ${isToday ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {d}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {todayDone === totalHabits && totalHabits > 0
              ? `All done today! Keep it up all week to earn carrot cake slice #${carrotCount + 1}.`
              : null}
          </p>

          {/* Today's Progress */}
          {todayDone === totalHabits && totalHabits > 0 ? null : <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Today&apos;s Progress
              </h4>
              <InfoTooltip text="Complete all habits today to earn a carrot" />
            </div>
            <div className="relative w-full mb-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3" />
              <div className="absolute text-3xl z-10" style={{ top: '-1.125rem', right: '-0.625rem' }}>
                🥕
              </div>
              <div
                className="absolute top-0 left-0 h-3 rounded-full transition-all"
                style={{ width: `${totalHabits > 0 ? (todayDone / totalHabits) * 100 : 0}%`, background: '#1D9E75' }}
              />
            </div>
            <p className="text-sm font-semibold dark:text-gray-100">{totalHabits > 0 ? Math.round((todayDone / totalHabits) * 100) : 0}% Complete</p>
          </div>}

          {/* Week Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Week&apos;s Progress
              </h4>
              <InfoTooltip text={`Complete all habits every day this week to earn cake slice #${carrotCount + 1} of 52.`} />
            </div>
            <div className="relative w-full mb-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3" />
              <div className="absolute -top-5 right-0 -mr-2">
                <CarrotCakeSliceIcon className="w-11 h-11" />
              </div>
              <div
                className="absolute top-0 left-0 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(weekPct, 100)}%`, background: '#1D9E75' }}
              />
            </div>
            <p className="text-sm font-semibold dark:text-gray-100">{weekPct}% Complete</p>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {carrotCount >= 52
              ? '🎉 You collected all 52 carrot cake slices this year!'
              : null}
          </p>

          {/* Cake Slices Collected */}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">
              Carrot Cake Slices Collected
            </h4>
            <div className="grid grid-cols-13 gap-1">
              {Array.from({ length: 52 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 flex items-center justify-center rounded transition-opacity ${i < carrotCount ? 'opacity-100' : 'opacity-20'
                    }`}
                  title={i < carrotCount ? `Week ${i + 1} — earned!` : `Week ${i + 1}`}
                >
                  <CarrotCakeSliceIcon className="w-6 h-6" />
                </div>
              ))}
            </div>
          </div>

          {/* Allowances */}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
              Allowances
            </h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>{cheatDaysRemaining} of {cheatDaysCount} cheat days remaining</div>
              <div>{skipHabitsRemaining} of {skipHabitsCount} skip habits remaining ({skipHabitsPeriod})</div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .grid-cols-13 {
            display: grid;
            grid-template-columns: repeat(13, minmax(0, 1fr));
          }
        `}</style>
      </div>

      {/* Bottom Navigation — no cheat-day or add-habit buttons on the progress page */}
      <BottomNavBar
        userEmail={user?.email}
        onLogout={handleLogout}
      />
    </div>
  )
}
