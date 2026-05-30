'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'

const COLORS = ['#E1F5EE', '#E6F1FB', '#FAEEDA', '#FAECE7', '#FBEAF0', '#EAF3DE']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export interface Habit {
  id: string
  name: string
  icon: string
  color_idx: number
  created_at: string
}

export interface HabitLog {
  habit_id: string
  logged_date: string
}

export interface SkippedHabit {
  habit_id: string
  date_skipped: string
}

interface HabitDataContextValue {
  user: any | null
  habits: Habit[]
  logs: HabitLog[]
  carrots: string[]
  cheatDayUsage: string[]
  skippedHabits: SkippedHabit[]
  isTodayCheatDay: boolean
  weekStartDay: string
  cheatDaysCount: number
  cheatDaysPeriod: 'weekly' | 'monthly'
  skipHabitsCount: number
  skipHabitsPeriod: 'daily' | 'weekly' | 'monthly'
  loading: boolean

  todayKey: () => string
  currentWeekNumber: () => number
  weekKeys: () => string[]
  calcStreak: (habitId: string, wk: string[]) => number
  getWeekPct: () => number
  getDailyCarrotsThisWeek: () => number
  getCheatDaysRemaining: () => number
  getSkipHabitsRemaining: () => number
  isHabitSkipped: (habitId: string, date: string) => boolean

  addHabit: (name: string, icon: string) => Promise<Habit | null>
  deleteHabit: (habitId: string) => Promise<void>
  updateHabit: (updated: Habit) => Promise<void>
  toggleHabitToday: (habitId: string) => Promise<void>
  markTodayAsCheatDay: () => Promise<void>
  unmarkTodayAsCheatDay: () => Promise<void>
  skipHabit: (habitId: string, date: string) => Promise<void>
  unskipHabit: (habitId: string, date: string) => Promise<void>

  refresh: () => Promise<void>
}

const HabitDataContext = createContext<HabitDataContextValue | undefined>(undefined)

