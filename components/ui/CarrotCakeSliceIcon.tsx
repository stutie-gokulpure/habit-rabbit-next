interface CarrotCakeSliceIconProps {
  className?: string
}

export function CarrotCakeSliceIcon({ className }: CarrotCakeSliceIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top frosting dome */}
      <path d="M6 14 Q11 10 16 11 Q21 10 26 14 Z" fill="#FFF8E7" />

      {/* Cake layer 1 (top) */}
      <rect x="6" y="14" width="20" height="3" fill="#D49759" />
      {/* Cream filling */}
      <rect x="6" y="17" width="20" height="1.3" fill="#FFF8E7" />
      {/* Cake layer 2 (middle) */}
      <rect x="6" y="18.3" width="20" height="3" fill="#D49759" />
      {/* Cream filling */}
      <rect x="6" y="21.3" width="20" height="1.3" fill="#FFF8E7" />
      {/* Cake layer 3 (bottom) */}
      <rect x="6" y="22.6" width="20" height="3.4" fill="#D49759" />

      {/* Frosting drip on the left edge */}
      <path d="M6 14 L6 25 Q5 26 6 26.5 L7 26 L7 14 Z" fill="#FFF8E7" />

      {/* Left carrot (tilted, leaves left) */}
      <g transform="translate(11 7) rotate(-20)">
        <path d="M0 0 L0 3 L4 1.5 Z" fill="#F09030" />
        <circle cx="-1" cy="1.5" r="1.6" fill="#3DA055" />
      </g>

      {/* Right carrot (tilted opposite way) */}
      <g transform="translate(16 7) rotate(20)">
        <path d="M0 0 L0 3 L4 1.5 Z" fill="#F09030" />
        <circle cx="-1" cy="1.5" r="1.6" fill="#3DA055" />
      </g>
    </svg>
  )
}
