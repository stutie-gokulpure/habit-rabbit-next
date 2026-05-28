'use client'

import { useEffect, useRef, useState } from 'react'

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const [positionBelow, setPositionBelow] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !wrapperRef.current) return

    // Check if there's enough space above (120px threshold for tooltip + gap)
    const rect = wrapperRef.current.getBoundingClientRect()
    const spaceAbove = rect.top
    setPositionBelow(spaceAbove < 120)
  }, [open])

  useEffect(() => {
    if (!open) return
    // Close tooltip when clicking outside of it (but allow other elements like bottom nav to respond)
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    // Use 'click' not 'mousedown' so event propagation respects stopPropagation calls
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [open])

  return (
    <>
      <div ref={wrapperRef} className="relative inline-flex">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold italic flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="More info"
          aria-expanded={open}
        >
          i
        </button>
        {open && (
          <div
            role="tooltip"
            onClick={(e) => e.stopPropagation()}
            className={`absolute left-1/2 -translate-x-1/2 z-10 w-72 max-w-[90vw] p-3 text-sm bg-gray-900 text-gray-100 dark:bg-gray-700 rounded-lg shadow-lg ${
              positionBelow ? 'top-full mt-2' : 'bottom-full mb-2'
            }`}
          >
            {/* Arrow pointing to the i */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 ${
                positionBelow ? '-top-1.5' : '-bottom-1.5'
              }`}
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: positionBelow ? 'none' : '6px solid rgb(17, 24, 39)',
                borderBottom: positionBelow ? '6px solid rgb(17, 24, 39)' : 'none',
                // Dark mode colors
                ...(typeof window !== 'undefined' &&
                document.documentElement.classList.contains('dark')
                  ? {
                      borderTop: positionBelow ? 'none' : '6px solid rgb(55, 65, 81)',
                      borderBottom: positionBelow ? '6px solid rgb(55, 65, 81)' : 'none',
                    }
                  : {}),
              }}
              aria-hidden="true"
            />
            {text}
          </div>
        )}
      </div>

      {/* Transparent overlay blocking interaction with everything except the bottom nav bar */}
      {open && (
        <div
          className="fixed inset-0 bottom-24 z-40 bg-black/0 cursor-not-allowed"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
