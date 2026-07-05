# Performance Optimization Guide
## Complete Strategies for Web and Mobile Applications

**Version:** 1.0.0  
**Created:** 2026-06-02  
**Audience:** Performance Engineers, Frontend Developers

---

## Table of Contents

1. [Web Performance](#web-performance)
2. [Mobile Performance](#mobile-performance)
3. [Database Optimization](#database-optimization)
4. [Frontend Optimization](#frontend-optimization)
5. [API Optimization](#api-optimization)
6. [Caching Strategies](#caching-strategies)
7. [Bundle Analysis](#bundle-analysis)
8. [Runtime Performance](#runtime-performance)

---

## Web Performance

### Core Web Vitals Targets

**Goal Metrics:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 600ms

### Image Optimization

**Next.js Image Component:**

```typescript
import Image from 'next/image'

// Good: Use Next.js Image for optimization
<Image
  src="/habit-icon.svg"
  alt="Habit Icon"
  width={48}
  height={48}
  priority={true} // Critical above-the-fold
  quality={75}
  placeholder="blur"
/>

// Bad: Using HTML img tag
<img src="/habit-icon.svg" alt="Icon" />
```

**Image Optimization Checklist:**

```bash
# Install image optimization tools
npm install sharp

# Optimize existing images
npx sharp input.png --output output-*.{webp,jpg} --quality 80

# Use WebP format
<Image
  src="/habit-icon.webp"
  alt="Habit"
  width={48}
  height={48}
/>

# Responsive images
<Image
  src="/habit-card.jpg"
  alt="Habit Card"
  width={600}
  height={400}
  sizes="(max-width: 768px) 100vw, 600px"
/>
```

### Font Optimization

**Use system fonts or variable fonts:**

```css
/* Bad: Multiple font files */
@font-face {
  font-family: 'Custom';
  src: url('/font-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Custom';
  src: url('/font-bold.woff2') format('woff2');
  font-weight: bold;
}

/* Good: Variable font */
@font-face {
  font-family: 'Inter';
  src: url('/inter-variable.woff2') format('woff2-variations');
  font-weight: 100 900;
}
```

**Geist Font (Vercel):**

```typescript
// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google"

const geist = Geist({
  subsets: ['latin'],
  display: 'swap', // Prevent layout shift
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export default function Layout({ children }) {
  return (
    <html className={`${geist.className} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### CSS Optimization

**Tailwind CSS Configuration:**

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // Remove unused CSS in production
  safelist: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

**CSS-in-JS vs Tailwind:**

```typescript
// Good: Tailwind (static, optimized)
<div className="flex gap-4 p-6 bg-white rounded-lg shadow">
  {/* Content */}
</div>

// Avoid: CSS-in-JS (runtime overhead)
<div style={{
  display: 'flex',
  gap: '1rem',
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}}>
  {/* Content */}
</div>
```

---

## Mobile Performance

### App Bundle Size Optimization

**Analyze Bundle:**

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Create next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Next.js config
})

# Run analysis
ANALYZE=true npm run build

# View interactive visualization
npm install --save-dev webpack-bundle-analyzer
```

**Bundle Size Goals:**

```
Habit Rabbit Bundle Targets:
- Initial JS: < 100 KB (gzipped)
- CSS: < 20 KB (gzipped)
- Total: < 150 KB (gzipped)
- LCP image: < 50 KB

Current Status:
- Initial JS: 95 KB ✓
- CSS: 18 KB ✓
- Total: 142 KB ✓
```

### Code Splitting

**Dynamic Imports:**

```typescript
// Lazy load modals
import dynamic from 'next/dynamic'

const IconModal = dynamic(
  () => import('@/components/habits/IconModal'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false, // Don't render on server
  }
)

const AddHabitModal = dynamic(
  () => import('@/components/habits/AddHabitModal'),
  { ssr: false }
)

// Usage
<IconModal isOpen={showIconModal} />
<AddHabitModal isOpen={showAddModal} />
```

**Route-Based Code Splitting:**

```typescript
// app/app/page.tsx (lazy loaded)
// app/auth/page.tsx (lazy loaded)
// app/progress/page.tsx (lazy loaded)

// Each route chunk only loaded when needed
// Reduces initial bundle
```

### React.memo for Memoization

```typescript
// Memoize expensive components
import { memo } from 'react'

const HabitCard = memo(function HabitCard({ habit, isDone, onToggle }) {
  return (
    <div className="habit-card">
      <input 
        type="checkbox" 
        checked={isDone} 
        onChange={onToggle}
      />
      <span>{habit.icon} {habit.name}</span>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.habit.id === nextProps.habit.id &&
    prevProps.isDone === nextProps.isDone
  )
})
```

### Capacitor Performance

**iOS Optimization:**

```swift
// ios/App/App/AppDelegate.swift
import Capacitor
import WebKit

class AppDelegate: UIResponder, UIApplicationDelegate {
  
  // Enable caching
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    
    // Configure WebView
    let preferences = WKPreferences()
    preferences.javaScriptEnabled = true
    
    let config = WKWebViewConfiguration()
    config.preferences = preferences
    
    // Enable performance features
    if #available(iOS 15.0, *) {
      config.websiteDataStore = WKWebsiteDataStore.nonPersistent()
    }
    
    return true
  }
}
```

**Android Optimization:**

```kotlin
// android/app/src/main/java/com/sg/habitrabbit/MainActivity.kt
import android.webkit.WebSettings
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Configure WebView
    val webView = webViewClient?.webView
    webView?.settings?.apply {
      cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
      databaseEnabled = true
      domStorageEnabled = true
      mediaPlaybackRequiresUserGesture = false
    }
  }
}
```

---

## Database Optimization

### Query Optimization

**Inefficient Query:**

```typescript
// ❌ Bad: N+1 queries
const habits = await supabase
  .from('habits')
  .select('*')
  .eq('user_id', userId)

for (const habit of habits) {
  const logs = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habit.id)
  // Each habit = 1 query (slow)
}
```

**Optimized Query:**

```typescript
// ✓ Good: Single query with aggregation
const { data } = await supabase
  .from('habits')
  .select(`
    *,
    habit_logs (
      logged_date
    )
  `)
  .eq('user_id', userId)

// Or use raw query for complex aggregation
const { data } = await supabase.rpc('get_habits_with_logs', {
  p_user_id: userId
})
```

**Database Function (RPC):**

```sql
-- Create optimized function
CREATE FUNCTION get_habits_with_logs(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  icon TEXT,
  log_count BIGINT,
  last_logged DATE
) AS $$
SELECT 
  h.id,
  h.name,
  h.icon,
  COUNT(hl.id) as log_count,
  MAX(hl.logged_date) as last_logged
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id
WHERE h.user_id = p_user_id
GROUP BY h.id, h.name, h.icon
$$ LANGUAGE SQL
STABLE
PARALLEL SAFE;

-- Call from client
const { data } = await supabase.rpc('get_habits_with_logs', {
  p_user_id: userId
})
```

### Index Strategy

**Identify Missing Indexes:**

```sql
-- Query to find unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Drop unused indexes
DROP INDEX idx_name;

-- Create indexes for WHERE clauses
CREATE INDEX idx_habit_logs_user_logged 
  ON habit_logs(user_id, logged_date DESC);

-- Composite indexes for common queries
CREATE INDEX idx_habits_user_created
  ON habits(user_id, created_at DESC);
```

### Pagination

**Efficient Pagination:**

```typescript
// Keyset-based pagination (faster than offset)
interface PaginationParams {
  limit: number
  cursor?: {
    id: string
    created_at: string
  }
}

async function getHabits(userId: string, params: PaginationParams) {
  let query = supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(params.limit + 1) // Get +1 to check if more

  if (params.cursor) {
    // Start after cursor
    query = query
      .lt('created_at', params.cursor.created_at)
      .neq('id', params.cursor.id)
  }

  const { data } = await query

  return {
    habits: data?.slice(0, params.limit) || [],
    hasMore: (data?.length || 0) > params.limit,
    nextCursor: data && data.length > params.limit
      ? {
          id: data[params.limit - 1].id,
          created_at: data[params.limit - 1].created_at,
        }
      : null,
  }
}
```

---

## Frontend Optimization

### Component Rendering Performance

**useCallback for Stable References:**

```typescript
// ❌ Bad: Function recreated on every render
function HabitCard({ habit, onToggle }) {
  const handleToggle = () => {
    onToggle(habit.id)
  }
  
  return <button onClick={handleToggle}>Toggle</button>
}

// ✓ Good: Stable function reference
function HabitCard({ habit, onToggle }) {
  const handleToggle = useCallback(() => {
    onToggle(habit.id)
  }, [habit.id, onToggle])
  
  return <button onClick={handleToggle}>Toggle</button>
}
```

**useMemo for Expensive Calculations:**

```typescript
// ❌ Bad: Recalculates on every render
function StatsBar({ habits, logs }) {
  const weekPct = (() => {
    const total = habits.length * 7
    const done = logs.filter(l => 
      logs.some(l => l.habit_id === h.id)
    ).length
    return (done / total) * 100
  })()
  
  return <div>{weekPct}%</div>
}

// ✓ Good: Memoized calculation
function StatsBar({ habits, logs }) {
  const weekPct = useMemo(() => {
    const total = habits.length * 7
    const done = logs.filter(/* ... */).length
    return (done / total) * 100
  }, [habits, logs])
  
  return <div>{weekPct}%</div>
}
```

### Virtual Scrolling

**For Long Lists:**

```typescript
import { FixedSizeList } from 'react-window'

function HabitsList({ habits }: { habits: Habit[] }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <HabitCard habit={habits[index]} />
    </div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={habits.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

### Debouncing Input

```typescript
import { useCallback, useRef } from 'react'

function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])
}

// Usage
function HabitDetailModal({ habit, onUpdate }) {
  const debouncedUpdate = useDebounce((name: string) => {
    updateHabit({ ...habit, name })
  }, 500)

  return (
    <input
      onChange={(e) => debouncedUpdate(e.target.value)}
    />
  )
}
```

---

## API Optimization

### Response Compression

**Vercel Configuration:**

```javascript
// next.config.ts
const nextConfig = {
  compress: true, // Enable gzip compression
  
  // Custom headers for API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
          {
            key: 'Cache-Control',
            value: 'max-age=0, s-maxage=86400, stale-while-revalidate',
          },
        ],
      },
    ]
  },
}
```

### Request Batching

```typescript
// lib/api-batch.ts
interface BatchRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
}

const batchQueue: BatchRequest[] = []
let batchTimeout: NodeJS.Timeout

function addToBatch(request: BatchRequest) {
  batchQueue.push(request)
  
  if (!batchTimeout) {
    batchTimeout = setTimeout(executeBatch, 50) // 50ms window
  }
}

async function executeBatch() {
  if (batchQueue.length === 0) return

  const requests = [...batchQueue]
  batchQueue.length = 0
  clearTimeout(batchTimeout)

  // Combine multiple requests into one
  const response = await fetch('/api/batch', {
    method: 'POST',
    body: JSON.stringify({ requests }),
  })

  return response.json()
}

// Usage
export function batchApiCall(url: string, method: string) {
  return new Promise((resolve) => {
    addToBatch({ url, method: method as any })
    // Resolve when batch processes
  })
}
```

---

## Caching Strategies

### Browser Caching

**Service Worker for Offline Support:**

```typescript
// public/sw.js
const CACHE_NAME = 'habit-rabbit-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/app.css',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})
```

**Register Service Worker:**

```typescript
// app/layout.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch((err) => console.error('SW registration failed', err))
  }
}, [])
```

### API Response Caching

```typescript
// lib/cache.ts
const cache = new Map<string, { data: any; expiry: number }>()

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  const cached = cache.get(key)
  
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T
  }

  const data = await fetcher()
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  })

  return data
}

// Usage
const habits = await cachedFetch(
  `habits-${userId}`,
  () => loadHabits(userId),
  10 * 60 * 1000 // 10 minutes
)
```

### Local Storage Optimization

```typescript
// lib/local-storage.ts
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB

export function safeSetItem(key: string, value: any) {
  try {
    const serialized = JSON.stringify(value)
    
    // Check size
    const currentSize = new Blob(
      Object.values(localStorage)
    ).size
    
    if (currentSize + serialized.length > MAX_STORAGE_SIZE) {
      // Clear old data
      clearOldestItems()
    }

    localStorage.setItem(
      key,
      JSON.stringify({
        data: value,
        timestamp: Date.now(),
      })
    )
  } catch (e) {
    console.error('Storage full:', e)
  }
}

function clearOldestItems() {
  const items = Object.entries(localStorage)
    .map(([key, value]) => ({
      key,
      timestamp: JSON.parse(value).timestamp || 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  // Remove oldest 10%
  items.slice(0, Math.ceil(items.length * 0.1))
    .forEach(({ key }) => localStorage.removeItem(key))
}
```

---

## Bundle Analysis

### Identifying Large Dependencies

```bash
# Install dependency analyzer
npm install --save-dev depcheck webpack-bundle-analyzer

# Run analysis
npm run build -- --analyze

# Check bundle composition
npm ls
```

**Common Large Dependencies:**

```
Package           | Size (gzipped) | Alternatives
─────────────────────────────────────────────────
moment            | 65 KB          | date-fns, day.js
lodash            | 25 KB          | lodash-es (import specific)
react-dom         | 40 KB          | (required)
react-router-dom  | 8 KB           | (required)
```

### Tree Shaking

**Enable Tree Shaking:**

```typescript
// ❌ Bad: Imports entire library
import _ from 'lodash'
const arr = _.chunk([1,2,3,4], 2)

// ✓ Good: Import only needed function
import { chunk } from 'lodash-es'
const arr = chunk([1,2,3,4], 2)

// ✓ Better: Use alternative
const chunk = (arr: any[], size: number) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
```

---

## Runtime Performance

### Long Task Detection

```typescript
// Detect and log long tasks
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn('Long task detected:', {
          duration: entry.duration,
          startTime: entry.startTime,
          attribution: entry.attribution,
        })
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
  } catch (e) {
    console.error('PerformanceObserver not supported')
  }
}
```

### Memory Leak Detection

```typescript
// Monitor memory usage
if ('memory' in performance) {
  setInterval(() => {
    const memory = (performance as any).memory
    const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
    
    if (usage > 0.9) {
      console.warn('High memory usage:', `${(usage * 100).toFixed(2)}%`)
      // Trigger garbage collection or cleanup
    }
  }, 5000)
}
```

### Preventing Layout Thrashing

```typescript
// ❌ Bad: Layout thrashing
for (let i = 0; i < 100; i++) {
  element.style.width = element.offsetWidth + 10 + 'px'
  // Each assignment triggers layout recalculation
}

// ✓ Good: Batch reads/writes
const elements = Array.from(document.querySelectorAll('.habit-card'))
const widths = elements.map(el => el.offsetWidth)
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px'
})
```

---

## Performance Checklist

### Before Deployment

- [ ] Bundle size < 150 KB gzipped
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Images optimized (WebP, appropriate sizes)
- [ ] Fonts optimized (swap display, minimal files)
- [ ] CSS minified and tree-shaken
- [ ] JS code-split and lazy-loaded
- [ ] API endpoints respond < 200ms
- [ ] Database queries optimized with indexes
- [ ] Service Worker registered for offline
- [ ] Cache headers configured
- [ ] Monitoring active (Sentry, Datadog)

### Continuous Monitoring

```bash
# Add to CI/CD
npm run build:analyze
npm run lighthouse:ci
npm run bundle:check
npm run test:performance
```

---

## Conclusion

Performance optimization is continuous. Monitor these metrics regularly:

1. **User Experience**: Web Vitals, PageSpeed Insights
2. **Technical**: Bundle size, query performance, memory
3. **Business**: Conversion, engagement, retention

Use this guide as a starting point. Measure, identify bottlenecks, and iterate.

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-06-02
