# Advanced Deployment Guide for Habit Rabbit
## Production Infrastructure, CI/CD, Monitoring & Scaling

**Version:** 1.0.0  
**Created:** 2026-06-02  
**Audience:** DevOps Engineers, Backend Engineers, Release Managers

---

## Table of Contents

1. [Production Infrastructure Setup](#production-infrastructure-setup)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Environment Management](#environment-management)
4. [Database Scaling](#database-scaling)
5. [Monitoring & Observability](#monitoring--observability)
6. [Error Tracking](#error-tracking)
7. [Performance Monitoring](#performance-monitoring)
8. [Backup & Disaster Recovery](#backup--disaster-recovery)
9. [DNS & CDN Configuration](#dns--cdn-configuration)
10. [Multi-Region Deployment](#multi-region-deployment)
11. [Load Testing](#load-testing)
12. [Incident Response](#incident-response)

---

## Production Infrastructure Setup

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   CloudFlare CDN     │ (DDoS Protection, Caching)
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │  Vercel Edge Network │ (Global Distribution)
        └──────────┬───────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐   ┌────────┐   ┌────────┐
│ Region1│   │ Region2│   │ Region3│
│ (US)   │   │(Europe)│   │(APAC)  │
└────────┘   └────────┘   └────────┘
    │              │              │
    └──────────────┼──────────────┘
                   ▼
        ┌──────────────────────┐
        │  Supabase Database   │ (PostgreSQL)
        │  (Primary Region)    │
        └──────────┬───────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    ┌─────────┐          ┌─────────┐
    │ Backups │          │ Replicas│
    │ (S3)    │          │ (Read)  │
    └─────────┘          └─────────┘
```

### Vercel Configuration

**Production Deployment:**

```javascript
// vercel.json (Advanced)
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": {
      "value": "@supabase_url_prod"
    },
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": {
      "value": "@supabase_key_prod"
    }
  },

  "regions": ["iad1", "lhr1", "sfo1", "sin1", "syd1"],
  
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },

  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=0, s-maxage=86400, stale-while-revalidate=604800"
        }
      ]
    }
  ],

  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

**Environment Variables Setup:**

```bash
# Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Production-only variables
vercel env add --environment=production SENTRY_AUTH_TOKEN
vercel env add --environment=production DATADOG_API_KEY

# Preview environment
vercel env add --environment=preview NEXT_PUBLIC_DEBUG=true
```

### Supabase Production Setup

**Backup Configuration:**

```sql
-- Enable automated backups
-- Go to Supabase Dashboard > Settings > Backups

-- Set backup frequency to daily
-- Retention: 30 days minimum

-- Manual backup script
psql postgresql://user:password@db.supabase.co:5432/postgres \
  -c "BACKUP DATABASE TO 's3://backup-bucket/habit-rabbit-$(date +%Y-%m-%d).sql'"
```

**High Availability Setup:**

```sql
-- Enable read replicas
-- Supabase Dashboard > Settings > Database > Replicas

-- Configure 2-3 read replicas in different regions
-- Point analytics queries to replicas

-- Connection pooling configuration
-- PgBouncer settings in Supabase:
SET pool_mode = 'transaction';
SET max_client_conn = 1000;
SET max_db_connections = 100;
SET reserve_pool_size = 5;
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint
        continue-on-error: true

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm run test
        if: hashFiles('**/__tests__/**') != ''

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL_TEST }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_KEY_TEST }}

  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true

      - name: Create deployment notification
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Production deployment successful",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Habit Rabbit Production Deployment*\n${{ github.actor }} deployed commit ${{ github.sha }}"
                  }
                }
              ]
            }

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "❌ Production deployment failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Failed*\nCheck logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
```

### Staging Deployment Pipeline

**File:** `.github/workflows/staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel Preview
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: false
```

### Mobile App Release Pipeline

**File:** `.github/workflows/mobile-release.yml`

```yaml
name: Build & Release Mobile Apps

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  ios-build:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web assets
        run: npm run build

      - name: Sync iOS
        run: npx cap sync ios

      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: latest-stable

      - name: Build iOS
        run: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace \
            -scheme App \
            -configuration Release \
            -derivedDataPath build \
            archive -archivePath build/App.xcarchive

      - name: Export IPA
        run: |
          xcodebuild -exportArchive \
            -archivePath ios/App/build/App.xcarchive \
            -exportOptionsPlist ios/App/export.plist \
            -exportPath ios/App/build/ipa

      - name: Upload to TestFlight
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: ios/App/build/ipa/App.ipa
          issuer-id: ${{ secrets.APPLE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPLE_API_KEY_ID }}
          api-private-key: ${{ secrets.APPLE_API_PRIVATE_KEY }}

  android-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '11'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web assets
        run: npm run build

      - name: Sync Android
        run: npx cap sync android

      - name: Build AAB
        run: |
          cd android
          ./gradlew bundleRelease \
            -Pandroid.useAndroidX=true \
            -Pandroid.enableJetifier=true

      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_KEY }}
          packageName: com.sg.habitrabbit
          releaseFiles: 'android/app/build/outputs/bundle/release/*.aab'
          track: internal
          whatsNewDirectory: whatsnew

      - name: Promote to Beta
        if: success()
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_KEY }}
          packageName: com.sg.habitrabbit
          releaseFiles: 'android/app/build/outputs/bundle/release/*.aab'
          track: beta
          inAppUpdatePriority: 3
```

---

## Environment Management

### Multi-Environment Setup

**Development:**
```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-key-here
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**Staging:**
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key-here
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SENTRY_ENABLED=true
```

**Production:**
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key-here
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SENTRY_ENABLED=true
SENTRY_ENVIRONMENT=production
DATADOG_ENABLED=true
```

### Secret Management

**GitHub Secrets Configuration:**

```bash
# Authentication
SUPABASE_URL_PROD
SUPABASE_KEY_PROD
SUPABASE_URL_STAGING
SUPABASE_KEY_STAGING

# Deployment
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Mobile
APPLE_ISSUER_ID
APPLE_API_KEY_ID
APPLE_API_PRIVATE_KEY
PLAY_STORE_KEY
SIGNING_KEY

# Monitoring
SENTRY_AUTH_TOKEN
DATADOG_API_KEY

# Notifications
SLACK_WEBHOOK
```

**Using AWS Secrets Manager (Alternative):**

```bash
# Store secrets
aws secretsmanager create-secret \
  --name habit-rabbit/prod \
  --secret-string '{
    "supabase_url": "...",
    "supabase_key": "...",
    "sentry_token": "..."
  }'

# Retrieve in CI/CD
aws secretsmanager get-secret-value \
  --secret-id habit-rabbit/prod \
  --query SecretString \
  --output text
```

---

## Database Scaling

### Connection Pooling

**Supabase Connection Pooling Settings:**

```sql
-- Configure in Supabase dashboard
-- Settings > Database > Connection Pooling

-- Pool mode: Transaction (for web apps)
-- Max client connections: 1000
-- Connection timeout: 30s
-- Idle timeout: 600s

-- Test connection pool
SELECT count(*) FROM pg_stat_activity;
-- Should show ~20-50 active connections

-- Query performance
SELECT 
  query,
  calls,
  mean_time,
  total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Query Optimization

**Add Indexes:**

```sql
-- Habit queries (by user)
CREATE INDEX idx_habits_user_created 
  ON habits(user_id, created_at DESC);

-- Log queries (by date)
CREATE INDEX idx_habit_logs_user_date 
  ON habit_logs(user_id, logged_date DESC);

-- Fast lookups
CREATE INDEX idx_habit_logs_unique 
  ON habit_logs(habit_id, logged_date);

-- Carrot queries
CREATE INDEX idx_carrots_user_week 
  ON carrots(user_id, week_key DESC);

-- Monitor index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Read Replicas

**Setup Read Replicas:**

```sql
-- Create read replica in different region
-- Supabase > Settings > Database > Replicas

-- Point read-heavy queries to replica
-- Example: Analytics queries, reports

SELECT * FROM habits 
WHERE user_id = 'user-uuid'
AT REPLICA; -- Hypothetical syntax
```

**Application Configuration:**

```typescript
// lib/supabase-replica.ts
import { createClient } from '@supabase/supabase-js'

const replicaClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  {
    db: {
      schema: 'public'
      // Route to read replica endpoint
    }
  }
)

