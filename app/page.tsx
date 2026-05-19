'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { HabitCard } from '@/components/habits/HabitCard'
import { StatsBar } from '@/components/habits/StatsBar'
import { ProgressSection } from '@/components/habits/ProgressSection'
import { IconModal } from '@/components/habits/IconModal'
import { AddHabitModal } from '@/components/habits/AddHabitModal'
import { ProgressModal } from '@/components/habits/ProgressModal'
import { ConfirmationModal } from '@/components/habits/ConfirmationModal'
import { BottomNavBar } from '@/components/layout/BottomNavBar'

const ICONS = ['🏃','🧘','💪','📚','💧','🥗','😴','✍️','🎸','🧠','🌿','🧹','💊','🚴','🧗','🏊','🎨','☕','🍎','🌅','🦷','🎯','🏋️','🧃','🧺']
const COLORS = ['#E1F5EE','#E6F1FB','#FAEEDA','#FAECE7','#FBEAF0','#EAF3DE']

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

export default function AppPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [carrots, setCarrots] = useState<string[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showIconModal, setShowIconModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [weekStartDay, setWeekStartDay] = useState('Sunday')
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [cheatDaysCount, setCheatDaysCount] = useState(2)
  const [cheatDaysPeriod, setCheatDaysPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [cheatDayUsage, setCheatDayUsage] = useState<string[]>([])
  const [isTodayCheatDay, setIsTodayCheatDay] = useState(false)
  const [showCheatConfirm, setShowCheatConfirm] = useState(false)
  const [skipHabitsCount, setSkipHabitsCount] = useState(1)
  const [skipHabitsPeriod, setSkipHabitsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [skippedHabits, setSkippedHabits] = useState<Array<{ habit_id: string; date_skipped: string }>>([])
  interface SkippedHabit {
    habit_id: string
    date_skipped: string
  }

  const todayKey = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const currentWeekNumber = () => {
    const d = new Date()
    const s = new Date(d.getFullYear(), 0, 1)
    return Math.ceil(((d.getTime() - s.getTime()) / 86400000 + s.getDay() + 1) / 7)
  }

  const weekKeys = () => {
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const startDayIndex = DAYS.indexOf(weekStartDay)
    const keys = []
    const d = new Date()
    const currentDayIndex = d.getDay()

    // Calculate how many days to go back to reach the selected start day
    let daysBack = (currentDayIndex - startDayIndex + 7) % 7

    // Generate 7 days starting from the selected start day
    for (let i = 0; i < 7; i++) {
      const dd = new Date(d)
      dd.setDate(d.getDate() - daysBack + i)
      keys.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`)
    }
    return keys
  }

  const calcStreak = (habitId: string, wk: string[]) => {
    let streak = 0
    for (let i = wk.length - 1; i >= 0; i--) {
      if (logs.some(l => l.habit_id === habitId && l.logged_date === wk[i])) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const getWeekPct = () => {
    const wk = weekKeys()
    let total = 0
    let done = 0
    habits.forEach(h => {
      wk.forEach(k => {
        total++
        if (logs.some(l => l.habit_id === h.id && l.logged_date === k)) done++
      })
    })
    return total ? Math.round((done / total) * 100) : 0
  }

  const getPeriodKey = () => {
    const d = new Date()
    if (cheatDaysPeriod === 'weekly') {
      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const startDayIndex = DAYS.indexOf(weekStartDay)
      const currentDayIndex = d.getDay()
      let daysBack = (currentDayIndex - startDayIndex + 7) % 7
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - daysBack)
      return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
    } else {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
  }

  const getCheatDaysUsedThisPeriod = () => {
    const periodKey = getPeriodKey()
    if (cheatDaysPeriod === 'weekly') {
      const wk = weekKeys()
      return cheatDayUsage.filter(date => wk.includes(date)).length
    } else {
      const d = new Date()
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return cheatDayUsage.filter(date => date.startsWith(monthStr)).length
    }
  }

  const getCheatDaysRemaining = () => {
    return Math.max(0, cheatDaysCount - getCheatDaysUsedThisPeriod())
  }

  const getSkipHabitsPeriodKey = () => {
    const d = new Date()
    if (skipHabitsPeriod === 'daily') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } else if (skipHabitsPeriod === 'weekly') {
      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const startDayIndex = DAYS.indexOf(weekStartDay)
      const currentDayIndex = d.getDay()
      let daysBack = (currentDayIndex - startDayIndex + 7) % 7
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - daysBack)
      return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
    } else {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
  }

  const getSkipHabitsUsedThisPeriod = () => {
    const periodKey = getSkipHabitsPeriodKey()
    if (skipHabitsPeriod === 'daily') {
      return skippedHabits.filter(sh => sh.date_skipped === periodKey).length
    } else if (skipHabitsPeriod === 'weekly') {
      const wk = weekKeys()
      return skippedHabits.filter(sh => wk.includes(sh.date_skipped)).length
    } else {
      const d = new Date()
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return skippedHabits.filter(sh => sh.date_skipped.startsWith(monthStr)).length
    }
  }

  const getSkipHabitsRemaining = () => {
    return Math.max(0, skipHabitsCount - getSkipHabitsUsedThisPeriod())
  }

  const isHabitSkipped = (habitId: string, date: string) => {
    return skippedHabits.some(sh => sh.habit_id === habitId && sh.date_skipped === date)
  }

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/auth')
        return
      }

      setUser(session.user)

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!existingUser) {
        await supabase.from('users').insert({
          id: session.user.id,
          email: session.user.email
        })
      }

      const [habitsRes, logsRes, carrotsRes, cheatDaysRes, skippedRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', session.user.id),
        supabase.from('habit_logs').select('*').eq('user_id', session.user.id),
        supabase.from('carrots').select('week_key').eq('user_id', session.user.id),
        supabase.from('cheat_day_usage').select('date_used').eq('user_id', session.user.id),
        supabase.from('skipped_habits').select('*').eq('user_id', session.user.id)
      ])

      if (habitsRes.data) setHabits(habitsRes.data as Habit[])
      if (logsRes.data) setLogs(logsRes.data as HabitLog[])
      if (carrotsRes.data) setCarrots(carrotsRes.data.map(c => c.week_key))
      if (cheatDaysRes.data) setCheatDayUsage(cheatDaysRes.data.map(c => c.date_used))
      if (skippedRes.data) setSkippedHabits(skippedRes.data as SkippedHabit[])

      // Load week start day preference and cheat days settings
      setWeekStartDay(session.user.user_metadata?.week_start_day || 'Sunday')
      setCheatDaysCount(session.user.user_metadata?.cheat_days_count || 2)
      setCheatDaysPeriod((session.user.user_metadata?.cheat_days_period as 'weekly' | 'monthly') || 'weekly')
      setSkipHabitsCount(session.user.user_metadata?.skip_habits_count || 1)
      setSkipHabitsPeriod((session.user.user_metadata?.skip_habits_period as 'daily' | 'weekly' | 'monthly') || 'daily')

      // Check if today is a cheat day
      const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
      setIsTodayCheatDay(cheatDaysRes.data?.some(c => c.date_used === today) || false)
    } catch (err) {
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [router])

  // Listen for auth state changes (including metadata updates)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.user_metadata?.week_start_day) {
        setWeekStartDay(session.user.user_metadata.week_start_day)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const toggleHabitToday = async (habitId: string) => {
    const today = todayKey()
    const isChecked = logs.some(l => l.habit_id === habitId && l.logged_date === today)

    try {
      if (isChecked) {
        await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('logged_date', today)
      } else {
        await supabase.from('habit_logs').insert({
          habit_id: habitId,
          user_id: user.id,
          logged_date: today
        })
      }
      await loadUserData()
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  const deleteHabit = async (habitId: string) => {
    try {
      await supabase.from('habits').delete().eq('id', habitId)
      setHabits(habits.filter(h => h.id !== habitId))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleAddClick = () => {
    setShowAddModal(true)
  }

  const handleAddHabit = () => {
    const trimmed = newHabitName.trim()
    if (!trimmed) {
      alert('Please enter a habit name')
      return
    }
    setShowAddModal(false)
    setShowIconModal(true)
  }

  const addHabit = async () => {
    if (!newHabitName.trim()) return

    setIsAdding(true)
    try {
      const { data, error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: newHabitName,
        icon: selectedIcon,
        color_idx: habits.length % COLORS.length
      }).select()

      if (error) {
        console.error('Insert error:', error)
        return
      }

      if (data) {
        setHabits([...habits, ...data])
        setNewHabitName('')
        setShowIconModal(false)
        setSelectedIcon(ICONS[0])
      }
    } catch (err) {
      console.error('Add error:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const markTodayAsCheatDay = async () => {
    if (!user || getCheatDaysRemaining() <= 0) return

    const today = todayKey()
    try {
      await supabase.from('cheat_day_usage').insert({
        user_id: user.id,
        date_used: today
      })
      setCheatDayUsage([...cheatDayUsage, today])
      setIsTodayCheatDay(true)
    } catch (err) {
      console.error('Error marking cheat day:', err)
    }
  }

  const unmarkTodayAsCheatDay = async () => {
    if (!user) return

    const today = todayKey()
    try {
      await supabase.from('cheat_day_usage').delete().eq('user_id', user.id).eq('date_used', today)
      setCheatDayUsage(cheatDayUsage.filter(date => date !== today))
      setIsTodayCheatDay(false)
    } catch (err) {
      console.error('Error unmarking cheat day:', err)
    }
  }

  const skipHabit = async (habitId: string, date: string) => {
    if (!user || getSkipHabitsRemaining() <= 0) return

    try {
      await supabase.from('skipped_habits').insert({
        user_id: user.id,
        habit_id: habitId,
        date_skipped: date
      })
      setSkippedHabits([...skippedHabits, { habit_id: habitId, date_skipped: date }])
    } catch (err) {
      console.error('Error skipping habit:', err)
    }
  }

  const unskipHabit = async (habitId: string, date: string) => {
    if (!user) return

    try {
      await supabase.from('skipped_habits').delete().eq('user_id', user.id).eq('habit_id', habitId).eq('date_skipped', date)
      setSkippedHabits(skippedHabits.filter(sh => !(sh.habit_id === habitId && sh.date_skipped === date)))
    } catch (err) {
      console.error('Error unskipping habit:', err)
    }
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
  const weekPct = getWeekPct()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      <div className="max-w-2xl mx-auto p-6 dark:text-gray-100">
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
        <StatsBar todayDone={todayDone} totalHabits={habits.length} carrots={carrots.length} weekPct={weekPct} />

        {/* Cheat Day & Skip Habits Section */}
        <div className="mb-6 space-y-2">
          <div className="flex gap-2 items-center">
            {(getCheatDaysRemaining() > 0 || isTodayCheatDay) && (
              <button
                onClick={isTodayCheatDay ? unmarkTodayAsCheatDay : markTodayAsCheatDay}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors text-white ${
                  isTodayCheatDay ? 'bg-amber-400 hover:bg-amber-500' : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                {isTodayCheatDay ? '✓ Cheat Day Used' : 'Mark as Cheat Day'}
              </button>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getCheatDaysRemaining()} of {cheatDaysCount} cheat days remaining
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {getSkipHabitsRemaining()} of {skipHabitsCount} skip habits remaining ({skipHabitsPeriod})
          </div>
        </div>

        {/* Habits List */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">Today's Habits</h3>
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
                    canSkip={getSkipHabitsRemaining() > 0}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Add Habit Modal */}
        <AddHabitModal
          isOpen={showAddModal}
          habitName={newHabitName}
          setHabitName={setNewHabitName}
          onAddClick={handleAddHabit}
          onClose={() => {
            setShowAddModal(false)
            setNewHabitName('')
          }}
        />

        {/* Icon Modal */}
        <IconModal
          isOpen={showIconModal}
          selectedIcon={selectedIcon}
          onSelectIcon={setSelectedIcon}
          onClose={() => {
            setShowIconModal(false)
            setNewHabitName('')
            setSelectedIcon(ICONS[0])
          }}
          onAddHabit={addHabit}
          isAdding={isAdding}
        />

        {/* Progress Modal */}
        <ProgressModal
          isOpen={showProgressModal}
          weekNumber={currentWeekNumber()}
          weekPct={weekPct}
          carrots={carrots.length}
          todayDone={todayDone}
          totalHabits={habits.length}
          onClose={() => setShowProgressModal(false)}
        />

        {/* Cheat Day Confirmation Modal */}
        <ConfirmationModal
          isOpen={showCheatConfirm}
          title="Rethinking the Cheat Day?"
          message="Looks like you don't want to cheat today. Remove cheat day status and complete habits normally?"
          confirmText="Yes, remove cheat day"
          cancelText="Keep cheating"
          onConfirm={async () => {
            setShowCheatConfirm(false)
            await unmarkTodayAsCheatDay()
          }}
          onCancel={() => setShowCheatConfirm(false)}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar
        userEmail={user?.email}
        onAddHabitClick={handleAddClick}
        onLogout={handleLogout}
        onProgressClick={() => setShowProgressModal(true)}
      />
    </div>
  )
}
