import { APP_NAME } from '@/lib/constants'

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-card-border safe-top">
      <div className="flex items-center justify-center h-14 px-4">
        {/* App Icon + Name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg viewBox="0 0 108 108" className="w-5 h-5">
              <path
                fill="white"
                d="M54,24 L58,24 L60,20 L64,20 L66,24 L70,26 L74,24 L77,27 L75,31 L78,34 L82,34 L84,38 L84,42 L80,44 L82,48 L82,52 L84,54 L84,58 L82,60 L80,64 L84,66 L84,70 L82,74 L78,74 L75,77 L77,81 L74,84 L70,82 L66,84 L64,88 L60,88 L58,84 L54,84 L50,84 L48,88 L44,88 L42,84 L38,82 L34,84 L31,81 L33,77 L30,74 L26,74 L24,70 L24,66 L28,64 L26,60 L26,56 L24,54 L24,50 L26,48 L28,44 L24,42 L24,38 L26,34 L30,34 L33,31 L31,27 L34,24 L38,26 L42,24 L44,20 L48,20 L50,24 Z"
              />
              <circle cx="54" cy="54" r="16" fill="#1E88E5" />
              <path
                fill="white"
                d="M54,42 L62,62 L58,62 L56,57 L52,57 L50,62 L46,62 L54,42z M54,48 L52.5,54 L55.5,54 L54,48z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-primary">{APP_NAME}</span>
        </div>
      </div>
    </header>
  )
}