// Use for read-only operations
export async function getHabitsForAnalytics(userId: string) {
  return replicaClient
    .from('habits')
    .select('*')
    .eq('user_id', userId)
}
```

### Partitioning

**Partition Large Tables by Date:**

```sql
-- Partition habit_logs by month
CREATE TABLE habit_logs_partitioned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  habit_id UUID NOT NULL,
  logged_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (logged_date);

-- Create partitions
CREATE TABLE habit_logs_2026_01 
  PARTITION OF habit_logs_partitioned
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE habit_logs_2026_02 
  PARTITION OF habit_logs_partitioned
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Indexes on partitions
CREATE INDEX idx_logs_2026_01_user 
  ON habit_logs_2026_01(user_id, logged_date DESC);
```

---

## Monitoring & Observability

### Sentry Error Tracking

**Setup:**

```typescript
// app/layout.tsx
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    ReplaySessionSampleRate: 0.1,
    ReplayOnErrorSampleRate: 1.0,
  });
}
```

**Error Handling:**

```typescript
// Capture errors
try {
  await supabase.from('habits').select('*')
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'habit_loading',
      user_id: user?.id,
    },
    level: 'error',
  })
  throw error
}

// Capture messages
Sentry.captureMessage('Cheat day awarded', 'info')

// Transaction tracking
const transaction = Sentry.startTransaction({
  op: "http.client",
  name: "GET /api/habits",
});

