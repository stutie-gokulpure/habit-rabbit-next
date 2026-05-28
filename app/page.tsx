'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useHabitData, Habit } from '@/context/HabitDataContext'
import { usePreferences } from '@/context/PreferencesContext'
import { HabitCard } from '@/components/habits/HabitCard'
import { StatsBar } from '@/components/habits/StatsBar'
import { IconModal } from '@/components/habits/IconModal'
import { AddHabitModal } from '@/components/habits/AddHabitModal'
import { ConfirmationModal } from '@/components/habits/ConfirmationModal'
import { HabitDetailModal } from '@/components/habits/HabitDetailModal'
import { CarrotCelebration } from '@/components/habits/CarrotCelebration'
import { BottomNavBar } from '@/components/layout/BottomNavBar'

const ICONS = ['🏃','🧘','💪','📚','💧','🥗','😴','✍️','🎸','🧠','🌿','🧹','💊','🚴','🧗','🏊','🎨','☕','🍎','🌅','🦷','🎯','🏋️','🧃','🧺']

export default function AppPage() {
  const router = useRouter()
  const {
    user, habits, logs, carrots, isTodayCheatDay,
    weekStartDay, loading,
    todayKey, weekKeys, calcStreak, getDailyCarrotsThisWeek,
    getCheatDaysRemaining, getSkipHabitsRemaining, isHabitSkipped,
    addHabit, deleteHabit, updateHabit, toggleHabitToday,
    markTodayAsCheatDay, unmarkTodayAsCheatDay,
    skipHabit, unskipHabit,
  } = useHabitData()

  const { animationsEnabled } = usePreferences()

  // Local UI state (modals, name-entry buffer, selection)
  const [newHabitName, setNewHabitName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showIconModal, setShowIconModal] = useState(false)
  const [showCheatConfirm, setShowCheatConfirm] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Celebration animation: hold the StatsBar count at its prior value while
  // the giant carrot flies to the small 🥕 tile, then bump it up on landing.
  const realWeeklyCarrots = getDailyCarrotsThisWeek()
  const [displayedWeeklyCarrots, setDisplayedWeeklyCarrots] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const prevWeeklyCarrots = useRef<number | null>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    // Skip animation logic while data is still loading
    if (loading) {
      return
    }

    if (!isInitialized.current) {
      // first run after loading complete — sync without animating
      isInitialized.current = true
      prevWeeklyCarrots.current = realWeeklyCarrots
      setDisplayedWeeklyCarrots(realWeeklyCarrots)
      return
    }
    if (realWeeklyCarrots > prevWeeklyCarrots.current!) {
      if (animationsEnabled) {
        setShowCelebration(true)
        // displayed count stays at the old value until onDone fires
      } else {
        setDisplayedWeeklyCarrots(realWeeklyCarrots)
      }
    } else {
      // count went down or stayed same — keep displayed in sync
      setDisplayedWeeklyCarrots(realWeeklyCarrots)
    }
    prevWeeklyCarrots.current = realWeeklyCarrots
  }, [realWeeklyCarrots, animationsEnabled, loading])

  // Redirect to auth when context resolves to no user
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [loading, user, router])

  const handleAddClick = () => {
    setShowAddModal(true)
  }

  const handleAddHabitNameSubmit = () => {
    const trimmed = newHabitName.trim()
    if (!trimmed) {
      alert('Please enter a habit name')
      return
    }
    setShowAddModal(false)
    setShowIconModal(true)
  }

  const handleAddHabitFinal = async () => {
    setIsAdding(true)
    try {
      const newHabit = await addHabit(newHabitName, selectedIcon)
      if (newHabit) {
        setNewHabitName('')
        setShowIconModal(false)
        setSelectedIcon(ICONS[0])
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateHabit = async (updated: Habit) => {
    await updateHabit(updated)
    setSelectedHabit(updated)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleHabitToggleWithCheatCheck = async (habitId: string) => {
    if (isTodayCheatDay) {
      setShowCheatConfirm(true)
      return
    }
    await toggleHabitToday(habitId)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const today = todayKey()
  const wk = weekKeys()
  const todayDone = habits.filter(h => logs.some(l => l.habit_id === h.id && l.logged_date === today)).length

  return (
    <div className="bg-gray-50 dark:bg-gray-900 pb-32" style={{ touchAction: 'auto' }}>
      <div className="max-w-2xl mx-auto p-6 dark:text-gray-100" style={{ touchAction: 'auto' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Habit <span style={{ color: '#1D9E75' }}>Rabbit</span> 🐰
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Stats */}
        <StatsBar
          todayDone={todayDone}
          totalHabits={habits.length}
          cakeSlices={carrots.length}
          weeklyCarrots={displayedWeeklyCarrots}
        />

        {/* Habits List */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">Today&apos;s Habits</h3>
          {habits.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <div className="text-4xl mb-2">🐰</div>
              No habits yet! Add your first one below.
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map(habit => {
                const isDone = logs.some(l => l.habit_id === habit.id && l.logged_date === today)
                const isSkipped = isHabitSkipped(habit.id, today)
                const streak = calcStreak(habit.id, wk)
                const weekLogs = wk.map(k => logs.some(l => l.habit_id === habit.id && l.logged_date === k) || isHabitSkipped(habit.id, k))
                const todayIndex = wk.indexOf(today)
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isDone={isDone || isTodayCheatDay || isSkipped}
                    isCheatDay={isTodayCheatDay}
                    isSkipped={isSkipped}
                    streak={streak}
                    weekLogs={weekLogs}
                    todayIndex={todayIndex}
                    onToggle={handleHabitToggleWithCheatCheck}
                    onSkip={() => skipHabit(habit.id, today)}
                    onUnskip={() => unskipHabit(habit.id, today)}
                    onDelete={deleteHabit}
                    onDetailClick={setSelectedHabit}
                    canSkip={getSkipHabitsRemaining() > 0}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Add Habit Modal (name entry) */}
        <AddHabitModal
          isOpen={showAddModal}
          habitName={newHabitName}
          setHabitName={setNewHabitName}
          onAddClick={handleAddHabitNameSubmit}
          onClose={() => {
            setShowAddModal(false)
            setNewHabitName('')
          }}
        />

        {/* Icon Modal (icon picker → commits the new habit) */}
        <IconModal
          isOpen={showIconModal}
          selectedIcon={selectedIcon}
          onSelectIcon={setSelectedIcon}
          onClose={() => {
            setShowIconModal(false)
            setNewHabitName('')
            setSelectedIcon(ICONS[0])
          }}
          onAddHabit={handleAddHabitFinal}
          isAdding={isAdding}
        />

        {/* Cheat Day Confirmation Modal */}
        <ConfirmationModal
          isOpen={showCheatConfirm}
          title="Rethinking the Cheat Day?"
          message="Looks like you don&apos;t want to cheat today. Remove cheat day status and complete habits normally?"
          confirmText="Yes, remove cheat day"
          cancelText="Keep cheating"
          onConfirm={async () => {
            setShowCheatConfirm(false)
            await unmarkTodayAsCheatDay()
          }}
          onCancel={() => setShowCheatConfirm(false)}
        />

        {/* Habit Detail Modal */}
        <HabitDetailModal
          habit={selectedHabit}
          logs={logs}
          weekStartDay={weekStartDay}
          onClose={() => setSelectedHabit(null)}
          onUpdate={handleUpdateHabit}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar
        userEmail={user?.email}
        onAddHabitClick={handleAddClick}
        onLogout={handleLogout}
        onCheatDayClick={isTodayCheatDay ? unmarkTodayAsCheatDay : markTodayAsCheatDay}
        isTodayCheatDay={isTodayCheatDay}
        cheatDaysRemaining={getCheatDaysRemaining()}
      />

      {/* Daily-carrot earned celebration */}
      {showCelebration && (
        <CarrotCelebration
          targetId="weekly-carrot-target"
          onDone={() => {
            setShowCelebration(false)
            setDisplayedWeeklyCarrots(realWeeklyCarrots)
          }}
        />
      )}
    </div>
  )
}
