'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AddHabitModal } from '@/components/habits/AddHabitModal'
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
  const [showIconModal, setShowIconModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

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
    const keys = []
    const d = new Date()
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(d)
      dd.setDate(d.getDate() - i)
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

      const [habitsRes, logsRes, carrotsRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', session.user.id),
        supabase.from('habit_logs').select('*').eq('user_id', session.user.id),
        supabase.from('carrots').select('week_key').eq('user_id', session.user.id)
      ])

      if (habitsRes.data) setHabits(habitsRes.data as Habit[])
      if (logsRes.data) setLogs(logsRes.data as HabitLog[])
      if (carrotsRes.data) setCarrots(carrotsRes.data.map(c => c.week_key))
    } catch (err) {
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [router])

  // Real-time subscription for habit_logs
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('habit_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_logs'
        },
        async () => {
          const { data } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', user.id)
          if (data) setLogs(data as HabitLog[])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

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
    const trimmed = newHabitName.trim()
    if (!trimmed) {
      alert('Please enter a habit name')
      return
    }
    setShowAddModal(false)
    setShowIconModal(true)
  }

  const openAddHabitModal = () => {
    setNewHabitName('')
    setShowAddModal(true)
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const today = todayKey()
  const wk = weekKeys()
  const todayDone = habits.filter(h => logs.some(l => l.habit_id === h.id && l.logged_date === today)).length
  const weekPct = getWeekPct()

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Habit Rabbit 🐰</h1>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-xs text-gray-600 uppercase mb-1">Today</div>
            <div className="text-2xl font-bold text-green-600">{todayDone}/{habits.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-xs text-gray-600 uppercase mb-1">Carrots</div>
            <div className="text-2xl font-bold">{carrots.length}/52 🥕</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-xs text-gray-600 uppercase mb-1">This Week</div>
            <div className="text-2xl font-bold">{weekPct}%</div>
          </div>
        </div>

        {/* Track Progress */}
        <div className="bg-white p-6 rounded-lg mb-6">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">Week {currentWeekNumber()} of 52</h3>
            <span className="text-sm text-gray-600">{weekPct}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(weekPct, 100)}%` }}></div>
          </div>
          <p className="text-sm text-gray-600">
            {carrots.length >= 52
              ? '🎉 You collected all 52 carrots this year!'
              : todayDone === habits.length && habits.length > 0
              ? `All done today! Keep it up all week to earn carrot #${carrots.length + 1}.`
              : `Complete all habits every day this week to earn carrot #${carrots.length + 1} of 52.`}
          </p>
        </div>

        {/* Habits List */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Today's Habits</h3>
          {habits.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <div className="text-4xl mb-2">🐰</div>
              No habits yet! Add your first one below.
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map(habit => {
                const isDone = logs.some(l => l.habit_id === habit.id && l.logged_date === today)
                const streak = calcStreak(habit.id, wk)
                return (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-lg border ${isDone ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: COLORS[habit.color_idx || 0] }}>
                        {habit.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{habit.name}</div>
                        <div className="text-sm text-gray-600">
                          {streak > 0 ? `🔥 ${streak}-day streak` : 'Start today!'}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleHabitToday(habit.id)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          isDone ? 'bg-green-600 border-green-600' : 'border-gray-300 hover:border-green-600'
                        }`}
                      >
                        {isDone && <span className="text-white">✓</span>}
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="w-7 h-7 text-gray-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {wk.map((k, i) => (
                        <div
                          key={k}
                          className={`flex-1 h-1 rounded-full ${
                            logs.some(l => l.habit_id === habit.id && l.logged_date === k) ? 'bg-green-600' : 'bg-gray-200'
                          } ${i === wk.length - 1 ? 'ring-1 ring-green-600' : ''}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Habit Modal (opened from BottomNavBar) */}
        <AddHabitModal
          isOpen={showAddModal}
          habitName={newHabitName}
          setHabitName={setNewHabitName}
          onAddClick={handleAddClick}
          onClose={() => setShowAddModal(false)}
        />

        {/* Bottom Navigation */}
        <BottomNavBar
          userEmail={user?.email}
          onLogout={handleLogout}
        />

        {/* Icon Modal */}
        {showIconModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowIconModal(false)}>
            <div className="bg-white w-full max-w-md rounded-t-lg p-6 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold mb-4">Pick an icon</h3>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-lg ${
                      icon === selectedIcon ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowIconModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addHabit}
                  disabled={isAdding}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                >
                  {isAdding ? 'Adding...' : 'Add Habit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