const span = transaction.startChild({
  op: "db.query",
  description: "select habits",
});

// ... operation ...

span.finish();
transaction.finish();
```

**Alerts Configuration:**

```yaml
# .sentry/alerts.yml
alerts:
  - name: "High Error Rate"
    condition:
      event.error_rate >= 5%
      over_time: 15m
    notification: slack
    
  - name: "Crash in Mobile App"
    condition:
      event.error.type in ["MOBILE_CRASH"]
    notification: 
      - slack
      - pagerduty
    severity: critical
    
  - name: "Database Connection Error"
    condition:
      event.message contains "connection refused"
    notification: slack
    severity: warning
```

### Datadog Monitoring

**Installation:**

```bash
npm install @datadog/browser-rum @datadog/browser-logs
```

**Setup:**

```typescript
// app/layout.tsx
import { datadogRum } from '@datadog/browser-rum'
import { datadogLogs } from '@datadog/browser-logs'

if (process.env.NEXT_PUBLIC_DATADOG_ENABLED === 'true') {
  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DATADOG_APP_ID,
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'habit-rabbit',
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  })

  datadogRum.startSessionReplayRecording()

  datadogLogs.init({
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
  })
}
```

**Custom Metrics:**

```typescript
// Track habit creation
datadogRum.addAction('habit_created', {
  habit_name: name,
  habit_icon: icon,
  user_id: user.id,
})

// Track performance
const navigationTiming = performance.getEntriesByType('navigation')[0]
datadogRum.startMeasure('page_load', {
  duration: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
})
```

### Custom Logging

**Logger Setup:**

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const logger = {
  debug: (message: string, context?: any) => {
    console.debug(`[DEBUG] ${message}`, context)
    if (process.env.NODE_ENV === 'production') {
      // Send to Datadog
      datadogLogs.logger.debug(message, { context })
    }
  },

  info: (message: string, context?: any) => {
    console.info(`[INFO] ${message}`, context)
    datadogLogs.logger.info(message, { context })
  },

  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, context)
    datadogLogs.logger.warn(message, { context })
  },

  error: (message: string, error?: Error, context?: any) => {
    console.error(`[ERROR] ${message}`, error, context)
    Sentry.captureException(error, { extra: context })
    datadogLogs.logger.error(message, { error, context })
  },
}

export default logger
```

**Usage:**

```typescript
logger.info('User signed in', { user_id: user.id })
logger.warn('Cheat day limit approaching', { remaining: 1 })
logger.error('Failed to create habit', error, { habit_name })
```

---

## Error Tracking

### Error Categories

**Authentication Errors:**

```typescript
const authErrors = {
  'invalid_credentials': 'Email or password is incorrect',
  'user_not_confirmed': 'Please confirm your email address',
  'email_already_registered': 'This email is already in use',
  'weak_password': 'Password must be at least 8 characters',
  'session_expired': 'Your session has expired. Please sign in again',
}
```

**Database Errors:**

```typescript
const dbErrors = {
  '23505': 'This record already exists',
  '23503': 'Cannot delete - related records exist',
  '42P01': 'Table not found',
  '08006': 'Database connection lost',
  'PGRST116': 'Record not found',
}
```

**Validation Errors:**

