'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SidebarProps {
  userEmail?: string
  onLogout: () => void
}

export function Sidebar({ userEmail, onLogout }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-6 z-20 transition-all duration-300 ${
        isExpanded ? 'w-48' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center ${isExpanded ? 'px-4' : 'px-5'} justify-center mb-8`}>
        <div className="text-2xl">🐰</div>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Profile & Logout */}
      <div className={`flex flex-col gap-3 pb-4 ${isExpanded ? 'px-4 items-start' : 'px-5 items-center'}`}>
        {isExpanded ? (
          <>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Account</div>
            <Link href="/profile" className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ background: '#1D9E75' }}
                title={userEmail}
              >
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate dark:text-gray-100">{userEmail || 'User'}</p>
              </div>
            </Link>
            <button
              onClick={onLogout}
              className="w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              title="Sign out"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors mt-2"
              title="Collapse"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <Link href="/profile" className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-opacity hover:opacity-80" style={{ background: '#1D9E75' }} title={userEmail}>
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </Link>
            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Sign out"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              title="Expand"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
