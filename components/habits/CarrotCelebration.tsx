'use client'

import { useEffect, useRef } from 'react'

interface CarrotCelebrationProps {
  targetId: string
  onDone: () => void
}

export function CarrotCelebration({ targetId, onDone }: CarrotCelebrationProps) {
  const carrotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = carrotRef.current
    if (!el) return

    const target = document.getElementById(targetId)
    const startRect = el.getBoundingClientRect()
    let dx = 0
    let dy = -window.innerHeight / 3

    if (target) {
      const targetRect = target.getBoundingClientRect()
      dx = (targetRect.left + targetRect.width / 2) - (startRect.left + startRect.width / 2)
      dy = (targetRect.top + targetRect.height / 2) - (startRect.top + startRect.height / 2)
    }

    const animation = el.animate(
      [
        // Pop in from nothing
        { transform: 'translate(0, 0) scale(0)', opacity: 0, offset: 0 },
        // Overshoot for bounce feel
        { transform: 'translate(0, 0) scale(1.15)', opacity: 1, offset: 0.18 },
        // Settle to full size
        { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.25 },
        // Hold giant
        { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.55 },
        // Travel + shrink toward the small 🥕 in the StatsBar
        { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.95, offset: 0.95 },
        // Vanish at the target
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0, offset: 1 },
      ],
      {
        duration: 1700,
        easing: 'cubic-bezier(.6,.05,.3,1.1)',
        // Keep the final keyframe applied so the element doesn't snap back to its
        // initial "giant centered" rest state in the frame before React unmounts it.
        fill: 'forwards',
      }
    )

    let finished = false
    animation.onfinish = () => {
      finished = true
      onDone()
    }
    return () => {
      // Only cancel if we're tearing down mid-animation; cancelling a finished
      // animation also reverts the element to its initial style (= flicker).
      if (!finished) {
        animation.cancel()
      }
    }
  }, [targetId, onDone])

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      <div
        ref={carrotRef}
        style={{
          fontSize: '12rem',
          lineHeight: 1,
          willChange: 'transform',
          filter: 'drop-shadow(0 6px 24px rgba(240,144,48,0.45))',
        }}
      >
        🥕
      </div>
    </div>
  )
}