```typescript
interface ValidationError {
  field: string
  message: string
  code: string
}

function validateHabitName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return {
      field: 'name',
      message: 'Habit name is required',
      code: 'REQUIRED',
    }
  }
  if (name.length > 50) {
    return {
      field: 'name',
      message: 'Habit name must be 50 characters or less',
      code: 'MAX_LENGTH',
    }
  }
  return null
}
```

### Error Recovery Strategies

**Automatic Retry Logic:**

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (attempt === maxRetries - 1) {
        throw error
      }

      // Only retry on transient errors
      if (!isTransientError(error)) {
        throw error
      }

      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw new Error('Max retries exceeded')
}

function isTransientError(error: any): boolean {
  return (
    error.code === '08006' || // Connection lost
    error.code === '08003' || // Connection does not exist
    error.message?.includes('timeout') ||
    error.message?.includes('ECONNRESET')
  )
}

// Usage
const habits = await withRetry(() =>
  supabase.from('habits').select('*')
)
```

**Graceful Degradation:**

```typescript
export async function loadHabitsWithFallback(userId: string) {
  try {
    // Try primary load
    const habits = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)

    return habits
  } catch (error) {
    // Fallback 1: Try cached data from localStorage
    const cached = localStorage.getItem(`habits_${userId}`)
    if (cached) {
      logger.warn('Using cached habits due to database error', { error })
      return JSON.parse(cached)
    }

    // Fallback 2: Return empty array with offline indicator
    logger.error('Failed to load habits', error as Error)
    return []
  }
}
```

---

## Performance Monitoring

### Web Vitals Tracking

```typescript
// lib/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

const vitals = {
  CLS: 0,  // Cumulative Layout Shift
  FID: 0,  // First Input Delay
  FCP: 0,  // First Contentful Paint
  LCP: 0,  // Largest Contentful Paint
  TTFB: 0, // Time to First Byte
}

function reportWebVitals() {
  onCLS(metric => {
    vitals.CLS = metric.value
    trackMetric('CLS', metric.value, {
      rating: metric.rating,
      delta: metric.delta,
    })
  })

  onFID(metric => {
    vitals.FID = metric.value
    trackMetric('FID', metric.value, {
      rating: metric.rating,
    })
  })

  onFCP(metric => {
    vitals.FCP = metric.value
    trackMetric('FCP', metric.value)
  })

  onLCP(metric => {
    vitals.LCP = metric.value
    trackMetric('LCP', metric.value, {
      rating: metric.rating,
    })
  })

  onTTFB(metric => {
    vitals.TTFB = metric.value
    trackMetric('TTFB', metric.value)
  })
}

function trackMetric(name: string, value: number, context?: any) {
  datadogRum.addError(
    new Error(`Web Vital: ${name}=${value}`),
    { context }
  )
}

export { reportWebVitals, vitals }
```

**Usage in app:**

```typescript
// app/layout.tsx
'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/web-vitals'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    reportWebVitals()
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### Bundle Analysis

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Create next.config.js with analyzer
ANALYZE=true npm run build
```

**Output Example:**
```
NEXT Bundle Analysis
- pages: 45.2 KB
- components: 123.4 KB
- lib: 12.1 KB
- node_modules: 234.5 KB

Total: 415.2 KB (gzipped: 112 KB)
```

### Runtime Performance Profiling

```typescript
// Profile component renders
function useRenderTime(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      if (duration > 16) { // Flag renders > 60fps
        logger.warn(`Slow render: ${componentName}`, {
          duration,
          threshold: 16,
        })
      }
    }
  }, [componentName])
}
```

---

## Backup & Disaster Recovery

### Automated Backups

**Supabase Backup Settings:**

```sql
-- Enable automated daily backups
-- Retention: 30 days
-- Backup window: 1:00 AM UTC

-- Verify backup status
SELECT * FROM pg_basebackup();

-- Restore from backup
-- Go to Supabase > Settings > Backups > Restore
```

### Database Migration Strategy

**Zero-Downtime Migration:**

```sql
-- 1. Create new table (shadow table)
CREATE TABLE habits_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color_idx INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Copy data from old table
INSERT INTO habits_v2 
SELECT id, user_id, name, icon, color_idx, created_at 
FROM habits;

-- 3. Create indexes on new table
CREATE INDEX idx_habits_v2_user_id ON habits_v2(user_id);

