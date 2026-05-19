'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormButton } from '@/components/ui'
import { useTheme } from '@/context/ThemeContext'
import { BottomNavBar } from '@/components/layout/BottomNavBar'

export default function ProfilePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [cheatDaysCount, setCheatDaysCount] = useState(2)
  const [cheatDaysPeriod, setCheatDaysPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [savedCheatDaysCount, setSavedCheatDaysCount] = useState(2)
  const [savedCheatDaysPeriod, setSavedCheatDaysPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [hasUnsavedCheatDays, setHasUnsavedCheatDays] = useState(false)
  const [skipHabitsCount, setSkipHabitsCount] = useState(1)
  const [skipHabitsPeriod, setSkipHabitsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [savedSkipHabitsCount, setSavedSkipHabitsCount] = useState(1)
  const [savedSkipHabitsPeriod, setSavedSkipHabitsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [hasUnsavedSkipHabits, setHasUnsavedSkipHabits] = useState(false)
  const [savingSkipHabits, setSavingSkipHabits] = useState(false)
  const [skipHabitsMessage, setSkipHabitsMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingDisplayName, setSavingDisplayName] = useState(false)
  const [savingCheatDays, setSavingCheatDays] = useState(false)
  const [avatarMessage, setAvatarMessage] = useState('')
  const [displayNameMessage, setDisplayNameMessage] = useState('')
  const [cheatDaysMessage, setCheatDaysMessage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      setDisplayName(user.user_metadata?.display_name || '')
      setAvatarUrl(user.user_metadata?.avatar_url || '')
      const savedCount = user.user_metadata?.cheat_days_count || 2
      const savedPeriod = user.user_metadata?.cheat_days_period || 'weekly'
      setCheatDaysCount(savedCount)
      setCheatDaysPeriod(savedPeriod)
      setSavedCheatDaysCount(savedCount)
      setSavedCheatDaysPeriod(savedPeriod)

      const savedSkipCount = user.user_metadata?.skip_habits_count || 1
      const savedSkipPeriod = user.user_metadata?.skip_habits_period || 'daily'
      setSkipHabitsCount(savedSkipCount)
      setSkipHabitsPeriod(savedSkipPeriod)
      setSavedSkipHabitsCount(savedSkipCount)
      setSavedSkipHabitsPeriod(savedSkipPeriod)
      setLoading(false)
    }
    loadUser()
  }, [router])

  useEffect(() => {
    if (cheatDaysPeriod !== savedCheatDaysPeriod) {
      setCheatDaysCount(0)
      setHasUnsavedCheatDays(true)
    }
  }, [cheatDaysPeriod, savedCheatDaysPeriod])

  useEffect(() => {
    if (cheatDaysCount !== savedCheatDaysCount || cheatDaysPeriod !== savedCheatDaysPeriod) {
      setHasUnsavedCheatDays(true)
    } else {
      setHasUnsavedCheatDays(false)
    }
  }, [cheatDaysCount, cheatDaysPeriod, savedCheatDaysCount, savedCheatDaysPeriod])

  useEffect(() => {
    if (skipHabitsPeriod !== savedSkipHabitsPeriod) {
      setSkipHabitsCount(0)
      setHasUnsavedSkipHabits(true)
    }
  }, [skipHabitsPeriod, savedSkipHabitsPeriod])

  useEffect(() => {
    if (skipHabitsCount !== savedSkipHabitsCount || skipHabitsPeriod !== savedSkipHabitsPeriod) {
      setHasUnsavedSkipHabits(true)
    } else {
      setHasUnsavedSkipHabits(false)
    }
  }, [skipHabitsCount, skipHabitsPeriod, savedSkipHabitsCount, savedSkipHabitsPeriod])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedCheatDays) {
        setCheatDaysCount(savedCheatDaysCount)
        setCheatDaysPeriod(savedCheatDaysPeriod)
        setHasUnsavedCheatDays(false)
      }
      if (hasUnsavedSkipHabits) {
        setSkipHabitsCount(savedSkipHabitsCount)
        setSkipHabitsPeriod(savedSkipHabitsPeriod)
        setHasUnsavedSkipHabits(false)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedCheatDays, hasUnsavedSkipHabits, savedCheatDaysCount, savedCheatDaysPeriod, savedSkipHabitsCount, savedSkipHabitsPeriod])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && user) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = async () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload immediately
      setSavingAvatar(true)
      setAvatarMessage('')
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
        const newAvatarUrl = data.publicUrl

        const { error } = await supabase.auth.updateUser({
          data: {
            avatar_url: newAvatarUrl,
          },
        })

        if (error) throw error
        setAvatarUrl(newAvatarUrl)
        setAvatarFile(null)
        setAvatarPreview('')
        setAvatarMessage('Profile picture updated successfully!')
      } catch (err) {
        setAvatarMessage(err instanceof Error ? err.message : 'Failed to upload profile picture')
      } finally {
        setSavingAvatar(false)
      }
    }
  }

  const saveDisplayName = async () => {
    setSavingDisplayName(true)
    setDisplayNameMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
        },
      })

      if (error) throw error
      setDisplayNameMessage('Display name updated successfully!')
    } catch (err) {
      setDisplayNameMessage(err instanceof Error ? err.message : 'Failed to save display name')
    } finally {
      setSavingDisplayName(false)
    }
  }

  const saveCheatDays = async () => {
    setSavingCheatDays(true)
    setCheatDaysMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          cheat_days_count: cheatDaysCount,
          cheat_days_period: cheatDaysPeriod,
        },
      })

      if (error) throw error
      setSavedCheatDaysCount(cheatDaysCount)
      setSavedCheatDaysPeriod(cheatDaysPeriod)
      setHasUnsavedCheatDays(false)
      setCheatDaysMessage('Cheat days settings updated successfully!')
    } catch (err) {
      setCheatDaysMessage(err instanceof Error ? err.message : 'Failed to save cheat days settings')
    } finally {
      setSavingCheatDays(false)
    }
  }

  const saveSkipHabits = async () => {
    setSavingSkipHabits(true)
    setSkipHabitsMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          skip_habits_count: skipHabitsCount,
          skip_habits_period: skipHabitsPeriod,
        },
      })

      if (error) throw error
      setSavedSkipHabitsCount(skipHabitsCount)
      setSavedSkipHabitsPeriod(skipHabitsPeriod)
      setHasUnsavedSkipHabits(false)
      setSkipHabitsMessage('Skip habits settings updated successfully!')
    } catch (err) {
      setSkipHabitsMessage(err instanceof Error ? err.message : 'Failed to save skip habits settings')
    } finally {
      setSavingSkipHabits(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')

    if (!newPassword || !confirmPassword) {
      setPasswordMessage('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      setPasswordMessage('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#1D9E75' }}>Profile Settings</h1>

        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex-shrink-0">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold" style={{ background: '#1D9E75' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Current avatar" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    user?.email?.charAt(0).toUpperCase()
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-lg border border-gray-300 dark:border-gray-600">
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Click the edit icon to upload a new profile picture</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or GIF (max. 5MB)</p>
              </div>
            </div>
            {avatarMessage && (
              <div className={`p-4 rounded-lg mt-4 text-sm ${avatarMessage.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                {avatarMessage}
              </div>
            )}
          </div>

          {/* Display Name Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-gray-100">Display Name</h2>
              <button
                onClick={saveDisplayName}
                disabled={savingDisplayName}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Save display name"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
              </button>
            </div>
            <FormInput
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required={false}
            />
            {displayNameMessage && (
              <div className={`p-4 rounded-lg mt-4 text-sm ${displayNameMessage.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                {displayNameMessage}
              </div>
            )}
          </div>

          {/* Cheat Days Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-gray-100">Cheat Days</h2>
              <button
                onClick={saveCheatDays}
                disabled={savingCheatDays}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Save cheat days settings"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Skip days while maintaining your streak</p>

            <div className="space-y-4">
              {/* Number of cheat days */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-100">Number of Cheat Days</label>
                <input
                  type="number"
                  min="1"
                  value={cheatDaysCount}
                  onChange={(e) => {
                    const value = Number(e.target.value) || 1
                    const max = cheatDaysPeriod === 'weekly' ? 7 : 31
                    setCheatDaysCount(Math.min(Math.max(value, 1), max))
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  style={{ '--tw-ring-color': '#1D9E75' } as React.CSSProperties}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum {cheatDaysPeriod === 'weekly' ? '7' : '31'} days
                </p>
              </div>

              {/* Period selection */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-100">Reset Period</label>
                <div className="flex gap-3">
                  {(['weekly', 'monthly'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setCheatDaysPeriod(period)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all capitalize ${
                        cheatDaysPeriod === period
                          ? 'text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      style={cheatDaysPeriod === period ? { background: '#1D9E75' } : {}}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {cheatDaysMessage && (
              <div className={`p-4 rounded-lg mt-4 text-sm ${cheatDaysMessage.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                {cheatDaysMessage}
              </div>
            )}
          </div>

          {/* Skip Habits Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-gray-100">Skip Habits</h2>
              <button
                onClick={saveSkipHabits}
                disabled={savingSkipHabits}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Save skip habits settings"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Skip individual habits while maintaining your streak</p>

            <div className="space-y-4">
              {/* Number of skip habits */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-100">Number of Habits to Skip</label>
                <input
                  type="number"
                  min="1"
                  value={skipHabitsCount}
                  onChange={(e) => {
                    const value = Number(e.target.value) || 1
                    const max = skipHabitsPeriod === 'daily' ? 10 : skipHabitsPeriod === 'weekly' ? 30 : 90
                    setSkipHabitsCount(Math.min(Math.max(value, 1), max))
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  style={{ '--tw-ring-color': '#1D9E75' } as React.CSSProperties}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum {skipHabitsPeriod === 'daily' ? '10' : skipHabitsPeriod === 'weekly' ? '30' : '90'}
                </p>
              </div>

              {/* Period selection */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-100">Reset Period</label>
                <div className="flex gap-3">
                  {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSkipHabitsPeriod(period)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all capitalize ${
                        skipHabitsPeriod === period
                          ? 'text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      style={skipHabitsPeriod === period ? { background: '#1D9E75' } : {}}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {skipHabitsMessage && (
              <div className={`p-4 rounded-lg mt-4 text-sm ${skipHabitsMessage.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                {skipHabitsMessage}
              </div>
            )}
          </div>

          {/* Appearance Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Appearance</h2>
            <div className="flex gap-3">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all capitalize ${
                    theme === mode
                      ? 'text-white dark:text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  style={theme === mode ? { background: '#1D9E75' } : {}}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <FormInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required={false}
              />
              <FormInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={false}
              />
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full px-4 py-2 rounded-lg font-semibold transition-colors text-white"
                style={{ background: '#1D9E75' }}
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
              {passwordMessage && (
                <div className={`p-3 rounded-lg text-sm ${passwordMessage.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                  {passwordMessage}
                </div>
              )}
            </form>
          </div>

          {/* Back Link */}
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar
        userEmail={user?.email}
        onAddHabitClick={() => {}}
        onLogout={async () => {
          await supabase.auth.signOut()
          router.push('/auth')
        }}
      />
    </div>
  )
}