export function HabitDataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [carrots, setCarrots] = useState<string[]>([])
  const [cheatDayUsage, setCheatDayUsage] = useState<string[]>([])
  const [skippedHabits, setSkippedHabits] = useState<SkippedHabit[]>([])
  const [isTodayCheatDay, setIsTodayCheatDay] = useState(false)
  const [weekStartDay, setWeekStartDay] = useState('Sunday')
  const [cheatDaysCount, setCheatDaysCount] = useState(2)
  const [cheatDaysPeriod, setCheatDaysPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [skipHabitsCount, setSkipHabitsCount] = useState(1)
  const [skipHabitsPeriod, setSkipHabitsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [loading, setLoading] = useState(true)

  // === Helpers (pure functions over state) ===

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
    const startDayIndex = DAYS.indexOf(weekStartDay)
    const keys: string[] = []
    const d = new Date()
    const currentDayIndex = d.getDay()
    const daysBack = (currentDayIndex - startDayIndex + 7) % 7
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

  const getDailyCarrotsThisWeek = () => {
    if (habits.length === 0) return 0
    const wk = weekKeys()
    const today = todayKey()
    return wk.filter(date => {
      if (date > today) return false
      return habits.every(h =>
        cheatDayUsage.includes(date) || logs.some(l => l.habit_id === h.id && l.logged_date === date)
      )
    }).length
  }

  const getCheatDaysUsedThisPeriod = () => {
    if (cheatDaysPeriod === 'weekly') {
      const wk = weekKeys()
      return cheatDayUsage.filter(date => wk.includes(date)).length
    }
    const d = new Date()
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return cheatDayUsage.filter(date => date.startsWith(monthStr)).length
  }

  const getCheatDaysRemaining = () =>
    Math.max(0, cheatDaysCount - getCheatDaysUsedThisPeriod())

  const getSkipHabitsUsedThisPeriod = () => {
    if (skipHabitsPeriod === 'daily') {
      const today = todayKey()
      return skippedHabits.filter(sh => sh.date_skipped === today).length
    }
    if (skipHabitsPeriod === 'weekly') {
      const wk = weekKeys()
      return skippedHabits.filter(sh => wk.includes(sh.date_skipped)).length
    }
    const d = new Date()
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return skippedHabits.filter(sh => sh.date_skipped.startsWith(monthStr)).length
  }

  const getSkipHabitsRemaining = () =>
    Math.max(0, skipHabitsCount - getSkipHabitsUsedThisPeriod())

  const isHabitSkipped = (habitId: string, date: string) =>
    skippedHabits.some(sh => sh.habit_id === habitId && sh.date_skipped === date)

  // === Data load + idempotent weekly carrot-cake-slice award ===

  const loadUserData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setUser(null)
        setHabits([])
        setLogs([])
        setCarrots([])
        setCheatDayUsage([])
        setSkippedHabits([])
        setIsTodayCheatDay(false)
        setLoading(false)
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
          email: session.user.email,
        })
      }

      const [habitsRes, logsRes, carrotsRes, cheatDaysRes, skippedRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', session.user.id),
        supabase.from('habit_logs').select('*').eq('user_id', session.user.id),
        supabase.from('carrots').select('week_key').eq('user_id', session.user.id),
        supabase.from('cheat_days_usage').select('used_date').eq('user_id', session.user.id),
        supabase.from('skipped_habits').select('*').eq('user_id', session.user.id),
      ])

      const sessionWeekStart = session.user.user_metadata?.week_start_day || 'Sunday'
      const startIdx = DAYS.indexOf(sessionWeekStart)
      const now = new Date()
      const daysBack = (now.getDay() - startIdx + 7) % 7
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - daysBack + i)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      })
      const weekKey = weekDates[0]

      const currentCarrots = carrotsRes.data ?? []
      const fetchedHabits = (habitsRes.data ?? []) as Habit[]
      const fetchedLogs = (logsRes.data ?? []) as HabitLog[]
      const cheatDates = new Set((cheatDaysRes.data ?? []).map(c => c.used_date))

      const weekComplete =
        fetchedHabits.length > 0 &&
        fetchedHabits.every(h =>
          weekDates.every(date =>
            cheatDates.has(date) || fetchedLogs.some(l => l.habit_id === h.id && l.logged_date === date)
          )
        )

      if (weekComplete && !currentCarrots.some(c => c.week_key === weekKey)) {
        await supabase.from('carrots').insert({ user_id: session.user.id, week_key: weekKey })
        currentCarrots.push({ week_key: weekKey })
      }

      setHabits(fetchedHabits)
      setLogs(fetchedLogs)
      setCarrots(currentCarrots.map(c => c.week_key))
      setCheatDayUsage((cheatDaysRes.data ?? []).map(c => c.used_date))
      setSkippedHabits((skippedRes.data ?? []) as SkippedHabit[])

      setWeekStartDay(session.user.user_metadata?.week_start_day || 'Sunday')
      setCheatDaysCount(session.user.user_metadata?.cheat_days_count || 2)
      setCheatDaysPeriod((session.user.user_metadata?.cheat_days_period as 'weekly' | 'monthly') || 'weekly')
      setSkipHabitsCount(session.user.user_metadata?.skip_habits_count || 1)
      setSkipHabitsPeriod((session.user.user_metadata?.skip_habits_period as 'daily' | 'weekly' | 'monthly') || 'daily')

      const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
      setIsTodayCheatDay((cheatDaysRes.data ?? []).some(c => c.used_date === today))
    } catch (err) {
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        loadUserData()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setHabits([])
        setLogs([])
        setCarrots([])
        setCheatDayUsage([])
        setSkippedHabits([])
        setIsTodayCheatDay(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, [loadUserData])

  // === Mutators ===

  const addHabit = async (name: string, icon: string): Promise<Habit | null> => {
    if (!user || !name.trim()) return null
    try {
      const { data, error } = await supabase.from('habits').insert({
        user_id: user.id,
        name,
        icon,
        color_idx: habits.length % COLORS.length,
      }).select()

      if (error) {
        console.error('Insert error:', error)
        return null
      }
      if (data && data.length > 0) {
        const newHabit = data[0] as Habit
        setHabits([...habits, newHabit])
        return newHabit
      }
      return null
    } catch (err) {
      console.error('Add error:', err)
      return null
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

  const updateHabit = async (updated: Habit) => {
    try {
      await supabase.from('habits').update({
        name: updated.name,
        icon: updated.icon,
        color_idx: updated.color_idx,
      }).eq('id', updated.id)
      setHabits(habits.map(h => h.id === updated.id ? updated : h))
    } catch (err) {
      console.error('Update error:', err)
    }
  }

  const toggleHabitToday = async (habitId: string) => {
    if (!user) return
    const today = todayKey()
    const isChecked = logs.some(l => l.habit_id === habitId && l.logged_date === today)

    try {
      if (isChecked) {
        await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('logged_date', today)
      } else {
        await supabase.from('habit_logs').insert({
          habit_id: habitId,
          user_id: user.id,
          logged_date: today,
        })
      }
      await loadUserData()
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  const markTodayAsCheatDay = async () => {
    if (!user || getCheatDaysRemaining() <= 0) return
    const today = todayKey()
    const { error } = await supabase.from('cheat_days_usage').upsert(
      { user_id: user.id, used_date: today },
      { onConflict: 'user_id,used_date', ignoreDuplicates: true }
    )
    if (error) {
      console.error('Error marking cheat day:', error.message)
      return
    }
    setCheatDayUsage([...cheatDayUsage, today])
    setIsTodayCheatDay(true)
  }

  const unmarkTodayAsCheatDay = async () => {
    if (!user) return
    const today = todayKey()
    const { error } = await supabase.from('cheat_days_usage').delete().eq('user_id', user.id).eq('used_date', today)
    if (error) {
      console.error('Error unmarking cheat day:', error)
      return
    }
    setCheatDayUsage(cheatDayUsage.filter(date => date !== today))
    setIsTodayCheatDay(false)
  }

  const skipHabit = async (habitId: string, date: string) => {
    if (!user || getSkipHabitsRemaining() <= 0) return
    try {
      await supabase.from('skipped_habits').insert({
        user_id: user.id,
        habit_id: habitId,
        date_skipped: date,
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

  const value: HabitDataContextValue = {
    user, habits, logs, carrots, cheatDayUsage, skippedHabits, isTodayCheatDay,
    weekStartDay, cheatDaysCount, cheatDaysPeriod, skipHabitsCount, skipHabitsPeriod, loading,
    todayKey, currentWeekNumber, weekKeys, calcStreak, getWeekPct, getDailyCarrotsThisWeek,
    getCheatDaysRemaining, getSkipHabitsRemaining, isHabitSkipped,
    addHabit, deleteHabit, updateHabit, toggleHabitToday,
    markTodayAsCheatDay, unmarkTodayAsCheatDay, skipHabit, unskipHabit,
    refresh: loadUserData,
  }

  return <HabitDataContext.Provider value={value}>{children}</HabitDataContext.Provider>
}

export function useHabitData() {
  const ctx = useContext(HabitDataContext)
  if (ctx === undefined) {
    throw new Error('useHabitData must be used within a HabitDataProvider')
  }
  return ctx
}