-- 4. Update views to use new table
CREATE OR REPLACE VIEW habits_view AS SELECT * FROM habits_v2;

-- 5. Update application to use new table
-- Deploy code changes pointing to habits_v2

-- 6. Drop old table (after code deployment)
DROP TABLE habits CASCADE;

-- 7. Rename new table
ALTER TABLE habits_v2 RENAME TO habits;
```

### Disaster Recovery Plan

**RTO/RPO Targets:**
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 1 hour

**Recovery Procedures:**

```bash
#!/bin/bash
# disaster-recovery.sh

# 1. Check backup status
aws s3 ls s3://habit-rabbit-backups/ --recursive --human-readable

# 2. Download latest backup
aws s3 cp s3://habit-rabbit-backups/latest.sql backup.sql

# 3. Restore to new database
psql -h new-db.supabase.co -U postgres < backup.sql

# 4. Verify data integrity
psql -h new-db.supabase.co -U postgres -c "SELECT COUNT(*) FROM habits;"

# 5. Update DNS to point to new database
# Update .env.production with new database URL

# 6. Deploy with new database
vercel env add NEXT_PUBLIC_SUPABASE_URL https://new-db.supabase.co
git commit --allow-empty -m "Disaster recovery deployment"
git push origin main
```

---

## DNS & CDN Configuration

### CloudFlare Setup

**DNS Configuration:**

```
Habit Rabbit DNS Records:
┌─────────────────────────────────────┐
│ Type  │ Name      │ Value           │
├─────────────────────────────────────┤
│ A     │ @         │ 76.76.19.21     │ (Vercel IP)
│ CNAME │ www       │ cname.vercel... │
│ MX    │ @         │ mx.google.com   │
│ TXT   │ @         │ google-site...  │
│ TXT   │ _dmarc    │ DMARC policy    │
└─────────────────────────────────────┘
```

**CloudFlare Rules:**

```json
{
  "rules": [
    {
      "name": "Force HTTPS",
      "expression": "cf.threat_score > 0",
      "actions": ["Redirect to HTTPS"]
    },
    {
      "name": "Cache Static Assets",
      "expression": "cf.cache_status == 'HIT'",
      "cache": {
        "default_ttl": 86400,
        "browser_ttl": 3600
      }
    },
    {
      "name": "Rate Limiting",
      "expression": "cf.threat_score > 50",
      "rate_limit": 50
    }
  ]
}
```

**Caching Strategy:**

```
Cache-Control Headers:

Static Assets (images, CSS, JS):
  Cache-Control: max-age=31536000, immutable

HTML (app shell):
  Cache-Control: max-age=3600, must-revalidate

API Responses:
  Cache-Control: max-age=60, s-maxage=300

Dynamic Content:
  Cache-Control: no-cache, must-revalidate
```

---

## Multi-Region Deployment

### Global Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Vercel Edge (Global CDN)                               │
│  ├─ US East (Primary)                                  │
│  ├─ US West                                            │
│  ├─ Europe (Frankfurt)                                 │
│  ├─ Asia Pacific (Singapore)                           │
│  └─ South America (São Paulo)                          │
└──────────────┬──────────────────────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Supabase US  │  │Supabase EU   │
│ (Primary)    │  │ (Replica)    │
└──────────────┘  └──────────────┘
      │
      ▼
  PostgreSQL Replication
```

### Application Routing

```typescript
// lib/regional-routing.ts
type Region = 'us' | 'eu' | 'asia'

const regionEndpoints: Record<Region, string> = {
  us: process.env.NEXT_PUBLIC_SUPABASE_URL_US!,
  eu: process.env.NEXT_PUBLIC_SUPABASE_URL_EU!,
  asia: process.env.NEXT_PUBLIC_SUPABASE_URL_ASIA!,
}

function getRegion(): Region {
  const country = getCountryFromCloudflare()
  
  if (['DE', 'FR', 'UK', 'IT'].includes(country)) {
    return 'eu'
  }
  if (['SG', 'JP', 'IN', 'AU'].includes(country)) {
    return 'asia'
  }
  return 'us'
}

export function getSupabaseClient() {
  const region = getRegion()
  const url = regionEndpoints[region]
  
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_KEY!)
}
```

---

## Load Testing

### k6 Load Tests

