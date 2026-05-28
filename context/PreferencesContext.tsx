'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const STORAGE_KEY = 'animations_enabled'

interface PreferencesContextValue {
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [animationsEnabled, setAnimationsEnabledState] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        setAnimationsEnabledState(stored === 'true')
      }
    } catch {
      // ignore (private browsing, etc.)
    }
  }, [])

  const setAnimationsEnabled = (enabled: boolean) => {
    setAnimationsEnabledState(enabled)
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      // ignore
    }
  }

  return (
    <PreferencesContext.Provider value={{ animationsEnabled, setAnimationsEnabled }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (ctx === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return ctx
}