```javascript
// load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 200 },  // Ramp up to 200
    { duration: '5m', target: 200 },  // Stay at 200
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
}

export default function () {
  // Sign in
  const loginRes = http.post(
    'https://habitrabbit.app/auth/signin',
    {
      email: `user${__VU}@test.com`,
      password: 'testpass123',
    }
  )
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  })

  const token = loginRes.json('session.access_token')
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  // Load habits
  const habitRes = http.get(
    'https://habitrabbit.app/api/habits',
    authHeaders
  )
  
  check(habitRes, {
    'habits status is 200': (r) => r.status === 200,
    'habits response < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)

  // Create habit
  const createRes = http.post(
    'https://habitrabbit.app/api/habits',
    {
      name: 'Test Habit',
      icon: '💪',
    },
    authHeaders
  )

  check(createRes, {
    'create habit status is 201': (r) => r.status === 201,
  })

  sleep(2)
}
```

**Run Tests:**

```bash
k6 run load-test.js

# Cloud testing
k6 cloud load-test.js

# With custom thresholds
k6 run --vus 50 --duration 30s load-test.js
```

---

## Incident Response

### Incident Management Process

**Severity Levels:**

```
CRITICAL (P1):
- App completely down
- Data loss occurring
- Security breach active
- RTO: 15 minutes

HIGH (P2):
- Core features unavailable
- Severe performance degradation
- Auth not working
- RTO: 1 hour

MEDIUM (P3):
- Minor features broken
- Performance issues
- Non-critical errors
- RTO: 4 hours

LOW (P4):
- UI issues
- Documentation gaps
- Minor bugs
- RTO: 1 week
```

### Runbooks

**Database Connection Loss:**

```markdown
## Database Connection Lost

### Symptoms
- 500 errors on all database queries
- Sentry reports "connection refused"
- Datadog shows 100% error rate

### Root Cause
- Database unavailable
- Network connectivity issue
- Connection pool exhausted

### Response
1. Check Supabase status page
2. Verify CloudFlare status
3. Check application logs in Datadog
4. If DB down: Contact Supabase support
5. If network issue: Check CloudFlare firewall rules
6. If connection pool: Restart application

### Recovery
- Clear connection pool: Restart Vercel deployment
- Update DNS if regional failover: Update CNAME
- Verify data integrity after recovery
```

**High Error Rate:**

```markdown
## High Error Rate (>5%)

### Steps
1. Check Sentry for error patterns
2. Identify affected feature/endpoint
3. Check recent deployments
4. Rollback if needed: `vercel rollback`
5. Check database performance
6. Monitor error rate for 15 minutes
7. Notify team on Slack
```

**Mobile App Crashes:**

```markdown
## iOS/Android App Crash

### Steps
1. Get crash reports from TestFlight/Play Store
2. Reproduce locally in emulator
3. Check Sentry for stack traces
4. Create hotfix branch
5. Test thoroughly in emulator + device
6. Build new version
7. Submit to TestFlight/internal track
8. Test with beta users
9. Promote to production
```

### Post-Incident Review

**Template:**

```markdown
# Incident Postmortem

**Date:** 2026-06-15  
**Duration:** 45 minutes  
**Severity:** P2  

## What Happened
[Description of incident]

## Timeline
- 14:32 UTC: Alert triggered
- 14:35 UTC: Team notified
- 14:40 UTC: Root cause identified
- 14:45 UTC: Fix deployed
- 14:50 UTC: Monitoring verified recovery

## Root Cause
[Technical root cause analysis]

## Impact
- 2,500 affected users
- ~45 minutes downtime
- No data loss

## Action Items
1. [Prevent root cause] - Owner: [Name] - Due: [Date]
2. [Improve monitoring] - Owner: [Name] - Due: [Date]
3. [Update runbook] - Owner: [Name] - Due: [Date]

## Lessons Learned
- What went well
- What could be improved
- Process improvements
```

---

## Conclusion

This advanced deployment guide provides enterprise-level infrastructure guidance for Habit Rabbit. Key points:

1. **CI/CD**: Automate testing, building, and deployment
2. **Monitoring**: Track errors, performance, and user behavior
3. **Scaling**: Prepare for growth with databases, CDN, and regions
4. **Reliability**: Implement backups, disaster recovery, and incident response
5. **Performance**: Optimize queries, cache assets, monitor Web Vitals

For further details, consult:
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Sentry Documentation: https://docs.sentry.io
- Datadog Documentation: https://docs.datadoghq.com

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-06-02
